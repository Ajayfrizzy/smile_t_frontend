import React, { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

export default function SupervisorDashboard() {
  return (
    <DashboardLayout>
  <h1 className="text-3xl font-bold mb-6 text-[#7B3F00]">Supervisor Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-4 text-[#7B3F00]">View Only</h2>
        <BookingsTable />
        <TransactionsTable />
        <BarSalesTable />
      </div>
    </DashboardLayout>
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

function TransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
  fetch("/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data.bookings || []));
  }, []);
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Transactions</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-[#7B3F00] text-white">
            <th>ID</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Staff</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b">
              <td>{t.id}</td>
              <td>{t.type}</td>
              <td>₦{t.amount}</td>
              <td>{t.date}</td>
              <td>{t.staff_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarSalesTable() {
  const [sales, setSales] = useState([]);
  useEffect(() => {
  fetch("/transactions/bar")
      .then((res) => res.json())
      .then((data) => setSales(data.barSales || []));
  }, []);
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Bar Sales</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-[#7B3F00] text-white">
            <th>Drink</th>
            <th>Amount</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Staff</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className="border-b">
              <td>{s.drink_name}</td>
              <td>₦{s.amount}</td>
              <td>{s.quantity}</td>
              <td>{s.date}</td>
              <td>{s.staff_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
