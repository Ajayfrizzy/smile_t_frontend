import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import TransactionsAnalytics from '../components/TransactionsAnalytics';
import { 
  Users, 
  Bed, 
  Calendar, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiRequest } from '../utils/api';

const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    staffOnDuty: 0,
    roomsOccupied: 0,
    todayBookings: 0,
    pendingTasks: 0,
    roomStatus: [],
    staffStatus: [],
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch supervisor-relevant data
      const [staffRes, roomsRes, bookingsRes] = await Promise.allSettled([
        apiRequest('/staff'),
        apiRequest('/room-inventory'),
        apiRequest('/bookings')
      ]);

      // Process data
      const staffData = staffRes.status === 'fulfilled' && staffRes.value.success 
        ? staffRes.value.data : [];
      const roomsData = roomsRes.status === 'fulfilled' && roomsRes.value.success 
        ? roomsRes.value.data : [];
      const bookingsData = bookingsRes.status === 'fulfilled' && bookingsRes.value.success 
        ? bookingsRes.value.data : [];

      // Calculate metrics
      const staffOnDuty = staffData.filter(staff => staff.is_active).length;
      const totalRooms = roomsData.reduce((sum, room) => sum + (room.total_rooms || 0), 0);
      const availableRooms = roomsData.reduce((sum, room) => sum + (room.available_rooms || 0), 0);
      const roomsOccupied = totalRooms - availableRooms;

      // Today's bookings
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookingsData.filter(booking => 
        booking.check_in_date?.startsWith(today)
      ).length;

      setDashboardData({
        staffOnDuty,
        roomsOccupied,
        todayBookings,
        pendingTasks: 3, // Mock data
        roomStatus: roomsData,
        staffStatus: staffData,
        todayRevenue: 150000 // Mock data
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Staff on Duty"
          value={dashboardData.staffOnDuty}
          icon={Users}
          color="bg-green-500"
          subtitle="Currently active"
        />
        <StatCard
          title="Rooms Occupied"
          value={dashboardData.roomsOccupied}
          icon={Bed}
          color="bg-blue-500"
          subtitle="Out of total rooms"
        />
        <StatCard
          title="Today's Bookings"
          value={dashboardData.todayBookings}
          icon={Calendar}
          color="bg-purple-500"
          subtitle="Check-ins today"
        />
        <StatCard
          title="Pending Tasks"
          value={dashboardData.pendingTasks}
          icon={Clock}
          color="bg-orange-500"
          subtitle="Require attention"
        />
      </div>

      {/* Room Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Room Status Overview</h3>
          <div className="space-y-4">
            {dashboardData.roomStatus.map((room, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{room.room_type_details?.room_type || 'Unknown Type'}</h4>
                  <p className="text-sm text-gray-600">
                    {room.available_rooms} available / {room.total_rooms} total
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {room.status === 'Available' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : room.status === 'Maintenance' ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    room.status === 'Available' ? 'text-green-600' :
                    room.status === 'Maintenance' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {room.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Status</h3>
          <div className="space-y-3">
            {dashboardData.staffStatus.slice(0, 5).map((staff, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{staff.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    staff.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-xs font-medium ${
                    staff.is_active ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {staff.is_active ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">₦{dashboardData.todayRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Revenue Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.roomStatus.length > 0 ? 
                (dashboardData.roomsOccupied / dashboardData.roomStatus.reduce((sum, room) => sum + room.total_rooms, 0) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-500">Occupancy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{dashboardData.staffOnDuty}</div>
            <div className="text-sm text-gray-500">Staff on Duty</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Calendar className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">View Bookings</h4>
            <p className="text-sm text-gray-500">Check today's reservations</p>
          </button>
          <button
            onClick={() => setActiveTab('room-status')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Bed className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">Room Status</h4>
            <p className="text-sm text-gray-500">Monitor room availability</p>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900">Analytics</h4>
            <p className="text-sm text-gray-500">View performance reports</p>
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
      case 'analytics':
        return <TransactionsAnalytics />;
      case 'bookings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bookings Management</h3>
            <p className="text-gray-600">Bookings management functionality coming soon...</p>
          </div>
        );
      case 'room-status':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Room Status</h3>
            <p className="text-gray-600">Detailed room status functionality coming soon...</p>
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

export default SupervisorDashboard;