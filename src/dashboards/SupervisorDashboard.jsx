import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Calendar, 
  DollarSign,
  Globe,
  User,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { getRoomTypeById } from '../utils/roomTypes';

const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingsData, setBookingsData] = useState([]);
  const [barSalesData, setBarSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: user.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    totalSales: 0,
    todayBookings: 0,
    todaySales: 0
  });

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch supervisor viewing data - only bookings and bar sales
      const [bookingsRes, barSalesRes] = await Promise.allSettled([
        apiRequest('/bookings'),
        apiRequest('/drinks/sales')
      ]);

      const bookingsArray = bookingsRes.status === 'fulfilled' && bookingsRes.value.ok 
        ? await bookingsRes.value.json() : { success: false, data: [] };
      const barSalesArray = barSalesRes.status === 'fulfilled' && barSalesRes.value.ok 
        ? await barSalesRes.value.json() : { success: false, data: [] };

      const bookings = bookingsArray.success ? bookingsArray.data : [];
      const barSales = barSalesArray.success ? barSalesArray.data : [];

      setBookingsData(bookings);
      setBarSalesData(barSales);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      
      const stats = {
        totalBookings: bookings.length,
        totalSales: barSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0),
        todayBookings: bookings.filter(booking => booking.created_at?.startsWith(today)).length,
        todaySales: barSales
          .filter(sale => sale.created_at?.startsWith(today))
          .reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      };

      setDashboardStats(stats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingSourceIcon = (paymentMethod) => {
    return paymentMethod === 'manual' ? (
      <User className="w-4 h-4 text-blue-600" title="Walk-in Booking" />
    ) : (
      <Globe className="w-4 h-4 text-green-600" title="Online Booking" />
    );
  };

  const filterBookings = () => {
    if (!searchTerm) return bookingsData;
    return bookingsData.filter(booking => 
      booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.transaction_ref?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterBarSales = () => {
    if (!searchTerm) return barSalesData;
    return barSalesData.filter(sale => 
      sale.drinks?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const OverviewView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Dashboard Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBookings}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.todayBookings}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bar Sales</p>
              <p className="text-2xl font-bold text-gray-900">₦{dashboardStats.totalSales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Bar Sales</p>
              <p className="text-2xl font-bold text-gray-900">₦{dashboardStats.todaySales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookingsData.slice(0, 5).map((booking, index) => {
                const roomType = getRoomTypeById(booking.room_id) || {};
                return (
                  <tr key={booking.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                      <div className="text-sm text-gray-500">{booking.guest_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {roomType.room_type || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{(booking.total_amount || 0).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bar Sales */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Bar Sales</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drink</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff & Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {barSalesData.slice(0, 5).map((sale, index) => (
                <tr key={sale.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.drinks?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{sale.drinks?.category || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.staff_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{(sale.total_amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B3F00]"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'bookings':
        return <BookingsView />;
      case 'bar-sales':
        return <BarSalesView />;
      case 'settings':
        return <Settings />;
      default:
        return <OverviewView />;
    }
  };

  const BookingsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterBookings().map((booking, index) => {
                const roomType = getRoomTypeById(booking.room_id) || {};
                return (
                  <tr key={booking.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                        <div className="text-sm text-gray-500">{booking.guest_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {roomType.room_type || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.check_in}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.check_out}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getBookingSourceIcon(booking.payment_method)}
                        <span className="text-sm text-gray-600">
                          {booking.payment_method === 'manual' ? 'Walk-in' : 'Online'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{(booking.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.transaction_ref}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const BarSalesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Bar Sales</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
            />
            <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drink</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterBarSales().map((sale, index) => (
                <tr key={sale.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sale.drinks?.name || 'Unknown Drink'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {sale.drinks?.category || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{(sale.unit_price || sale.drinks?.price || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₦{(sale.total_amount || (sale.quantity * (sale.unit_price || sale.drinks?.price || 0))).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {sale.staff_name || 'Unknown'}
                      </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.created_at || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                      sale.payment_method === 'card' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.payment_method || 'Cash'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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

export default SupervisorDashboard;