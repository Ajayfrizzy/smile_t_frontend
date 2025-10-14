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

  const [activeTab, setActiveTab] = useState('overview');
  const [drinks, setDrinks] = useState([]);
  const [barSales, setBarSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    availableDrinks: 0,
    recentSales: []
  });

  // Sales form state - matching backend API expectations
  const [saleForm, setSaleForm] = useState({
    drink_id: '',
    item_name: '',
    quantity: 1,
    price_per_unit: 0,
    total_amount: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [drinksRes, salesRes] = await Promise.allSettled([
        apiRequest('/drinks'),
        apiRequest('/bar-sales')
      ]);

      let calculatedDrinks = [];
      let sales = [];

      // Process drinks data
      if (drinksRes.status === 'fulfilled' && drinksRes.value && drinksRes.value.ok) {
        const drinksData = await drinksRes.value.json();
        calculatedDrinks = drinksData.success ? drinksData.data || [] : [];
        setDrinks(calculatedDrinks);
      }

      // Process sales data from bar-sales endpoint
      if (salesRes.status === 'fulfilled' && salesRes.value && salesRes.value.ok) {
        const salesData = await salesRes.value.json();
        sales = salesData.success ? salesData.data || [] : [];
        setBarSales(sales); // Store all sales for the create-sale view
      }
      
      // Calculate dashboard stats
      const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || sale.amount || 0), 0);
      const availableDrinks = calculatedDrinks.filter(drink => (drink.stock_quantity || 0) > 0).length;
      
      setDashboardStats({
        totalSales,
        totalTransactions: sales.length,
        availableDrinks,
        recentSales: sales.slice(0, 5) // Get last 5 sales
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
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
      setLoading(true);
      const payload = {};

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
          toast.success('Password updated successfully!');
          // Clear password fields without page refresh
          setSettingsForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
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
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate form data
      if (!saleForm.drink_id || !saleForm.quantity) {
        toast.error('Please select a drink and enter quantity');
        setLoading(false);
        return;
      }

      const drinkId = parseInt(saleForm.drink_id);
      const quantity = parseInt(saleForm.quantity);

      if (isNaN(drinkId) || isNaN(quantity) || quantity < 0) {
        toast.error('Please enter valid drink selection and quantity');
        setLoading(false);
        return;
      }
      
      // Prepare sales data to match backend expectations
      const salesData = {
        drink_id: drinkId,
        quantity: quantity
      };
      
      console.log('Sales data being sent:', salesData);
      
      // Use the correct endpoint from backend
      const response = await apiRequest('/bar-sales', {
        method: 'POST',
        body: JSON.stringify(salesData)
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          toast.success('Sale recorded successfully!');
          setShowSalesModal(false);
          resetSalesForm();
          fetchDashboardData(); // Refresh data
        } else {
          toast.error(data?.message || 'Failed to record sale');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData?.message || 'Failed to record sale - please check server connection');
      }
    } catch (error) {
      toast.error('Error recording sale: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSalesForm = () => {
    setSaleForm({
      drink_id: '',
      item_name: '',
      quantity: 1,
      price_per_unit: 0,
      total_amount: 0
    });
  };

  const CreateSaleForm = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Bar Sales Records</h3>
            <button 
              onClick={() => setShowSalesModal(true)}
              className="bg-[#7B3F00] text-white px-4 py-2 rounded-lg hover:bg-[#5d2f00] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Sale
            </button>
          </div>
          
          <div className="border-t pt-4">
            {barSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drink</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff & Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {barSales.map((sale, index) => (
                      <tr key={sale.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {sale.drinks?.name || sale.drinks?.drink_name || sale.drink_name || 'Unknown Drink'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{sale.staff_name || 'Unknown'}</div>
                            <div>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                sale.staff_role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                                sale.staff_role === 'barmen' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {sale.staff_role === 'superadmin' ? '👑 Admin' :
                                 sale.staff_role === 'barmen' ? '🍷 Barman' : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{sale.unit_price?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{sale.total_amount?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No sales recorded</p>
                <p className="text-sm">Start by recording your first sale</p>
              </div>
            )}
          </div>
        </div>
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
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">₦{dashboardStats.totalSales.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalTransactions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Wine className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Drinks</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.availableDrinks}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sales</h3>
              {dashboardStats.recentSales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drink</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff & Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardStats.recentSales.map((sale, index) => (
                        <tr key={sale.id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sale.drinks?.name || sale.drinks?.drink_name || sale.drink_name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sale.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{sale.staff_name || 'Unknown'}</div>
                              <div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  sale.staff_role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                                  sale.staff_role === 'barmen' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {sale.staff_role === 'superadmin' ? '👑 Admin' :
                                   sale.staff_role === 'barmen' ? '🍷 Barman' : 'Unknown'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{sale.total_amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(sale.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent sales</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'create-sale':
        return <CreateSaleForm />;
      case 'view-inventory':
        return <DrinksInventory />;
      case 'settings':
        return (
          <div className="max-w-md">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Password Settings</h3>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={settingsForm.currentPassword}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7B3F00] focus:border-[#7B3F00]"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={settingsForm.newPassword}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7B3F00] focus:border-[#7B3F00]"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={settingsForm.confirmPassword}
                    onChange={handleSettingsChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7B3F00] focus:border-[#7B3F00]"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="h-4 w-4 text-[#7B3F00] focus:ring-[#7B3F00] border-gray-300 rounded"
                  />
                  <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-900">
                    Show password
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7B3F00] hover:bg-[#5d2f00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B3F00]"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        );
      default:
        return <CreateSaleForm />;
    }
  };

  return (
    <>
      <DashboardLayout
        userRole={user.role}
        userName={user.name}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {renderContent()}
      </DashboardLayout>

      {/* Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">New Sale</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="sales-form" onSubmit={handleSaleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Drink</label>
                  <select
                    required
                    value={saleForm.drink_id}
                    onChange={(e) => {
                      const drinkId = e.target.value;
                      const selectedDrink = drinks.find(drink => drink.id.toString() === drinkId);
                      if (selectedDrink) {
                        const drinkName = selectedDrink.name || selectedDrink.drink_name || 'Unknown Drink';
                        const drinkPrice = selectedDrink.price || selectedDrink.price_per_unit || 0;
                        const total = saleForm.quantity * drinkPrice;
                        setSaleForm(prev => ({
                          ...prev,
                          drink_id: drinkId,
                          item_name: drinkName,
                          price_per_unit: drinkPrice,
                          total_amount: total
                        }));
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                  >
                    <option value="">Select a drink</option>
                    {drinks.length > 0 ? (
                      drinks.map((drink) => {
                        const stockQuantity = drink.stock_quantity || 0;
                        const stockStatus = stockQuantity > 0 ? `(${stockQuantity} available)` : '(Out of stock)';
                        const isOutOfStock = stockQuantity <= 0;
                        
                        return (
                          <option key={drink.id} value={drink.id} disabled={isOutOfStock}>
                            {drink.name || drink.drink_name || 'Unknown Drink'} - ₦{(drink.price || drink.price_per_unit || 0).toLocaleString()} {stockStatus}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>No drinks available</option>
                    )}
                  </select>
                  {drinks.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">No drinks available. Please contact the administrator to add drinks.</p>
                  )}
                </div>
                
                {saleForm.item_name && (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{saleForm.item_name}</span>
                      <span className="text-green-600 font-medium">₦{saleForm.price_per_unit.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={saleForm.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string for clearing
                      if (value === '') {
                        setSaleForm(prev => ({...prev, quantity: '', total_amount: 0}));
                        return;
                      }
                      const quantity = parseInt(value);
                      if (!isNaN(quantity) && quantity >= 0) {
                        const total = quantity * saleForm.price_per_unit;
                        setSaleForm(prev => ({...prev, quantity, total_amount: total}));
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit</label>
                  <input
                    type="text"
                    readOnly
                    value={`₦${saleForm.price_per_unit.toLocaleString()}`}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={`₦${saleForm.total_amount.toLocaleString()}`}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-medium text-lg"
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSalesModal(false);
                    resetSalesForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="sales-form"
                  disabled={loading || !saleForm.item_name}
                  className="px-4 py-2 bg-[#7B3F00] text-white rounded-lg hover:bg-[#5d2f00] disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Record Sale'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BarmenDashboard;