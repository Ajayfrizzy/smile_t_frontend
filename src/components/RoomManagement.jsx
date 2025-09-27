import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../utils/api';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    room_number: '',
    type: 'Classic Single',
    price: '',
    max_occupancy: 1,
    amenities: '',
    description: '',
    status: 'Available'
  });

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/rooms');
      if (response && response.success) {
        setRooms(response.data || []);
        setError('');
      } else {
        setError(response?.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Error fetching rooms: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const roomData = {
        ...formData,
        price: parseFloat(formData.price),
        max_occupancy: parseInt(formData.max_occupancy)
      };

      let response;
      if (modalMode === 'add') {
        response = await apiRequest('/rooms', {
          method: 'POST',
          body: JSON.stringify(roomData)
        });
      } else {
        response = await apiRequest(`/rooms/${currentRoom.id}`, {
          method: 'PUT',
          body: JSON.stringify(roomData)
        });
      }

      if (response && response.success) {
        await fetchRooms();
        closeModal();
        alert(`Room ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
      } else {
        setError(response?.message || `Failed to ${modalMode} room`);
      }
    } catch (err) {
      setError(`Error ${modalMode === 'add' ? 'adding' : 'updating'} room: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      setLoading(true);
      const response = await apiRequest(`/rooms/${roomId}`, {
        method: 'DELETE'
      });

      if (response && response.success) {
        await fetchRooms();
        alert('Room deleted successfully!');
      } else {
        setError(response?.message || 'Failed to delete room');
      }
    } catch (err) {
      setError('Error deleting room: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, room = null) => {
    setModalMode(mode);
    setCurrentRoom(room);
    if (mode === 'edit' && room) {
      setFormData({
        room_number: room.room_number || '',
        type: room.type || 'Classic Single',
        price: room.price || '',
        max_occupancy: room.max_occupancy || 1,
        amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities || '',
        description: room.description || '',
        status: room.status || 'Available'
      });
    } else {
      setFormData({
        room_number: '',
        type: 'Classic Single',
        price: '',
        max_occupancy: 1,
        amenities: '',
        description: '',
        status: 'Available'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRoom(null);
    setError('');
    // Reset form to prevent controlled input warnings
    setFormData({
      room_number: '',
      type: 'Classic Single',
      price: '',
      max_occupancy: 1,
      amenities: '',
      description: '',
      status: 'Available'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Occupied':
        return 'bg-red-100 text-red-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Rooms ({rooms.length})</h3>
        <button
          onClick={() => openModal('add')}
          className="flex items-center px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading && rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No rooms found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Night
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
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
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₦{room.price || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.max_occupancy || 1} guest{room.max_occupancy > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(room.status)}`}>
                        {room.status || 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('edit', room)}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
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
              {modalMode === 'add' ? 'Add New Room' : 'Edit Room'}
            </h3>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                  placeholder="e.g., 101, 201A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                >
                  <option value="Classic Single">Classic Single</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Deluxe Large">Deluxe Large</option>
                  <option value="Business Suite">Business Suite</option>
                  <option value="Executive Suite">Executive Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Night *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Occupancy *
                </label>
                <input
                  type="number"
                  name="max_occupancy"
                  value={formData.max_occupancy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities
                </label>
                <textarea
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  rows="3"
                  placeholder="WiFi, TV, AC, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Reserved">Reserved</option>
                </select>
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
                  {loading ? 'Saving...' : modalMode === 'add' ? 'Add Room' : 'Update Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;