import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { apiRequest } from '../utils/api';

const DrinksManagement = () => {
  const [drinks, setDrinks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentDrink, setCurrentDrink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Alcoholic',
    price: '',
    cost: '',
    stock_quantity: 0,
    min_stock_level: 5,
    description: '',
    is_available: true
  });

  // Fetch drinks on component mount
  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/drinks');
      if (response.ok) {
        try {
          const data = await response.json();
          if (data && data.success) {
            // Map drink_name to name for frontend display
            const mappedDrinks = (data.data || []).map(drink => ({
              ...drink,
              name: drink.drink_name || drink.name
            }));
            setDrinks(mappedDrinks);
            setError('');
          } else {
            setError(data?.message || 'Failed to fetch drinks');
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          setError('Error parsing server response');
        }
      } else {
        if (response.status === 401) {
          setError('Unauthorized: Please login first');
        } else if (response.status === 404) {
          setError('Drinks endpoint not found');
        } else {
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error: ' + err.message);
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

      const drinkData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock_level: parseInt(formData.min_stock_level)
      };

      let response;
      if (modalMode === 'add') {
        response = await apiRequest('/drinks', {
          method: 'POST',
          body: JSON.stringify(drinkData)
        });
      } else {
        response = await apiRequest(`/drinks/${currentDrink.id}`, {
          method: 'PUT',
          body: JSON.stringify(drinkData)
        });
      }

      if (response.ok) {
        try {
          const data = await response.json();
          if (data && data.success) {
            await fetchDrinks();
            closeModal();
            alert(`Drink ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
          } else {
            setError(data?.message || `Failed to ${modalMode} drink`);
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          setError('Error parsing server response');
        }
      } else {
        try {
          const errorData = await response.json();
          setError(errorData?.message || `Server error: ${response.status} ${response.statusText}`);
        } catch (parseError) {
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      setError(`Error ${modalMode === 'add' ? 'adding' : 'updating'} drink: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (drinkId) => {
    if (!confirm('Are you sure you want to delete this drink?')) return;

    try {
      setLoading(true);
      const response = await apiRequest(`/drinks/${drinkId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        try {
          const data = await response.json();
          if (data && data.success) {
            await fetchDrinks();
            alert('Drink deleted successfully!');
          } else {
            setError(data?.message || 'Failed to delete drink');
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          setError('Error parsing server response');
        }
      } else {
        try {
          const errorData = await response.json();
          setError(errorData?.message || `Server error: ${response.status} ${response.statusText}`);
        } catch (parseError) {
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      setError('Error deleting drink: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, drink = null) => {
    setModalMode(mode);
    setCurrentDrink(drink);
    if (mode === 'edit' && drink) {
      setFormData({
        name: drink.name || '',
        category: drink.category || 'Alcoholic',
        price: drink.price || '',
        cost: drink.cost || '',
        stock_quantity: drink.stock_quantity || 0,
        min_stock_level: drink.min_stock_level || 5,
        description: drink.description || '',
        is_available: drink.is_available !== false
      });
    } else {
      setFormData({
        name: '',
        category: 'Alcoholic',
        price: '',
        cost: '',
        stock_quantity: 0,
        min_stock_level: 5,
        description: '',
        is_available: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDrink(null);
    setError('');
  };

  const getStockStatus = (drink) => {
    if (drink.stock_quantity <= 0) {
      return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    } else if (drink.stock_quantity <= drink.min_stock_level) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    } else {
      return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
    }
  };

  const getAvailabilityColor = (isAvailable) => {
    return isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Drinks Menu ({drinks.length})</h3>
        <button
          onClick={() => openModal('add')}
          className="flex items-center px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Drink
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Drinks Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading && drinks.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Loading drinks...</div>
        ) : drinks.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No drinks found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drinks.map((drink) => {
                  const stockStatus = getStockStatus(drink);
                  return (
                    <tr key={drink.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {drink.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {drink.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₦{drink.price || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {drink.stock_quantity || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAvailabilityColor(drink.is_available)}`}>
                          {drink.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('edit', drink)}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={loading}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(drink.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {modalMode === 'add' ? 'Add New Drink' : 'Edit Drink'}
            </h3>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drink Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  required
                >
                  <option value="Alcoholic">Alcoholic</option>
                  <option value="Non-Alcoholic">Non-Alcoholic</option>
                  <option value="Beer">Beer</option>
                  <option value="Wine">Wine</option>
                  <option value="Cocktail">Cocktail</option>
                  <option value="Soft Drink">Soft Drink</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Tea">Tea</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price *
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
                    Cost Price
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    name="min_stock_level"
                    value={formData.min_stock_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
                  rows="3"
                  placeholder="Drink description..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_available"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#7B3F00] focus:ring-[#7B3F00] border-gray-300 rounded"
                />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                  Available for sale
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
                  {loading ? 'Saving...' : modalMode === 'add' ? 'Add Drink' : 'Update Drink'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrinksManagement;