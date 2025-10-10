import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Package, 
  ShoppingCart,
  Plus,
  Search,
  Eye,
  Wine
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import toast from 'react-hot-toast';

const BarmenDashboard = () => {
  // Get user info from localStorage first
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState('create-sale');
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sales form state
  const [saleForm, setSaleForm] = useState({
    drink_id: '',
    quantity: 1,
    customer_name: '',
    payment_method: 'cash'
  });

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/drinks');
      if (response.success) {
        setDrinks(response.data || []);
      } else {
        toast.error('Failed to fetch drinks');
      }
    } catch (error) {
      console.error('Error fetching drinks:', error);
      toast.error('Error loading drinks');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (settingsForm.newPassword && !settingsForm.currentPassword) {
      toast.error('Current password is required to change password');
      return;
    }

    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    try {
      const payload = {
        name: settingsForm.name
      };

      if (settingsForm.newPassword) {
        payload.currentPassword = settingsForm.currentPassword;
        payload.newPassword = settingsForm.newPassword;
      }

      const response = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Settings updated successfully!');
          // Update user name in localStorage if it was changed
          if (settingsForm.name !== user.name) {
            const updatedUser = { ...user, name: settingsForm.name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload(); // Refresh to update UI
          }
          // Clear password fields
          setSettingsForm(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
        } else {
          toast.error(data.message || 'Failed to update settings');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error('Error updating settings: ' + error.message);
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    
    if (!saleForm.drink_id || !saleForm.quantity || !saleForm.customer_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const selectedDrink = drinks.find(drink => drink.id === parseInt(saleForm.drink_id));
      if (!selectedDrink) {
        toast.error('Selected drink not found');
        return;
      }

      if (selectedDrink.stock_quantity < saleForm.quantity) {
        toast.error(`Insufficient stock. Only ${selectedDrink.stock_quantity} available`);
        return;
      }

      const saleData = {
        drink_id: saleForm.drink_id,
        quantity: saleForm.quantity,
        unit_price: selectedDrink.price,
        total_amount: selectedDrink.price * saleForm.quantity,
        customer_name: saleForm.customer_name,
        payment_method: saleForm.payment_method,
        staff_id: user.id,
        item_name: selectedDrink.name || selectedDrink.drink_name
      };

      const response = await apiRequest('/bar-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (response.success) {
        toast.success('Sale recorded successfully!');
        setSaleForm({
          drink_id: '',
          quantity: 1,
          customer_name: '',
          payment_method: 'cash'
        });
        // Refresh drinks to update stock
        fetchDrinks();
      } else {
        toast.error(response.message || 'Failed to record sale');
      }
    } catch (error) {
      console.error('Error recording sale:', error);
      toast.error('Error recording sale');
    }
  };

  const CreateSaleForm = () => {
    const selectedDrink = drinks.find(drink => drink.id === parseInt(saleForm.drink_id));
    const totalAmount = selectedDrink ? selectedDrink.price * saleForm.quantity : 0;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <ShoppingCart className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Create Drink Sale</h3>
        </div>

        <form onSubmit={handleSaleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drink Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Drink *
              </label>
              <select
                value={saleForm.drink_id}
                onChange={(e) => setSaleForm({...saleForm, drink_id: e.target.value, quantity: 1})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                required
              >
                <option value="">Choose a drink...</option>
                {drinks.filter(drink => drink.stock_quantity > 0).map(drink => (
                  <option key={drink.id} value={drink.id}>
                    {drink.name || drink.drink_name} - ₦{drink.price} (Stock: {drink.stock_quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                max={selectedDrink ? selectedDrink.stock_quantity : 1}
                value={saleForm.quantity}
                onChange={(e) => setSaleForm({...saleForm, quantity: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                required
              />
              {selectedDrink && (
                <p className="text-sm text-gray-500 mt-1">
                  Available stock: {selectedDrink.stock_quantity}
                </p>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={saleForm.customer_name}
                onChange={(e) => setSaleForm({...saleForm, customer_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                placeholder="Enter customer name"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={saleForm.payment_method}
                onChange={(e) => setSaleForm({...saleForm, payment_method: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>

          {/* Sale Summary */}
          {selectedDrink && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Sale Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Drink:</span>
                  <span className="font-medium">{selectedDrink.name || selectedDrink.drink_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">₦{selectedDrink.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{saleForm.quantity}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium text-gray-900">Total Amount:</span>
                  <span className="font-bold text-lg text-[#7B3F00]">₦{totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-[#7B3F00] text-white px-6 py-3 rounded-lg hover:bg-[#8B4513] transition-colors font-medium"
            >
              Record Sale
            </button>
            <button
              type="button"
              onClick={() => setSaleForm({
                drink_id: '',
                quantity: 1,
                customer_name: '',
                payment_method: 'cash'
              })}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    );
  };

  const DrinksInventory = () => {
    const filteredDrinks = drinks.filter(drink =>
      (drink.name || drink.drink_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Available Drinks</h3>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search drinks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B3F00]"></div>
            </div>
          ) : filteredDrinks.length === 0 ? (
            <div className="text-center py-8">
              <Wine className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No drinks found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Drink Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrinks.map((drink) => (
                    <tr key={drink.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                            <Wine className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {drink.name || drink.drink_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">₦{drink.price}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          drink.stock_quantity === 0 ? 'text-red-600' :
                          drink.stock_quantity <= (drink.min_stock_level || 5) ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {drink.stock_quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          drink.stock_quantity === 0 
                            ? 'bg-red-100 text-red-800' 
                            : drink.stock_quantity <= (drink.min_stock_level || 5)
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {drink.stock_quantity === 0 
                            ? 'Out of Stock' 
                            : drink.stock_quantity <= (drink.min_stock_level || 5)
                            ? 'Low Stock'
                            : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Settings = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Settings</h3>
      
      <form onSubmit={handleSettingsSubmit} className="space-y-6">
        {/* Profile Settings */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Profile Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={settingsForm.name}
                onChange={(e) => setSettingsForm(prev => ({...prev, name: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Password Settings */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settingsForm.currentPassword}
                  onChange={(e) => setSettingsForm(prev => ({...prev, currentPassword: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settingsForm.newPassword}
                  onChange={(e) => setSettingsForm(prev => ({...prev, newPassword: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settingsForm.confirmPassword}
                  onChange={(e) => setSettingsForm(prev => ({...prev, confirmPassword: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-[#7B3F00] text-white px-6 py-3 rounded-lg hover:bg-[#8B4513] transition-colors font-medium"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => setSettingsForm({
              name: user.name || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            })}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'create-sale':
        return <CreateSaleForm />;
      case 'view-inventory':
        return <DrinksInventory />;
      case 'settings':
        return <Settings />;
      default:
        return <CreateSaleForm />;
    }
  };

  return (
    <DashboardLayout
      userRole={user.role}
      userName={user.name}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default BarmenDashboard;