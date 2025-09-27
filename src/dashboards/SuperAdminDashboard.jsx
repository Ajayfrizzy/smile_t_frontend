import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import StaffManagement from '../components/StaffManagement';
import RoomManagement from '../components/RoomManagement';
import RoomInventoryManagement from '../components/RoomInventoryManagement';
import DrinksManagement from '../components/DrinksManagement';
import TransactionsAnalytics from '../components/TransactionsAnalytics';
import { 
  Users, 
  Bed, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { apiRequest } from '../utils/api';

const SuperAdminDashboard = () => {
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

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [staffRes, roomsRes, bookingsRes, analyticsRes] = await Promise.allSettled([
        apiRequest('/staff'),
        apiRequest('/room-inventory'),
        apiRequest('/bookings'),
        apiRequest('/analytics/overview')
      ]);

      // Process staff data
      const staffData = staffRes.status === 'fulfilled' && staffRes.value.success 
        ? staffRes.value.data : [];
      
      // Process rooms data
      const roomsData = roomsRes.status === 'fulfilled' && roomsRes.value.success 
        ? roomsRes.value.data : [];
      
      // Process bookings data
      const bookingsData = bookingsRes.status === 'fulfilled' && bookingsRes.value.success 
        ? bookingsRes.value.data : [];
      
      // Process analytics data
      const analyticsData = analyticsRes.status === 'fulfilled' && analyticsRes.value.success 
        ? analyticsRes.value.data : {};

      // Calculate totals
      const totalRooms = roomsData.reduce((sum, room) => sum + (room.total_rooms || 0), 0);
      const availableRooms = roomsData.reduce((sum, room) => sum + (room.available_rooms || 0), 0);
      const totalRevenue = analyticsData.totalRevenue || 0;

      setDashboardData({
        totalStaff: staffData.length,
        totalRooms,
        availableRooms,
        totalBookings: bookingsData.length,
        totalRevenue,
        recentActivities: analyticsData.recentActivities || []
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
          title="Total Revenue"
          value={`₦${dashboardData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-yellow-500"
          subtitle="All time"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      case 'rooms':
        return <RoomManagement />;
      case 'room-inventory':
        return <RoomInventoryManagement />;
      case 'drinks':
        return <DrinksManagement />;
      case 'analytics':
        return <TransactionsAnalytics />;
      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reports</h3>
            <p className="text-gray-600">Reports functionality coming soon...</p>
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

export default SuperAdminDashboard;