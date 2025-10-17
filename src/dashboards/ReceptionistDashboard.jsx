import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  Calendar, 
  Users, 
  Key,
  Plus,
  Search,
  Globe,
  User,
  Activity,
  CreditCard,
  Bed,
  CheckCircle,
  UserCheck,
  UserX,
  Phone,
  Settings,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { ROOM_TYPES, getRoomTypeById } from '../utils/roomTypes';
import toast from 'react-hot-toast';

// Status-based booking system constants
const ROOM_FREEING_STATUSES = ['checked_out', 'completed', 'cancelled', 'no_show', 'voided'];

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


const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    todayCheckIns: 0,
    todayCheckOuts: 0,
    currentGuests: 0,
    availableRooms: 0,
    upcomingBookings: [],
    recentActivities: []
  });
  const [bookingsData, setBookingsData] = useState([]);
  const [roomInventory, setRoomInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  const [showBookingModal, setShowBookingModal] = useState(false);
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

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh bookings every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
      console.log('📊 Auto-refreshing booking data...');
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh data when switching to rooms tab
  useEffect(() => {
    if (activeTab === 'rooms') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch receptionist-relevant data
      const [bookingsRes, roomsRes] = await Promise.allSettled([
        apiRequest('/bookings'),
        apiRequest('/room-inventory/dashboard')
      ]);

      // Parse JSON responses
      const bookingsData = bookingsRes.status === 'fulfilled' && bookingsRes.value.ok
        ? await bookingsRes.value.json() : { success: false, data: [] };
      const roomsData = roomsRes.status === 'fulfilled' && roomsRes.value.ok
        ? await roomsRes.value.json() : { success: false, data: [] };

      const bookingsArray = bookingsData.success ? bookingsData.data : [];
      const roomsArray = roomsData.success ? roomsData.data : [];

      // Store for bookings and rooms management
      setBookingsData(bookingsArray);
      setRoomInventory(roomsArray);

      // Calculate today's metrics
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = bookingsArray.filter(booking => 
        booking.check_in?.startsWith(today)
      ).length;
      const todayCheckOuts = bookingsArray.filter(booking => 
        booking.check_out?.startsWith(today)
      ).length;

      // Current guests (active bookings)
      const currentGuests = bookingsArray.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'checked_in'
      ).length;
      
      const availableRooms = roomsArray.reduce((sum, room) => sum + (room.available_rooms || 0), 0);

      // Generate recent activities from bookings
      const recentActivities = bookingsArray
        .slice(0, 5)
        .map((booking, index) => ({
          type: booking.payment_method === 'manual' ? 'manual-booking' : 'online-booking',
          guest: booking.guest_name,
          room: booking.room_type || 'Unknown Room',
          time: `${index + 1} hour${index !== 0 ? 's' : ''} ago`,
          source: booking.payment_method === 'manual' ? 'Walk-in' : 'Online'
        }));

      setDashboardData({
        todayCheckIns,
        todayCheckOuts,
        currentGuests,
        availableRooms,
        upcomingBookings: bookingsArray.slice(0, 5),
        recentActivities
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare booking data with proper formatting to match backend
      const bookingData = {
        room_id: bookingForm.room_type_id,
        guest_name: bookingForm.guest_name,
        guest_email: bookingForm.guest_email,
        guest_phone: bookingForm.guest_phone,
        check_in: bookingForm.check_in,
        check_out: bookingForm.check_out,
        guests: parseInt(bookingForm.guests),
        payment_status: 'pending',
        status: 'confirmed',
        transaction_ref: `WI-${Date.now()}`, // Walk-in booking
        reference: `REF-${Date.now()}`,
        payment_method: 'manual'
      };
      
      console.log('Booking data being sent:', bookingData);
      
      const response = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          toast.success('Walk-in booking created successfully!');
          setShowBookingModal(false);
          resetBookingForm();
          fetchDashboardData();
        } else {
          toast.error(data?.message || 'Failed to create booking');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData?.message || 'Failed to create booking - please check all required fields');
      }
    } catch (error) {
      toast.error('Error creating booking: ' + error.message);
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

  const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm p-6 border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Check-ins"
          value={dashboardData.todayCheckIns}
          icon={UserCheck}
          color="bg-green-500"
          subtitle="Scheduled arrivals"
          onClick={() => setActiveTab('check-in')}
        />
        <StatCard
          title="Today's Check-outs"
          value={dashboardData.todayCheckOuts}
          icon={UserX}
          color="bg-blue-500"
          subtitle="Scheduled departures"
          onClick={() => setActiveTab('check-in')}
        />
        <StatCard
          title="Current Guests"
          value={dashboardData.currentGuests}
          icon={Users}
          color="bg-purple-500"
          subtitle="In-house guests"
        />
        <StatCard
          title="Available Rooms"
          value={dashboardData.availableRooms}
          icon={Key}
          color="bg-orange-500"
          subtitle="Ready for booking"
          onClick={() => setActiveTab('rooms')}
        />
      </div>



      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Check-ins</h4>
              <p className="text-sm text-gray-600">{dashboardData.todayCheckIns} guests arriving today</p>
              <button 
                onClick={() => setActiveTab('check-in')}
                className="text-sm text-[#7B3F00] hover:underline"
              >
                View details →
              </button>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">Check-outs</h4>
              <p className="text-sm text-gray-600">{dashboardData.todayCheckOuts} guests departing today</p>
              <button 
                onClick={() => setActiveTab('check-in')}
                className="text-sm text-[#7B3F00] hover:underline"
              >
                View details →
              </button>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">Room Status</h4>
              <p className="text-sm text-gray-600">{dashboardData.availableRooms} rooms available for walk-ins</p>
              <button 
                onClick={() => setActiveTab('rooms')}
                className="text-sm text-[#7B3F00] hover:underline"
              >
                Check availability →
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'check-in' ? 'bg-green-100' :
                  activity.type === 'check-out' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {activity.type === 'check-in' ? (
                    <UserCheck className={`w-4 h-4 ${
                      activity.type === 'check-in' ? 'text-green-600' : ''
                    }`} />
                  ) : activity.type === 'check-out' ? (
                    <UserX className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Calendar className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.guest} - Room {activity.room}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {activity.type.replace('-', ' ')} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('check-in')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <UserCheck className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">Check In Guest</h4>
            <p className="text-sm text-gray-500">Process guest arrival</p>
          </button>
          <button
            onClick={() => setActiveTab('check-in')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <UserX className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Check Out Guest</h4>
            <p className="text-sm text-gray-500">Process guest departure</p>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Plus className="w-8 h-8 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900">New Booking</h4>
            <p className="text-sm text-gray-500">Create reservation</p>
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
      case 'bookings':
        return <BookingsManagement />;
      case 'rooms':
        return <AvailableRooms />;
      case 'manual-booking':
        return <ManualBooking />;
      case 'check-in':
        return <CheckInOut />;
      case 'settings':
        return <Settings />;
      default:
        return <OverviewContent />;
    }
  };

  const BookingsManagement = () => {
    // Filter bookings based on selected filter
    const filteredBookings = bookingsData.filter(booking => {
      if (bookingFilter === 'all') return true;
      if (bookingFilter === 'manual') {
        return booking.created_by_role === 'superadmin' || booking.created_by_role === 'receptionist' || booking.payment_method === 'manual';
      }
      if (bookingFilter === 'online') {
        return booking.created_by_role === 'client' || booking.payment_method === 'flutterwave';
      }
      return true;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Bookings Management 
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredBookings.length} {bookingFilter === 'all' ? 'total' : bookingFilter})
            </span>
          </h3>
          <button
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-2 bg-[#7B3F00] text-white rounded-lg hover:bg-[#8B4513] transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Walk-in Booking
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setBookingFilter('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                bookingFilter === 'all'
                  ? 'border-[#7B3F00] text-[#7B3F00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Bookings ({bookingsData.length})
            </button>
            <button
              onClick={() => setBookingFilter('manual')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                bookingFilter === 'manual'
                  ? 'border-[#7B3F00] text-[#7B3F00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manual Bookings ({bookingsData.filter(b => b.created_by_role === 'superadmin' || b.created_by_role === 'receptionist' || b.payment_method === 'manual').length})
            </button>
            <button
              onClick={() => setBookingFilter('online')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                bookingFilter === 'online'
                  ? 'border-[#7B3F00] text-[#7B3F00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Online Bookings ({bookingsData.filter(b => b.created_by_role === 'client' || b.payment_method === 'flutterwave').length})
            </button>
          </nav>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        No {bookingFilter === 'all' ? '' : bookingFilter} bookings found
                      </p>
                      <p className="text-gray-400 text-sm">
                        {bookingFilter === 'manual' 
                          ? 'No bookings created by staff members yet.'
                          : bookingFilter === 'online' 
                          ? 'No bookings made by clients online yet.'
                          : 'No bookings available in the system.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => {
                  return (
                    <tr key={booking.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                          <div className="text-sm text-gray-500">{booking.guest_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.room_type || 'Unknown Room'}
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.created_by_role === 'client' ? 'bg-blue-100 text-blue-800' :
                          booking.created_by_role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                          booking.created_by_role === 'receptionist' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.created_by_role === 'client' ? '🌐 Client' :
                           booking.created_by_role === 'superadmin' ? '👑 SuperAdmin' :
                           booking.created_by_role === 'receptionist' ? '🏨 Receptionist' :
                           booking.payment_method === 'flutterwave' ? '🌐 Online' : '👤 Manual'}
                        </span>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  };

  const AvailableRooms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Available Rooms</h3>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B3F00]"></div>
        </div>
      ) : roomInventory.length === 0 ? (
        <div className="text-center py-8">
          <Bed className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No room inventory data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sort rooms by price: lowest to highest */}
          {[...roomInventory]
            .sort((a, b) => {
              const roomTypeA = getRoomTypeById(a.room_type_id);
              const roomTypeB = getRoomTypeById(b.room_type_id);
              const priceA = roomTypeA?.price_per_night || 0;
              const priceB = roomTypeB?.price_per_night || 0;
              return priceA - priceB;
            })
            .map((room, index) => {
          const roomType = getRoomTypeById(room.room_type_id);
          return (
            <div key={room.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {roomType?.room_type || 'Unknown Room'}
                </h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  (room.available_rooms || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {room.available_rooms || 0} Available
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Price: ₦{(roomType?.price_per_night || 0).toLocaleString()}/night</p>
                <p>Max Occupancy: {roomType?.max_occupancy || 1} guests</p>
                <p>Total Rooms: {room.total_rooms || 0}</p>
              </div>
              
              {(room.available_rooms || 0) > 0 && (
                <button
                  onClick={() => {
                    setBookingForm(prev => ({ ...prev, room_type_id: room.room_type_id }));
                    setShowBookingModal(true);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-[#7B3F00] text-white rounded-lg hover:bg-[#8B4513] transition-colors"
                >
                  Book This Room
                </button>
              )}
            </div>
          );
        })}
        </div>
      )}
    </div>
  );

  const ManualBooking = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Create Walk-in Booking</h3>
      
      <form onSubmit={handleBookingSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name *</label>
            <input
              type="text"
              required
              value={bookingForm.guest_name}
              onChange={(e) => setBookingForm(prev => ({...prev, guest_name: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
              placeholder="Enter guest full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              required
              value={bookingForm.guest_email}
              onChange={(e) => setBookingForm(prev => ({...prev, guest_email: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
              placeholder="guest@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              required
              value={bookingForm.guest_phone}
              onChange={(e) => setBookingForm(prev => ({...prev, guest_phone: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
              placeholder="+234 xxx xxx xxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
            <select
              required
              value={bookingForm.room_type_id}
              onChange={(e) => {
                const roomTypeId = e.target.value;
                const roomType = getRoomTypeById(roomTypeId);
                let nights = 1;
                if (bookingForm.check_in && bookingForm.check_out) {
                  const nightsCalc = Math.ceil((new Date(bookingForm.check_out) - new Date(bookingForm.check_in)) / (1000 * 60 * 60 * 24));
                  nights = nightsCalc > 0 ? nightsCalc : 1;
                }
                const total = roomType ? roomType.price_per_night * nights : 0;
                setBookingForm(prev => ({...prev, room_type_id: roomTypeId, total_amount: total}));
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
            >
              <option value="">Select a room type</option>
              {roomInventory.length > 0 ? (
                roomInventory
                  .filter(room => (room.available_rooms || 0) > 0)
                  .sort((a, b) => {
                    // Sort by price: lowest to highest
                    const roomTypeA = getRoomTypeById(a.room_type_id);
                    const roomTypeB = getRoomTypeById(b.room_type_id);
                    const priceA = roomTypeA?.price_per_night || 0;
                    const priceB = roomTypeB?.price_per_night || 0;
                    return priceA - priceB;
                  })
                  .map((room) => {
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
            <input
              type="date"
              required
              value={bookingForm.check_in}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const checkIn = e.target.value;
                const roomType = getRoomTypeById(bookingForm.room_type_id);
                let nights = 1;
                if (checkIn && bookingForm.check_out) {
                  const nightsCalc = Math.ceil((new Date(bookingForm.check_out) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
                  nights = nightsCalc > 0 ? nightsCalc : 1;
                }
                const total = roomType ? roomType.price_per_night * nights : 0;
                setBookingForm(prev => ({...prev, check_in: checkIn, total_amount: total}));
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
            <input
              type="date"
              required
              value={bookingForm.check_out}
              min={bookingForm.check_in || new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const checkOut = e.target.value;
                const roomType = getRoomTypeById(bookingForm.room_type_id);
                let nights = 1;
                if (bookingForm.check_in && checkOut) {
                  const nightsCalc = Math.ceil((new Date(checkOut) - new Date(bookingForm.check_in)) / (1000 * 60 * 60 * 24));
                  nights = nightsCalc > 0 ? nightsCalc : 1;
                }
                const total = roomType ? roomType.price_per_night * nights : 0;
                setBookingForm(prev => ({...prev, check_out: checkOut, total_amount: total}));
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
            <input
              type="number"
              min="1"
              max="4"
              required
              value={bookingForm.guests}
              onChange={(e) => setBookingForm(prev => ({...prev, guests: parseInt(e.target.value) || 1}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
            <input
              type="text"
              readOnly
              value={`₦${bookingForm.total_amount.toLocaleString()}`}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#7B3F00] text-white px-6 py-3 rounded-lg hover:bg-[#8B4513] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
          <button
            type="button"
            onClick={resetBookingForm}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );

  const CheckInOut = () => {
    const todayBookings = bookingsData.filter(booking => {
      const today = new Date().toISOString().split('T')[0];
      return booking.check_in?.startsWith(today) || booking.check_out?.startsWith(today);
    });

    const handleCheckIn = async (bookingId) => {
      try {
        const response = await apiRequest(`/bookings/${bookingId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'checked_in' })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            toast.success('Guest checked in successfully!');
            fetchDashboardData();
          } else {
            toast.error(data.message || 'Failed to check in guest');
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to check in guest');
        }
      } catch (error) {
        console.error('Check-in error:', error);
        toast.error('Error checking in guest: ' + error.message);
      }
    };

    const handleCheckOut = async (bookingId) => {
      try {
        // Set to 'completed' instead of 'checked_out' to avoid workflow confusion
        const response = await apiRequest(`/bookings/${bookingId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'completed' })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            toast.success('Guest checked out successfully - booking completed!');
            fetchDashboardData();
          } else {
            toast.error(data.message || 'Failed to check out guest');
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to check out guest');
        }
      } catch (error) {
        console.error('Check-out error:', error);
        toast.error('Error checking out guest: ' + error.message);
      }
    };

    // Status change handler for booking lifecycle management
    const handleStatusChange = async (bookingId, newStatus) => {
      // Define confirmation messages and types
      const confirmationConfig = {
        cancelled: {
          title: 'Cancel Booking',
          message: 'Are you sure you want to cancel this booking? The room will be freed immediately and made available for other guests.',
          type: 'danger'
        },
        no_show: {
          title: 'Mark as No-Show',
          message: 'Guest did not arrive? This will mark the booking as no-show and free the room immediately.',
          type: 'warning'
        },
        checked_in: {
          title: 'Check In Guest',
          message: 'Confirm that the guest has arrived and is being checked in?',
          type: 'info'
        },
        completed: {
          title: 'Check Out & Complete',
          message: 'Check out this guest and mark booking as completed? The room will be returned to inventory and made available immediately.',
          type: 'success'
        }
      };
      
      // Show confirmation modal for certain statuses
      if (confirmationConfig[newStatus]) {
        const config = confirmationConfig[newStatus];
        setConfirmationModal({
          isOpen: true,
          title: config.title,
          message: config.message,
          type: config.type,
          onConfirm: async () => {
            // Perform the actual status change
            try {
              const response = await apiRequest(`/bookings/${bookingId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.success) {
                  toast.success(`✅ ${data.message || `Booking status updated to ${STATUS_LABELS[newStatus]}`}`);
                  fetchDashboardData();
                } else {
                  toast.error(data.message || 'Failed to update status');
                }
              } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to update status');
              }
            } catch (error) {
              console.error('Status change error:', error);
              toast.error('Error updating booking status: ' + error.message);
            }
          }
        });
        return;
      }
      
      // For statuses without confirmation, update directly
      try {
        const response = await apiRequest(`/bookings/${bookingId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            toast.success(`✅ ${data.message || `Booking status updated to ${STATUS_LABELS[newStatus]}`}`);
            fetchDashboardData();
          } else {
            toast.error(data.message || 'Failed to update status');
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to update status');
        }
      } catch (error) {
        console.error('Status change error:', error);
        toast.error('Error updating booking status: ' + error.message);
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Check-In / Check-Out Management</h3>
        
        {todayBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No check-ins or check-outs scheduled for today</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayBookings.map((booking) => {
                    const isCheckInDay = booking.check_in?.startsWith(new Date().toISOString().split('T')[0]);
                    const isCheckOutDay = booking.check_out?.startsWith(new Date().toISOString().split('T')[0]);
                    
                    return (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                            <div className="text-sm text-gray-500">{booking.guest_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.room_type || 'Unknown Room'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.check_in}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.check_out}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                            {STATUS_LABELS[booking.status] || booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {/* Action dropdown for active bookings */}
                            {!ROOM_FREEING_STATUSES.includes(booking.status) ? (
                              <select
                                onChange={(e) => {
                                  const action = e.target.value;
                                  if (action) {
                                    handleStatusChange(booking.id, action);
                                  }
                                  e.target.value = ''; // Reset dropdown
                                }}
                                className="w-full min-w-[200px] px-3 py-2.5 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                defaultValue=""
                              >
                                <option value="" disabled>Select Action</option>
                                {booking.status === 'confirmed' && isCheckInDay && (
                                  <option value="checked_in">✓ Check In Guest</option>
                                )}
                                {booking.status === 'checked_in' && (
                                  <option value="completed">✓ Check Out & Complete</option>
                                )}
                                <option value="cancelled">✗ Cancel Booking</option>
                                <option value="no_show">⊘ Mark No-Show</option>
                              </select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-green-600 font-medium">
                                  ✅ Booking Finalized
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Settings = () => {
    const [passwordForm, setPasswordForm] = useState({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
      current: false,
      new: false,
      confirm: false
    });

    const handlePasswordChange = async (e) => {
      e.preventDefault();
      
      if (passwordForm.new_password !== passwordForm.confirm_password) {
        toast.error('New passwords do not match');
        return;
      }
      
      if (passwordForm.new_password.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
      }

      try {
        setSettingsLoading(true);
        
        const passwordData = {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        };

        const response = await apiRequest('/auth/change-password', {
          method: 'POST',
          body: JSON.stringify(passwordData)
        });

        if (response && response.ok) {
          const data = await response.json();
          if (data && data.success) {
            toast.success('Password changed successfully!');
            setPasswordForm({
              current_password: '',
              new_password: '',
              confirm_password: ''
            });
          } else {
            toast.error(data?.message || 'Failed to change password');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData?.message || 'Failed to change password');
        }
      } catch (error) {
        toast.error('Error changing password: ' + error.message);
      } finally {
        setSettingsLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Settings</h3>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-md">
          <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({...prev, current_password: e.target.value}))}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({...prev, new_password: e.target.value}))}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                  minLength="6"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm(prev => ({...prev, confirm_password: e.target.value}))}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={settingsLoading}
              className="w-full bg-[#7B3F00] text-white px-4 py-2 rounded-lg hover:bg-[#8B4513] transition-colors font-medium disabled:opacity-50"
            >
              {settingsLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    );
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

      {/* Walk-in Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Create Walk-in Booking</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.guest_name}
                      onChange={(e) => setBookingForm(prev => ({...prev, guest_name: e.target.value}))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={bookingForm.guest_email}
                      onChange={(e) => setBookingForm(prev => ({...prev, guest_email: e.target.value}))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.guest_phone}
                    onChange={(e) => setBookingForm(prev => ({...prev, guest_phone: e.target.value}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
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
                    {roomInventory
                      .filter(room => (room.available_rooms || 0) > 0)
                      .sort((a, b) => {
                        // Sort by price: lowest to highest
                        const roomTypeA = getRoomTypeById(a.room_type_id);
                        const roomTypeB = getRoomTypeById(b.room_type_id);
                        const priceA = roomTypeA?.price_per_night || 0;
                        const priceB = roomTypeB?.price_per_night || 0;
                        return priceA - priceB;
                      })
                      .map(room => {
                        const roomType = getRoomTypeById(room.room_type_id);
                        return (
                          <option key={room.room_type_id} value={room.room_type_id}>
                            {roomType?.room_type} - ₦{(roomType?.price_per_night || 0).toLocaleString()}/night ({room.available_rooms} available)
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm(prev => ({...prev, guests: parseInt(e.target.value)}))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
                  />
                </div>

                {/* Total Amount Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={`₦${bookingForm.total_amount.toLocaleString()}`}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-bold text-lg text-[#7B3F00]"
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#7B3F00] text-white rounded-lg hover:bg-[#8B4513] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText="Yes, Proceed"
        cancelText="No, Cancel"
      />
    </>
  );
};

export default ReceptionistDashboard;