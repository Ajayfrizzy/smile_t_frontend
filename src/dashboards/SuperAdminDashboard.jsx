import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import StaffManagement from '../components/StaffManagement';
import RoomInventoryManagement from '../components/RoomInventoryManagement';
import DrinksManagement from '../components/DrinksManagement';
import TransactionsAnalytics from '../components/TransactionsAnalytics';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { ROOM_TYPES, getRoomTypeById } from '../utils/roomTypes';
import { 
  Users, 
  Bed, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  AlertTriangle,
  User
} from 'lucide-react';
import { apiRequest } from '../utils/api';

const SuperAdminDashboard = () => {
  const { toasts, toast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalStaff: 0,
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [roomInventory, setRoomInventory] = useState([]);
  const [drinksInventory, setDrinksInventory] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [barSalesData, setBarSalesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingForm, setBookingForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    room_type_id: '',
    check_in: '',
    check_out: '',
    guests: 1,
    total_amount: 0
  });
  const [salesForm, setSalesForm] = useState({
    drink_id: '',
    item_name: '',
    quantity: 1,
    price_per_unit: 0,
    total_amount: 0
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    smsAlerts: true,
    dailyReports: false,
    currency: 'NGN',
    timezone: 'Africa/Lagos'
  });

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Reset functions for forms
  const resetBookingForm = () => {
    setBookingForm({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      room_type_id: '',
      check_in: '',
      check_out: '',
      guests: 1,
      total_amount: 0
    });
  };
  
  const resetSalesForm = () => {
    setSalesForm({
      drink_id: '',
      item_name: '',
      quantity: 1,
      price_per_unit: 0,
      total_amount: 0
    });
    setSearchTerm('');
  };

  // Profile update handler
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        currentPassword: profileForm.currentPassword,
        newPassword: profileForm.newPassword
      };

      // Only include name if user is superadmin
      if (user.role === 'superadmin') {
        updateData.name = profileForm.name || user.name;
      }

      const response = await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          toast.success('Profile updated successfully!');
          // Update localStorage with new user data if name changed
          if (updateData.name) {
            const updatedUser = { ...user, name: updateData.name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          // Reset form
          setProfileForm({
            name: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          alert(data?.message || 'Failed to update profile');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData?.message || 'Failed to update profile');
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Settings update handler
  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await apiRequest('/auth/update-settings', {
        method: 'PUT',
        body: JSON.stringify(settingsForm)
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          alert('Settings updated successfully!');
        } else {
          alert(data?.message || 'Failed to update settings');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData?.message || 'Failed to update settings');
      }
    } catch (error) {
      alert('Error updating settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [staffRes, roomsRes, bookingsRes, analyticsRes, drinksRes, barSalesRes] = await Promise.allSettled([
        apiRequest('/staff'),
        apiRequest('/room-inventory'),
        apiRequest('/bookings'),
        apiRequest('/analytics/overview'),
        apiRequest('/drinks'),
        apiRequest('/bar-sales')
      ]);

      // Process staff data
      const staffData = staffRes.status === 'fulfilled' && staffRes.value && staffRes.value.ok
        ? await staffRes.value.json() : { success: false, data: [] };
      
      // Process rooms data
      const roomsData = roomsRes.status === 'fulfilled' && roomsRes.value && roomsRes.value.ok
        ? await roomsRes.value.json() : { success: false, data: [] };
      
      // Set room inventory for booking form
      setRoomInventory(roomsData.success ? roomsData.data || [] : []);
      
      // Process bookings data
      const bookingsData = bookingsRes.status === 'fulfilled' && bookingsRes.value && bookingsRes.value.ok
        ? await bookingsRes.value.json() : { success: false, data: [] };
      
      // Process analytics data
      const analyticsData = analyticsRes.status === 'fulfilled' && analyticsRes.value && analyticsRes.value.ok
        ? await analyticsRes.value.json() : { success: false, data: {} };
      
      // Process drinks data
      const drinksData = drinksRes.status === 'fulfilled' && drinksRes.value && drinksRes.value.ok
        ? await drinksRes.value.json() : { success: false, data: [] };
      
      // Set drinks inventory for sales form
      if (drinksData.success) {
        setDrinksInventory(drinksData.data || []);
      }

      // Process bar sales data
      const barSalesDataRes = barSalesRes.status === 'fulfilled' && barSalesRes.value && barSalesRes.value.ok
        ? await barSalesRes.value.json() : { success: false, data: [] };
      
      // Set bar sales data for display
      if (barSalesDataRes.success) {
        setBarSalesData(barSalesDataRes.data || []);
      }

      // Calculate totals
      const roomsArray = roomsData.success ? roomsData.data || [] : [];
      const bookingsArray = bookingsData.success ? bookingsData.data || [] : [];
      const staffArray = staffData.success ? staffData.data || [] : [];
      const barSalesArray = barSalesDataRes.success ? barSalesDataRes.data || [] : [];
      
      // Store bookings data for display
      setBookingsData(bookingsArray);
      const analyticsObject = analyticsData.success ? analyticsData.data || {} : {};
      
      const totalRooms = roomsArray.reduce((sum, room) => sum + (room.total_rooms || 0), 0);
      const availableRooms = roomsArray.reduce((sum, room) => sum + (room.available_rooms || 0), 0);
      const totalRevenue = analyticsObject.totalRevenue || 0;
      
      // Calculate bar sales metrics
      const totalBarSales = barSalesArray.length;
      const barSalesRevenue = barSalesArray.reduce((sum, sale) => {
        // Calculate revenue from quantity and unit_price if available
        const saleAmount = (sale.quantity || 0) * (sale.unit_price || sale.drinks?.price || 0);
        return sum + saleAmount;
      }, 0);

      setDashboardData({
        totalStaff: staffArray.length,
        totalRooms,
        availableRooms,
        totalBookings: bookingsArray.length,
        totalRevenue,
        totalBarSales,
        barSalesRevenue,
        recentActivities: analyticsObject.recentActivities || []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare booking data with proper formatting to match backend
      const bookingData = {
        room_id: bookingForm.room_type_id, // Backend expects room_id
        guest_name: bookingForm.guest_name,
        guest_email: bookingForm.guest_email,
        guest_phone: bookingForm.guest_phone,
        check_in: bookingForm.check_in,
        check_out: bookingForm.check_out,
        guests: parseInt(bookingForm.guests),
        payment_status: 'pending',
        status: 'confirmed',
        transaction_ref: `BK-${Date.now()}`,
        reference: `REF-${Date.now()}`
      };
      
      console.log('Booking data being sent:', bookingData);
      
      const response = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          toast.success('Booking created successfully!');
          setShowBookingModal(false);
          resetBookingForm();
          fetchDashboardData(); // Refresh data
        } else {
          alert(data?.message || 'Failed to create booking');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData?.message || 'Failed to create booking - please check all required fields');
      }
    } catch (error) {
      alert('Error creating booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiRequest(`/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          toast.success('Booking cancelled successfully!');
          fetchDashboardData(); // Refresh data
        } else {
          toast.error(data?.message || 'Failed to cancel booking');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData?.message || 'Failed to cancel booking');
      }
    } catch (error) {
      alert('Error cancelling booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBarSale = async (saleId) => {
    if (!confirm('Are you sure you want to delete this sale?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiRequest(`/bar-sales/${saleId}`, {
        method: 'DELETE'
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          alert('Sale deleted successfully!');
          fetchDashboardData(); // Refresh data
        } else {
          alert(data?.message || 'Failed to delete sale');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData?.message || 'Failed to delete sale');
      }
    } catch (error) {
      alert('Error deleting sale: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSalesSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate form data
      if (!salesForm.drink_id || !salesForm.quantity) {
        alert('Please select a drink and enter quantity');
        setLoading(false);
        return;
      }

      const drinkId = parseInt(salesForm.drink_id);
      const quantity = parseInt(salesForm.quantity);

      if (isNaN(drinkId) || isNaN(quantity) || quantity <= 0) {
        alert('Please enter valid drink selection and quantity');
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

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Staff"
          value={dashboardData.totalStaff}
          icon={Users}
          color="bg-blue-500"
          subtitle="Active employees"
        />
        <StatCard
          title="Total Rooms"
          value={dashboardData.totalRooms}
          icon={Bed}
          color="bg-green-500"
          subtitle={`${dashboardData.availableRooms} available`}
        />
        <StatCard
          title="Total Bookings"
          value={dashboardData.totalBookings}
          icon={Calendar}
          color="bg-purple-500"
          subtitle="All time"
        />
        <StatCard
          title="Bar Sales"
          value={dashboardData.totalBarSales || 0}
          icon={BarChart3}
          color="bg-orange-500"
          subtitle={`₦${(dashboardData.barSalesRevenue || 0).toLocaleString()} revenue`}
        />
        <StatCard
          title="Total Revenue"
          value={`₦${dashboardData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-yellow-500"
          subtitle="All time"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Occupancy Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Room Occupancy</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Occupied Rooms</span>
              <span className="text-sm font-medium">
                {dashboardData.totalRooms - dashboardData.availableRooms} / {dashboardData.totalRooms}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${dashboardData.totalRooms > 0 ? 
                    ((dashboardData.totalRooms - dashboardData.availableRooms) / dashboardData.totalRooms) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              Occupancy Rate: {dashboardData.totalRooms > 0 ? 
                (((dashboardData.totalRooms - dashboardData.availableRooms) / dashboardData.totalRooms) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Bar Sales Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bar Sales Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Sales</span>
              <span className="text-sm font-medium">{dashboardData.totalBarSales || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-sm font-medium text-green-600">₦{(dashboardData.barSalesRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available Drinks</span>
              <span className="text-sm font-medium">{drinksInventory.filter(drink => (drink.stock_quantity || 0) > 0).length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${drinksInventory.length > 0 ? 
                    (drinksInventory.filter(drink => (drink.stock_quantity || 0) > 0).length / drinksInventory.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              Stock Availability: {drinksInventory.length > 0 ? 
                ((drinksInventory.filter(drink => (drink.stock_quantity || 0) > 0).length / drinksInventory.length) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{activity.description}</span>
                  <span className="text-gray-400">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('staff')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Staff</h4>
            <p className="text-sm text-gray-500">Add, edit, or remove staff members</p>
          </button>
          <button
            onClick={() => setActiveTab('room-inventory')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Package className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">Room Inventory</h4>
            <p className="text-sm text-gray-500">Manage room types and availability</p>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900">View Analytics</h4>
            <p className="text-sm text-gray-500">Analyze performance and trends</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading && activeTab === 'overview') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B3F00]"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewContent />;
      case 'staff':
        return <StaffManagement />;
      case 'room-inventory':
        return <RoomInventoryManagement />;
      case 'drinks':
        return <DrinksManagement />;
      case 'bookings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bookings Management</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Manage hotel bookings and reservations</p>
                <button 
                  onClick={() => setShowBookingModal(true)}
                  className="bg-[#7B3F00] text-white px-4 py-2 rounded-lg hover:bg-[#5d2f00] transition-colors"
                >
                  New Booking
                </button>
              </div>
              <div className="border-t pt-4">
                {bookingsData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookingsData.map((booking, index) => {
                          const roomType = getRoomTypeById(booking.room_id) || {};
                          return (
                            <tr key={booking.id || index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                                  <div className="text-sm text-gray-500">{booking.guest_email}</div>
                                  <div className="text-sm text-gray-500">{booking.guest_phone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{roomType.room_type || 'Unknown Room'}</div>
                                <div className="text-sm text-gray-500">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₦{booking.total_amount?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.transaction_ref}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  disabled={loading}
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-900 px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Cancel Booking"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No bookings found</p>
                    <p className="text-sm">Start by creating your first booking</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'bar-sales':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bar Sales Management</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Track and manage bar sales transactions</p>
                <button 
                  onClick={() => setShowSalesModal(true)}
                  className="bg-[#7B3F00] text-white px-4 py-2 rounded-lg hover:bg-[#5d2f00] transition-colors"
                >
                  New Sale
                </button>
              </div>
              <div className="border-t pt-4">
                {barSalesData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drink</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {barSalesData.map((sale, index) => (
                          <tr key={sale.id || index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {sale.drinks?.drink_name || 'Unknown Drink'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₦{sale.unit_price?.toLocaleString() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₦{sale.total_amount?.toLocaleString() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{sale.staff?.name || 'Unknown Staff'}</div>
                              <div className="text-sm text-gray-500">{sale.staff?.staff_id || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sale.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => handleDeleteBarSale(sale.id)}
                                disabled={loading}
                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-900 px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Sale"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No sales recorded</p>
                    <p className="text-sm">Start by recording your first sale</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return <TransactionsAnalytics />;
      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reports</h3>
            <p className="text-gray-600">Reports functionality coming soon...</p>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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
              <div className="border-t pt-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">Update Profile</h5>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {user.role === 'superadmin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={profileForm.name || user.name}
                        onChange={(e) => setProfileForm(prev => ({...prev, name: e.target.value}))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                      />
                    </div>
                  )}
                  {user.role !== 'superadmin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={user.name}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Only administrators can change names</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm(prev => ({...prev, currentPassword: e.target.value}))}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm(prev => ({...prev, newPassword: e.target.value}))}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm(prev => ({...prev, confirmPassword: e.target.value}))}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#7B3F00] text-white px-6 py-2 rounded-lg hover:bg-[#5d2f00] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
            <form onSubmit={handleSettingsUpdate} className="space-y-6">
              <div>
                <h5 className="text-lg font-medium text-gray-900 mb-4">Notifications</h5>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#7B3F00] focus:ring-[#7B3F00]" 
                      checked={settingsForm.emailNotifications}
                      onChange={(e) => setSettingsForm(prev => ({...prev, emailNotifications: e.target.checked}))}
                    />
                    <span className="ml-2 text-sm text-gray-700">Email notifications for new bookings</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#7B3F00] focus:ring-[#7B3F00]" 
                      checked={settingsForm.smsAlerts}
                      onChange={(e) => setSettingsForm(prev => ({...prev, smsAlerts: e.target.checked}))}
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS alerts for urgent matters</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#7B3F00] focus:ring-[#7B3F00]" 
                      checked={settingsForm.dailyReports}
                      onChange={(e) => setSettingsForm(prev => ({...prev, dailyReports: e.target.checked}))}
                    />
                    <span className="ml-2 text-sm text-gray-700">Daily summary reports</span>
                  </label>
                </div>
              </div>
              <div className="border-t pt-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">System Preferences</h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                      value={settingsForm.currency}
                      onChange={(e) => setSettingsForm(prev => ({...prev, currency: e.target.value}))}
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                      value={settingsForm.timeZone}
                      onChange={(e) => setSettingsForm(prev => ({...prev, timeZone: e.target.value}))}
                    >
                      <option value="Africa/Lagos">West Africa Time (WAT)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#7B3F00] text-white px-6 py-2 rounded-lg hover:bg-[#5d2f00] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        );
      default:
        return <OverviewContent />;
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

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">New Booking</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  value={bookingForm.guest_name}
                  onChange={(e) => setBookingForm(prev => ({...prev, guest_name: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={bookingForm.guest_email}
                  onChange={(e) => setBookingForm(prev => ({...prev, guest_email: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={bookingForm.guest_phone}
                  onChange={(e) => setBookingForm(prev => ({...prev, guest_phone: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  required
                  value={bookingForm.room_type_id}
                  onChange={(e) => {
                    const roomTypeId = e.target.value;
                    const roomType = getRoomTypeById(roomTypeId);
                    const nights = bookingForm.check_in && bookingForm.check_out 
                      ? Math.ceil((new Date(bookingForm.check_out) - new Date(bookingForm.check_in)) / (1000 * 60 * 60 * 24))
                      : 1;
                    const total = roomType ? roomType.price_per_night * nights : 0;
                    setBookingForm(prev => ({...prev, room_type_id: roomTypeId, total_amount: total}));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                >
                  <option value="">Select a room type</option>
                  {roomInventory.length > 0 ? (
                    roomInventory.filter(room => (room.available_rooms || 0) > 0).map((room) => {
                      const roomType = getRoomTypeById(room.room_type_id);
                      return (
                        <option key={room.id} value={room.room_type_id}>
                          {roomType?.room_type || 'Unknown Room'} - ₦{roomType?.price_per_night?.toLocaleString() || '0'}/night ({room.available_rooms || 0} available)
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>No rooms available</option>
                  )}
                </select>
                {roomInventory.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No room inventory found. Please add rooms first.</p>
                )}
                {roomInventory.length > 0 && roomInventory.filter(room => (room.available_rooms || 0) > 0).length === 0 && (
                  <p className="text-sm text-red-600 mt-1">All rooms are currently booked.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  required
                  value={bookingForm.guests}
                  onChange={(e) => setBookingForm(prev => ({...prev, guests: parseInt(e.target.value)}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  required
                  value={bookingForm.check_in}
                  onChange={(e) => {
                    const checkIn = e.target.value;
                    const nights = checkIn && bookingForm.check_out 
                      ? Math.ceil((new Date(bookingForm.check_out) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
                      : 1;
                    const roomType = getRoomTypeById(bookingForm.room_type_id);
                    const total = roomType ? roomType.price_per_night * nights : 0;
                    setBookingForm(prev => ({...prev, check_in: checkIn, total_amount: total}));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  required
                  value={bookingForm.check_out}
                  onChange={(e) => {
                    const checkOut = e.target.value;
                    const nights = bookingForm.check_in && checkOut 
                      ? Math.ceil((new Date(checkOut) - new Date(bookingForm.check_in)) / (1000 * 60 * 60 * 24))
                      : 1;
                    const roomType = getRoomTypeById(bookingForm.room_type_id);
                    const total = roomType ? roomType.price_per_night * nights : 0;
                    setBookingForm(prev => ({...prev, check_out: checkOut, total_amount: total}));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input
                  type="text"
                  readOnly
                  value={`₦${bookingForm.total_amount.toLocaleString()}`}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    resetBookingForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="booking-form"
                  disabled={loading}
                  className="px-4 py-2 bg-[#7B3F00] text-white rounded-lg hover:bg-[#5d2f00] disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">New Sale</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="sales-form" onSubmit={handleSalesSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Drink</label>
                  <select
                    required
                    value={salesForm.drink_id}
                    onChange={(e) => {
                      const drinkId = e.target.value;
                      const selectedDrink = drinksInventory.find(drink => drink.id.toString() === drinkId);
                      if (selectedDrink) {
                        const drinkName = selectedDrink.name || selectedDrink.drink_name || 'Unknown Drink';
                        const drinkPrice = selectedDrink.price || selectedDrink.price_per_unit || 0;
                        const total = salesForm.quantity * drinkPrice;
                        setSalesForm(prev => ({
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
                    {drinksInventory.length > 0 ? (
                      drinksInventory.map((drink) => {
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
                  {drinksInventory.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">No drinks available. Please add drinks first in the Drinks Management section.</p>
                  )}
                </div>
                
                {salesForm.item_name && (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{salesForm.item_name}</span>
                      <span className="text-green-600 font-medium">₦{salesForm.price_per_unit.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={salesForm.quantity}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 1;
                      const total = quantity * salesForm.price_per_unit;
                      setSalesForm(prev => ({...prev, quantity, total_amount: total}));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit</label>
                  <input
                    type="text"
                    readOnly
                    value={`₦${salesForm.price_per_unit.toLocaleString()}`}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={`₦${salesForm.total_amount.toLocaleString()}`}
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
                  disabled={loading || !salesForm.item_name}
                  className="px-4 py-2 bg-[#7B3F00] text-white rounded-lg hover:bg-[#5d2f00] disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Record Sale'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default SuperAdminDashboard;