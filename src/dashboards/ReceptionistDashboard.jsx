import React, { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

export default function ReceptionistDashboard() {
  return (
    <DashboardLayout>
  <h1 className="text-3xl font-bold mb-6 text-[#7B3F00]">Receptionist Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-4 text-[#7B3F00]">Bookings & Payments</h2>
        <BookingForm />
        <BookingsTable />
        <RoomsList />
      </div>
    </DashboardLayout>
  );
}

function BookingForm() {
  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    room_id: "",
    check_in: "",
    check_out: "",
    guests: 1,
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
  fetch("/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
  const res = await fetch("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Booking added successfully!");
        setForm({
          guest_name: "",
          guest_email: "",
          guest_phone: "",
          room_id: "",
          check_in: "",
          check_out: "",
          guests: 1,
        });
      } else {
        setMessage("Error adding booking");
      }
    } catch (err) {
      setMessage("Error adding booking");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input name="guest_name" value={form.guest_name} onChange={handleChange} placeholder="Guest Name" className="border rounded px-3 py-2" required />
      <input name="guest_email" value={form.guest_email} onChange={handleChange} placeholder="Email" className="border rounded px-3 py-2" required />
      <input name="guest_phone" value={form.guest_phone} onChange={handleChange} placeholder="Phone" className="border rounded px-3 py-2" required />
      <select name="room_id" value={form.room_id} onChange={handleChange} className="border rounded px-3 py-2" required>
        <option value="">Select Room</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.type} - ₦{r.price}
          </option>
        ))}
      </select>
      <input name="check_in" value={form.check_in} onChange={handleChange} type="date" className="border rounded px-3 py-2" required />
      <input name="check_out" value={form.check_out} onChange={handleChange} type="date" className="border rounded px-3 py-2" required />
      <input name="guests" value={form.guests} onChange={handleChange} type="number" min="1" max="6" className="border rounded px-3 py-2" required />
  <button type="submit" className="bg-[#7B3F00] text-white px-4 py-2 rounded hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300" disabled={loading}>
        {loading ? "Booking..." : "Add Booking"}
      </button>
  {message && <div className="col-span-2 text-[#7B3F00] font-semibold">{message}</div>}
    </form>
  );
}

function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
  fetch("/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data));
  }, []);
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">All Bookings</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-[#7B3F00] text-white">
            <th>Guest</th>
            <th>Email</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Guests</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b">
              <td>{b.guest_name}</td>
              <td>{b.guest_email}</td>
              <td>{b.room_id}</td>
              <td>{b.check_in}</td>
              <td>{b.check_out}</td>
              <td>{b.guests}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoomsList() {
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
  fetch("/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Available Rooms</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {rooms.map((r) => (
          <li key={r.id} className="bg-white rounded shadow p-2">
            <span className="font-bold text-[#7B3F00]">{r.type}</span> — ₦{r.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

