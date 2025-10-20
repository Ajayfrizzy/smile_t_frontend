import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Calendar, 
  DollarSign,
  Globe,
  User,
  BarChart3,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { getRoomTypeById } from '../utils/roomTypes';
import toast from 'react-hot-toast';

// Status-based booking system constants (view-only for supervisor)
const STATUS_LABELS = {
  pending: 'Pending Payment',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  voided: 'Voided'
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  checked_in: 'bg-green-100 text-green-800 border-green-300',
  checked_out: 'bg-gray-100 text-gray-800 border-gray-300',
  completed: 'bg-purple-100 text-purple-800 border-purple-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  no_show: 'bg-orange-100 text-orange-800 border-orange-300',
  voided: 'bg-gray-100 text-gray-600 border-gray-300'
};

const SupervisorDashboard = () => {
  // Get user info from localStorage first
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState('overview');
  const [bookingsData, setBookingsData] = useState([]);
  const [barSalesData, setBarSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [cachedData, setCachedData] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: settingsForm.currentPassword,
          new_password: settingsForm.newPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Password updated successfully');
          setSettingsForm({
            ...settingsForm,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          toast.error(data.message || 'Failed to update password');
        }
      } else {
        toast.error('Failed to update password');
      }
    } catch (err) {
      toast.error(err.message);
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

  const fetchDashboardData = async (background = false) => {
    try {
      if (!background) {
        setLoading(true);
      }
      
      // Fetch supervisor viewing data - bookings and bar sales
      const [bookingsRes, barSalesRes] = await Promise.allSettled([
        apiRequest('/bookings'),
        apiRequest('/bar-sales')
      ]);

      // Process bookings data
      let processedBookings = [];
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value && bookingsRes.value.ok) {
        const bookingsData = await bookingsRes.value.json();
        if (bookingsData.success) {
          processedBookings = bookingsData.data || [];
          setBookingsData(processedBookings);
        }
      }

      // Process bar sales data
      let processedBarSales = [];
      if (barSalesRes.status === 'fulfilled' && barSalesRes.value && barSalesRes.value.ok) {
        const barSalesData = await barSalesRes.value.json();
        if (barSalesData.success) {
          processedBarSales = barSalesData.data || [];
          setBarSalesData(processedBarSales);
        }
      }

      // Calculate stats from fetched data
      const totalBookings = processedBookings.length;
      const totalBarSalesCount = processedBarSales.length;
      const bookingsRevenue = processedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
      const barSalesRevenue = processedBarSales.reduce((sum, sale) => sum + (sale.total_amount || sale.amount || 0), 0);
      const totalAmount = bookingsRevenue + barSalesRevenue;

      // Filter today's data
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = processedBookings.filter(booking => {
        const bookingDate = booking.created_at || booking.check_in;
        return bookingDate && bookingDate.startsWith(today);
      });

      const todayBarSales = processedBarSales.filter(sale => {
        const saleDate = sale.created_at || sale.date;
        return saleDate && saleDate.startsWith(today);
      });

      // Update dashboard stats
      const stats = {
        totalBookings,
        totalSales: totalAmount,
        totalBarSales: barSalesRevenue,
        totalDrinkSales: totalBarSalesCount,
        todayBookings: todayBookings.length,
        todaySales: todayBarSales.reduce((sum, sale) => sum + (sale.total_amount || sale.amount || 0), 0)
      };
      
      setDashboardStats(stats);
      
      // Cache the data
      setCachedData({ bookings: processedBookings, barSales: processedBarSales, stats });
      setLastFetchTime(Date.now());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (!background) {
        setLoading(false);
      }
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
    return bookingsData;
  };

  const filterBarSales = () => {
    return barSalesData;
  };

  const OverviewView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Dashboard Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {(dashboardStats.totalBookings + dashboardStats.totalDrinkSales) || 0}
              </p>
              <p className="text-sm text-gray-500">₦{dashboardStats.totalSales?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBookings}</p>
              <p className="text-sm text-gray-500">₦{(dashboardStats.totalSales - dashboardStats.totalBarSales)?.toLocaleString() || '0'}</p>
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
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalDrinkSales || 0}</p>
              <p className="text-sm text-gray-500">₦{dashboardStats.totalBarSales?.toLocaleString() || '0'}</p>
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
                  return (
                  <tr key={booking.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                      <div className="text-sm text-gray-500">{booking.guest_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.room_type_name || booking.room_type || 'Unknown Room'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                        {STATUS_LABELS[booking.status] || booking.status}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.drinks?.name || sale.drinks?.drink_name || sale.drink_name || 'Unknown'}
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
                    <EyeOff className="w-5 h-5 text-gray-500" />
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
                    <EyeOff className="w-5 h-5 text-gray-500" />
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
                    <EyeOff className="w-5 h-5 text-gray-500" />
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
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#7B3F00] rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900">{user.name}</h4>
                  <p className="text-gray-500 capitalize">{user.role}</p>
                  <p className="text-sm text-gray-400">Staff ID: {user.staff_id}</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-4">
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

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#5d2f00] transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      default:
        return <OverviewView />;
    }
  };

  const BookingsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
        <button
          onClick={fetchDashboardData}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterBookings().map((booking, index) => {
                return (
                  <tr key={booking.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                        <div className="text-sm text-gray-500">{booking.guest_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.room_type_name || booking.room_type || 'Unknown Room'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.check_in}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.check_out}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.created_at ? new Date(booking.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                        {STATUS_LABELS[booking.status] || booking.status}
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
        <button
          onClick={fetchDashboardData}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
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
                      {sale.drinks?.name || sale.drinks?.drink_name || sale.drink_name || 'Unknown Drink'}
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