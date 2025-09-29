import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { ROOM_TYPES, getRoomTypeById } from '../utils/roomTypes';

const RoomInventoryManagement = () => {
  const [roomInventory, setRoomInventory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentInventory, setCurrentInventory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [formData, setFormData] = useState({
    room_type_id: '',
    available_rooms: 0,
    total_rooms: 0,
    status: 'Available'
  });

  // Fetch room inventory on component mount
  useEffect(() => {
    fetchRoomInventory();
  }, []);

  const fetchRoomInventory = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/room-inventory');
      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          setRoomInventory(data.data || []);
          setError('');
        } else {
          setError(data?.message || 'Failed to fetch room inventory');
        }
      } else {
        setError('Failed to fetch room inventory');
      }
    } catch (err) {
      console.error('Error fetching room inventory:', err);
      setError('Error fetching room inventory: ' + err.message);
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

    // Update selected room type when room type changes
    if (name === 'room_type_id') {
      const roomType = getRoomTypeById(value);
      setSelectedRoomType(roomType);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const inventoryData = {
        ...formData,
        available_rooms: parseInt(formData.available_rooms),
        total_rooms: parseInt(formData.total_rooms)
      };

      let response;
      if (modalMode === 'add') {
        response = await apiRequest('/room-inventory', {
          method: 'POST',
          body: JSON.stringify(inventoryData)
        });
      } else {
        response = await apiRequest(`/room-inventory/${currentInventory.id}`, {
          method: 'PUT',
          body: JSON.stringify(inventoryData)
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          // Optimistic update - update UI immediately without API call
          if (modalMode === 'add') {
            const newInventory = {
              id: Date.now(), // Temporary ID
              ...inventoryData,
              room_type_details: getRoomTypeById(inventoryData.room_type_id),
              is_active: true
            };
            setRoomInventory(prev => [...prev, newInventory]);
          } else {
            setRoomInventory(prev => prev.map(inventory => 
              inventory.id === currentInventory.id 
                ? { ...inventory, ...inventoryData }
                : inventory
            ));
          }
          closeModal();
          
          // Show success message without blocking UI
          setTimeout(() => {
            alert(`Room inventory ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
          }, 100);
          
          // Refresh data in background to sync with server
          fetchRoomInventory();
        } else {
          setError(data?.message || `Failed to ${modalMode} room inventory`);
        }
      } else {
        setError(`Failed to ${modalMode} room inventory`);
      }
    } catch (err) {
      setError(`Error ${modalMode === 'add' ? 'adding' : 'updating'} room inventory: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (inventoryId) => {
    if (!confirm('Are you sure you want to delete this room inventory?')) return;

    try {
      setLoading(true);
      const response = await apiRequest(`/room-inventory/${inventoryId}`, {
        method: 'DELETE'
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          // Optimistic delete - remove from UI immediately
          setRoomInventory(prev => prev.filter(inventory => inventory.id !== inventoryId));
          
          // Show success message without blocking UI
          setTimeout(() => {
            alert('Room inventory deleted successfully!');
          }, 100);
        } else {
          setError(data?.message || 'Failed to delete room inventory');
        }
      } else {
        setError('Failed to delete room inventory');
      }
    } catch (err) {
      setError('Error deleting room inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, inventory = null) => {
    setModalMode(mode);
    setCurrentInventory(inventory);
    if (mode === 'edit' && inventory) {
      setFormData({
        room_type_id: inventory.room_type_id || '',
        available_rooms: inventory.available_rooms || 0,
        total_rooms: inventory.total_rooms || 0,
        status: inventory.status || 'Available'
      });
      setSelectedRoomType(getRoomTypeById(inventory.room_type_id));
    } else {
      setFormData({
        room_type_id: '',
        available_rooms: 0,
        total_rooms: 0,
        status: 'Available'
      });
      setSelectedRoomType(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentInventory(null);
    setSelectedRoomType(null);
    setError('');
    // Reset form to prevent controlled input warnings
    setFormData({
      room_type_id: '',
      available_rooms: 0,
      total_rooms: 0,
      status: 'Available'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Fully Booked':
        return 'bg-red-100 text-red-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Room Inventory ({roomInventory.length})</h3>
        <button
          onClick={() => openModal('add')}
          className="flex items-center px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room Type
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Room Inventory Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading && roomInventory.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Loading room inventory...</div>
        ) : roomInventory.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No room inventory found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Night
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Rooms
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
                {roomInventory.map((inventory) => {
                  const roomType = getRoomTypeById(inventory.room_type_id);
                  return (
                    <tr key={inventory.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            className="h-10 w-10 rounded object-cover mr-3" 
                            src={roomType?.image || '/placeholder-room.jpg'} 
                            alt={roomType?.room_type || 'Room'} 
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {roomType?.room_type || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Max {roomType?.max_occupancy || 1} guests
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₦{roomType?.price_per_night?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inventory.available_rooms || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.total_rooms || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {((inventory.total_rooms - inventory.available_rooms) / inventory.total_rooms * 100 || 0).toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${((inventory.total_rooms - inventory.available_rooms) / inventory.total_rooms * 100 || 0)}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inventory.status)}`}>
                          {inventory.status || 'Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('edit', inventory)}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={loading}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inventory.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-medium mb-4">
              {modalMode === 'add' ? 'Add Room Type Inventory' : 'Edit Room Inventory'}
            </h3>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  name="room_type_id"
                  value={formData.room_type_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                >
                  <option value="">Select a room type...</option>
                  {ROOM_TYPES.map((roomType) => (
                    <option key={roomType.id} value={roomType.id}>
                      {roomType.room_type} - ₦{roomType.price_per_night.toLocaleString()}/night
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Type Preview */}
              {selectedRoomType && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Room Type Details:</h4>
                  <div className="flex items-start space-x-4">
                    <img 
                      src={selectedRoomType.image} 
                      alt={selectedRoomType.room_type}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Price:</strong> ₦{selectedRoomType.price_per_night.toLocaleString()}/night
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Max Occupancy:</strong> {selectedRoomType.max_occupancy} guests
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Amenities:</strong> {selectedRoomType.amenities}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Description:</strong> {selectedRoomType.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Rooms *
                  </label>
                  <input
                    type="number"
                    name="total_rooms"
                    value={formData.total_rooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                    min="0"
                    required
                    placeholder="Total number of rooms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Rooms *
                  </label>
                  <input
                    type="number"
                    name="available_rooms"
                    value={formData.available_rooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                    min="0"
                    max={formData.total_rooms || 999}
                    required
                    placeholder="Available rooms"
                  />
                </div>
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
                  <option value="Fully Booked">Fully Booked</option>
                  <option value="Maintenance">Under Maintenance</option>
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
                  {loading ? 'Saving...' : modalMode === 'add' ? 'Add Inventory' : 'Update Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomInventoryManagement;