import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../utils/api';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentStaff, setCurrentStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    staff_id: '',
    role: 'receptionist',
    password: '',
    is_active: true
  });

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/staff');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data && data.success) {
        setStaff(data.data || []);
        setError('');
      } else {
        setError(data?.message || 'Failed to fetch staff');
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Error fetching staff: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const staffData = {
        ...formData
      };

      let response;
      if (modalMode === 'add') {
        response = await apiRequest('/staff', {
          method: 'POST',
          body: JSON.stringify(staffData)
        });
      } else {
        // Remove password from update if it's empty
        if (!staffData.password) {
          delete staffData.password;
        }
        response = await apiRequest(`/staff/${currentStaff.id}`, {
          method: 'PUT',
          body: JSON.stringify(staffData)
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.success) {
        await fetchStaff();
        closeModal();
        alert(`Staff ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
      } else {
        setError(data?.message || `Failed to ${modalMode} staff`);
      }
    } catch (err) {
      setError(`Error ${modalMode === 'add' ? 'adding' : 'updating'} staff: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      setLoading(true);
      const response = await apiRequest(`/staff/${staffId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.success) {
        await fetchStaff();
        alert('Staff deleted successfully!');
      } else {
        setError(data?.message || 'Failed to delete staff');
      }
    } catch (err) {
      setError('Error deleting staff: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, staffMember = null) => {
    setModalMode(mode);
    setCurrentStaff(staffMember);
    if (mode === 'edit' && staffMember) {
      setFormData({
        name: staffMember.name || '',
        staff_id: staffMember.staff_id || '',
        role: staffMember.role || 'receptionist',
        password: '', // Don't populate password for edit
        is_active: staffMember.is_active !== false
      });
    } else {
      setFormData({
        name: '',
        staff_id: '',
        role: 'receptionist',
        password: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStaff(null);
    setError('');
    setShowPassword(false);
    // Reset form to prevent controlled input warnings
    setFormData({
      name: '',
      staff_id: '',
      role: 'receptionist',
      email: '',
      phone: '',
      password: '',
      is_active: true
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'receptionist':
        return 'bg-green-100 text-green-800';
      case 'barmen':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Staff ({staff.length})</h3>
        <button
          onClick={() => openModal('add')}
          className="flex items-center px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading && staff.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No staff found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {staffMember.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staffMember.staff_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(staffMember.role)}`}>
                        {staffMember.role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staffMember.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staffMember.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        staffMember.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {staffMember.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('edit', staffMember)}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(staffMember.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">
              {modalMode === 'add' ? 'Add New Staff' : 'Edit Staff'}
            </h3>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff ID *
                </label>
                <input
                  type="text"
                  name="staff_id"
                  value={formData.staff_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                  placeholder="Enter unique staff ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                >
                  <option value="receptionist">Receptionist</option>
                  <option value="barmen">Barmen</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {modalMode === 'add' ? '*' : '(leave blank to keep current)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00] pr-10"
                    required={modalMode === 'add'}
                    placeholder={modalMode === 'add' ? "Enter password" : "Enter new password (optional)"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#7B3F00] focus:ring-[#7B3F00] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active Staff Member
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : modalMode === 'add' ? 'Add Staff' : 'Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;