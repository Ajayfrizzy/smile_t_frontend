import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Calendar, 
  Users, 
  Clock, 
  Key,
  Phone,
  MapPin,
  UserCheck,
  UserX,
  Search,
  Plus
} from 'lucide-react';
import { apiRequest } from '../utils/api';

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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch receptionist-relevant data
      const [bookingsRes, roomsRes] = await Promise.allSettled([
        apiRequest('/bookings'),
        apiRequest('/room-inventory/available')
      ]);

      const bookingsData = bookingsRes.status === 'fulfilled' && bookingsRes.value.success 
        ? bookingsRes.value.data : [];
      const roomsData = roomsRes.status === 'fulfilled' && roomsRes.value.success 
        ? roomsRes.value.data : [];

      // Calculate today's metrics
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = bookingsData.filter(booking => 
        booking.check_in_date?.startsWith(today)
      ).length;
      const todayCheckOuts = bookingsData.filter(booking => 
        booking.check_out_date?.startsWith(today)
      ).length;

      // Mock current guests (in real app, this would be calculated from active bookings)
      const currentGuests = bookingsData.filter(booking => booking.status === 'checked_in').length;
      
      const availableRooms = roomsData.reduce((sum, room) => sum + (room.available_rooms || 0), 0);

      setDashboardData({
        todayCheckIns,
        todayCheckOuts,
        currentGuests,
        availableRooms,
        upcomingBookings: bookingsData.slice(0, 5), // Show first 5
        recentActivities: [
          { type: 'check-in', guest: 'John Doe', room: '101', time: '2 hours ago' },
          { type: 'check-out', guest: 'Jane Smith', room: '205', time: '1 hour ago' },
          { type: 'booking', guest: 'Mike Johnson', room: '304', time: '30 minutes ago' }
        ]
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const GuestSearchCard = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Guest Search</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by guest name, room number, or booking ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B3F00] focus:border-transparent"
        />
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] text-sm">
          Search
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
          Advanced Search
        </button>
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
        />
      </div>

      {/* Guest Search */}
      <GuestSearchCard />

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
              <button className="text-sm text-[#7B3F00] hover:underline">
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
          <button
            onClick={() => setActiveTab('guest-services')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Phone className="w-8 h-8 text-orange-500 mb-2" />
            <h4 className="font-medium text-gray-900">Guest Services</h4>
            <p className="text-sm text-gray-500">Handle requests</p>
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
      case 'check-in':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Check In/Out Management</h3>
            <p className="text-gray-600">Check-in/out functionality coming soon...</p>
          </div>
        );
      case 'bookings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Management</h3>
            <p className="text-gray-600">Booking management functionality coming soon...</p>
          </div>
        );
      case 'guest-services':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Services</h3>
            <p className="text-gray-600">Guest services functionality coming soon...</p>
          </div>
        );
      default:
        return <OverviewContent />;
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

export default ReceptionistDashboard;