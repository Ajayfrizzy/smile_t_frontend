import React, { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import BookingActions from "../components/BookingActions";
import DrinkSalesActions from "../components/DrinkSalesActions";
const user = { role: "superadmin" };

export default function SuperAdminDashboard() {
  return (
    <DashboardLayout>
  <h1 className="text-3xl font-bold mb-6 text-[#7B3F00]">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#7B3F00]">Staff Management</h2>
          <StaffManagement />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#7B3F00]">Room Management</h2>
          {/* Room CRUD table & actions here */}
          <button>Add Room</button>
          <button>Edit Room</button>
          <button>Delete Room</button>
          <BookingActions role={user.role} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#7B3F00]">Drinks Management</h2>
          {/* Drinks CRUD table & actions here */}
          <button>Add Drink</button>
          <button>Edit Drink</button>
          <button>Delete Drink</button>
          <DrinkSalesActions role={user.role} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#7B3F00]">Transactions & Analytics</h2>
          {/* Transactions, analytics, export reports here */}
          <div>Bookings Trend Chart</div>
          <div>Total Revenue</div>
          <div>Occupancy Rate</div>
          <div>Bar Sales Chart</div>
          <button>Export Bookings (Excel)</button>
          <button>Export Bar Sales (PDF)</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: "", staff_id: "", password: "", role: "receptionist" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchStaff = () => {
  fetch("/staff")
      .then((res) => res.json())
      .then((data) => setStaff(data));
  };
  useEffect(fetchStaff, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
  const res = await fetch("/staff", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      });
      if (res.ok) {
        setMessage(editingId ? "Staff updated!" : "Staff added!");
        setForm({ name: "", staff_id: "", password: "", role: "receptionist" });
        setEditingId(null);
        fetchStaff();
      } else {
        setMessage("Error saving staff");
      }
    } catch (err) {
      setMessage("Error saving staff");
    }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, staff_id: s.staff_id, password: "", role: s.role });
    setEditingId(s.id);
  };

  const handleDelete = async (id) => {
    setMessage("");
    try {
  const res = await fetch(`/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Staff deleted!");
        fetchStaff();
      } else {
        setMessage("Error deleting staff");
      }
    } catch (err) {
      setMessage("Error deleting staff");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border rounded px-3 py-2" required />
        <input name="staff_id" value={form.staff_id} onChange={handleChange} placeholder="Staff ID" className="border rounded px-3 py-2" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" className="border rounded px-3 py-2" required={!editingId} />
        <select name="role" value={form.role} onChange={handleChange} className="border rounded px-3 py-2" required>
          <option value="superadmin">SuperAdmin</option>
          <option value="supervisor">Supervisor</option>
          <option value="receptionist">Receptionist</option>
          <option value="barmen">Barman</option>
        </select>
  <button type="submit" className="bg-[#7B3F00] text-white px-4 py-2 rounded hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300">{editingId ? "Update Staff" : "Add Staff"}</button>
  {message && <div className="col-span-2 text-[#7B3F00] font-semibold">{message}</div>}
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-[#7B3F00] text-white">
            <th>Name</th>
            <th>Staff ID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-b">
              <td>{s.name}</td>
              <td>{s.staff_id}</td>
              <td>{s.role}</td>
              <td>
                <button className="text-[#7B3F00] mr-2 hover:text-[#FFD700] transition-colors duration-300" onClick={() => handleEdit(s)}>
                  Edit
                </button>
                <button className="text-[#FFD700]" onClick={() => handleDelete(s.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

