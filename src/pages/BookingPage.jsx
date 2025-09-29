import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import Button from "../components/Button";
import BookingReceipt from "./BookingReceipt";
import { apiRequest } from "../utils/api";
import { loadFlutterwave, openFlutterwaveCheckout } from "../utils/flutterwave";

const generateReference = () =>
  `BK-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const BookingPage = () => {
  const user = null;
  const authLoading = false;

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    room_id: "",
    check_in: "",
    check_out: "",
    guests: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // Prefill from user profile when available
    if (user) {
      setForm((f) => ({
        ...f,
        guest_name: user.name || "",
        guest_email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        // Use the room inventory endpoint
        const response = await apiRequest("/room-inventory/available");
        
        if (response && response.ok) {
          const data = await response.json();
          if (data && data.success && data.data) {
            setRooms(data.data);
          } else {
            setRooms([]);
          }
        } else {
          setRooms([]);
        }
      } catch (err) {
        console.error("Error fetching rooms", err);
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, []);

  const nights = useMemo(() => {
    if (!form.check_in || !form.check_out) return 0;
    const ci = new Date(form.check_in);
    const co = new Date(form.check_out);
    const diff = (co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  }, [form.check_in, form.check_out]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === form.room_id),
    [rooms, form.room_id]
  );

  // Calculate base total and fee for display before backend response
  const baseTotal = useMemo(() => {
    if (!selectedRoom || nights <= 0) return 0;
    return Number((selectedRoom.price * nights).toFixed(2));
  }, [selectedRoom, nights]);
  const transactionFee = useMemo(() => Number((baseTotal * 0.02).toFixed(2)), [baseTotal]);
  const total = useMemo(() => baseTotal + transactionFee, [baseTotal, transactionFee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFormError("");
  };

  const validate = () => {
    if (!form.guest_name.trim()) return "Please provide guest name";
    if (!form.guest_email.trim() || !form.guest_email.includes("@"))
      return "Please provide a valid email";
    if (!form.guest_phone.trim()) return "Please provide phone number";
    if (!form.check_in || !form.check_out)
      return "Please select check-in and check-out dates";
    if (new Date(form.check_in) >= new Date(form.check_out))
      return "Check-out must be after check-in";
    if (!form.room_id) return "Please select a room";
    if (nights <= 0) return "Invalid date range";
    return null;
  };

  const checkAvailability = async () => {
    try {
      const resp = await apiRequest(
        `/room-inventory/check-availability?room_type_id=${form.room_id}&check_in=${form.check_in}&check_out=${form.check_out}`
      );
      if (!resp.ok) throw new Error("Could not verify availability");
      const result = await resp.json();
      return result.success && result.available;
    } catch (err) {
      console.error("Availability check failed", err);
      toast.error("Could not verify availability, please try again");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authLoading) {
      toast.loading("Waiting for authentication...");
      return;
    }

    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    try {
      const available = await checkAvailability();
      if (!available) {
        toast.error("Selected room is not available for the chosen dates");
        setSubmitting(false);
        return;
      }

      const reference = generateReference();

      const payload = {
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone,
        room_id: form.room_id,
        check_in: form.check_in,
        check_out: form.check_out,
        guests: form.guests,
        status: "pending",
        payment_status: "pending",
        transaction_ref: reference,
      };

      // Let backend calculate totals/fee
      const resp = await apiRequest("/bookings/public", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error("Booking creation failed");
      const { booking, base_total, transaction_fee, total_amount } = await resp.json();
      toast.success("Booking created — reference: " + reference);

      // Payment integration (Flutterwave)
      try {
        await loadFlutterwave();
        const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
        if (!publicKey) throw new Error("Missing Flutterwave public key");
        
        openFlutterwaveCheckout({
          public_key: publicKey,
          tx_ref: reference,
          amount: total_amount,
          currency: "NGN",
          customer: {
            email: form.guest_email,
            phone_number: form.guest_phone,
            name: form.guest_name,
          },
          on_success: async (res) => {
            toast.loading("Verifying payment...");
            const verifyResp = await apiRequest("/flutterwave-verify", {
              method: "POST",
              body: JSON.stringify({
                tx_ref: reference,
                transaction_id: res.transaction_id || res.id,
              }),
            });
            const verifyJson = await verifyResp.json();
            if (verifyResp.ok && verifyJson.status === "success") {
              toast.success("Payment verified — booking confirmed");
              setReceipt({
                ...createdBooking,
                payment_status: "paid",
                status: "confirmed",
              });
              setForm((f) => ({
                ...f,
                room_id: "",
                check_in: "",
                check_out: "",
                guests: 1,
              }));
            } else {
              toast.error("Payment could not be verified. Contact support");
            }
          },
          on_close: () => {
            toast("Payment window closed");
          },
        });
      } catch (err) {
        console.error("Payment error:", err);
        toast.error(err.message || "Could not start payment");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return <BookingReceipt booking={receipt} />;
  }

  return (
    <div className="p-8 animate-fade-in">
      <h2 className="text-3xl font-bold mb-4 text-[#7B3F00] animate-slide-in-left">Booking</h2>

      <p className="mb-8 text-[#7B3F00]/80">
        Book your stay with us — select dates, room and provide guest details.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl animate-slide-in-up animate-delay-200">
        {/* Room Image Section */}
        <div className="order-2 lg:order-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img 
              src="/assets/images/executive_suite_room.jpg" 
              alt="Luxury Hotel Room" 
              className="w-full h-64 md:h-80 lg:h-96 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-[#7B3F00] mb-3">Luxury Suite Experience</h3>
              <p className="text-[#7B3F00]/80 mb-4">
                Experience comfort and elegance in our beautifully appointed rooms featuring modern amenities, 
                premium bedding, and stunning views. Each room is designed to provide you with the perfect blend 
                of luxury and functionality.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                  <span className="text-[#7B3F00]">Free WiFi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                  <span className="text-[#7B3F00]">Air Conditioning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                  <span className="text-[#7B3F00]">Room Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                  <span className="text-[#7B3F00]">Premium TV</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <div className="order-1 lg:order-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-6 rounded-lg shadow-lg"
            noValidate
          >
        {formError && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 border border-red-300 animate-pulse">{formError}</div>
        )}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block mb-1 font-medium text-[#7B3F00]">Guest Name</label>
            <input
              name="guest_name"
              value={form.guest_name}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] ${formError && formError.toLowerCase().includes('name') ? 'border-red-400' : 'border-gray-300'}`}
              aria-invalid={!!formError && formError.toLowerCase().includes('name')}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#7B3F00]">Email</label>
            <input
              name="guest_email"
              value={form.guest_email}
              onChange={handleChange}
              type="email"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] ${formError && formError.toLowerCase().includes('email') ? 'border-red-400' : 'border-gray-300'}`}
              aria-invalid={!!formError && formError.toLowerCase().includes('email')}
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#7B3F00]">Phone</label>
            <input
              name="guest_phone"
              value={form.guest_phone}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] ${formError && formError.toLowerCase().includes('phone') ? 'border-red-400' : 'border-gray-300'}`}
              aria-invalid={!!formError && formError.toLowerCase().includes('phone')}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-[#7B3F00]">Check-in Date</label>
              <input
                name="check_in"
                value={form.check_in}
                onChange={handleChange}
                type="date"
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] ${formError && formError.toLowerCase().includes('date') ? 'border-red-400' : 'border-gray-300'}`}
                aria-invalid={!!formError && formError.toLowerCase().includes('date')}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Check-out Date</label>
              <input
                name="check_out"
                value={form.check_out}
                onChange={handleChange}
                type="date"
                className={`w-full border rounded px-3 py-2 ${formError && formError.toLowerCase().includes('date') ? 'border-red-400' : ''}`}
                aria-invalid={!!formError && formError.toLowerCase().includes('date')}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Room</label>
            {loadingRooms ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner /> Loading rooms...
              </div>
            ) : (
              <select
                name="room_id"
                value={form.room_id}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${formError && formError.toLowerCase().includes('room') ? 'border-red-400' : ''}`}
                aria-invalid={!!formError && formError.toLowerCase().includes('room')}
              >
                <option value="">Select a room</option>
                {rooms.map((r, index) => (
                  <option key={r.id || index} value={r.id || r.room_type}>
                    {r.name || r.type || r.room_type} — ₦{(r.price || r.amount || r.price_per_night)?.toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nights: {nights}</p>
              <p className="text-sm text-gray-600">Room Price: ₦{baseTotal.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Transaction Fee (2%): ₦{transactionFee.toLocaleString()}</p>
              <p className="text-lg font-semibold">Total: ₦{total.toLocaleString()}</p>
            </div>
            <div>
              <Button type="submit" loading={submitting} variant="primary">
                {submitting ? "Booking..." : "Book Now"}
              </Button>
            </div>
          </div>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
