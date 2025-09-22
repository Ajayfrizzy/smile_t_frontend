import React from 'react';

const BookingReceipt = ({ booking }) => {
  if (!booking) return <div>No booking found.</div>;
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-8">
  <h2 className="text-2xl font-bold mb-4 text-hotelBrown">Booking Receipt</h2>
      <div className="mb-4">
        <strong>Reference:</strong> {booking.reference}
      </div>
      <div className="mb-2">
        <strong>Guest Name:</strong> {booking.guest_name}
      </div>
      <div className="mb-2">
        <strong>Email:</strong> {booking.guest_email}
      </div>
      <div className="mb-2">
        <strong>Phone:</strong> {booking.guest_phone}
      </div>
      <div className="mb-2">
        <strong>Room:</strong> {booking.room_name || booking.room_id}
      </div>
      <div className="mb-2">
        <strong>Check-in:</strong> {booking.check_in}
      </div>
      <div className="mb-2">
        <strong>Check-out:</strong> {booking.check_out}
      </div>
      <div className="mb-2">
        <strong>Guests:</strong> {booking.guests}
      </div>
      <div className="mb-2">
        <strong>Total Paid:</strong> ₦{booking.total_amount}
      </div>
      <div className="mb-2">
        <strong>Status:</strong> {booking.status}
      </div>
      <div className="mb-2">
        <strong>Payment Status:</strong> {booking.payment_status}
      </div>
      <div className="mt-4">
  <button onClick={() => window.print()} className="bg-hotelBrown text-white px-4 py-2 rounded hover:bg-hotelGold hover:text-hotelBrown transition-colors duration-300">Print / Save Receipt</button>
      </div>
      <div className="mt-2 text-xs text-gray-500">Show this receipt at the reception for check-in confirmation.</div>
    </div>
  );
};

export default BookingReceipt;
