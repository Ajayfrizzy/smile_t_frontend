import React, { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

export default function BarmenDashboard() {
  return (
    <DashboardLayout>
  <h1 className="text-3xl font-bold mb-6 text-[#7B3F00]">Barmen Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold mb-4 text-[#7B3F00]">Drink Sales</h2>
        <DrinkSaleForm />
        <InventoryList />
        <BarSalesTable />
      </div>
    </DashboardLayout>
  );
}

function DrinkSaleForm() {
  const [form, setForm] = useState({ drink_id: "", drink_name: "", amount: "", quantity: 1 });
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const staffId = "barmen1"; // Replace with actual staff ID from auth

  useEffect(() => {
  fetch("/drinks")
      .then((res) => res.json())
      .then((data) => setDrinks(data));
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
  const res = await fetch("/drinks/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, staff_id: staffId }),
      });
      if (res.ok) {
        setMessage("Sale recorded!");
        setForm({ drink_id: "", drink_name: "", amount: "", quantity: 1 });
      } else {
        setMessage("Error recording sale");
      }
    } catch (err) {
      setMessage("Error recording sale");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <select name="drink_id" value={form.drink_id} onChange={handleChange} className="border rounded px-3 py-2" required>
        <option value="">Select Drink</option>
        {drinks.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} - ₦{d.price}
          </option>
        ))}
      </select>
      <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" className="border rounded px-3 py-2" required />
      <input name="quantity" value={form.quantity} onChange={handleChange} type="number" min="1" className="border rounded px-3 py-2" required />
  <button type="submit" className="bg-[#7B3F00] text-white px-4 py-2 rounded hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300" disabled={loading}>
        {loading ? "Recording..." : "Record Sale"}
      </button>
  {message && <div className="col-span-2 text-[#7B3F00] font-semibold">{message}</div>}
    </form>
  );
}

function InventoryList() {
  const [drinks, setDrinks] = useState([]);
  useEffect(() => {
  fetch("/drinks")
      .then((res) => res.json())
      .then((data) => setDrinks(data));
  }, []);
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Inventory</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {drinks.map((d) => (
          <li key={d.id} className="bg-white rounded shadow p-2">
            <span className="font-bold text-[#7B3F00]">{d.name}</span> — ₦{d.price} (Qty: {d.quantity})
          </li>
        ))}
      </ul>
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
