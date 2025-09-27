import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import DrinksManagement from '../components/DrinksManagement';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  ShoppingCart,
  BarChart3,
  Plus,
  Search
} from 'lucide-react';
import { apiRequest } from '../utils/api';

const BarmenDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalDrinks: 0,
    lowStockItems: 0,
    todaySales: 0,
    totalRevenue: 0,
    topSellingDrinks: [],
    recentTransactions: [],
    stockAlerts: []
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
      
      // Fetch bar-related data
      const [drinksRes, salesRes] = await Promise.allSettled([
        apiRequest('/drinks'),
        apiRequest('/bar-sales')
      ]);

      const drinksData = drinksRes.status === 'fulfilled' && drinksRes.value.success 
        ? drinksRes.value.data : [];
      const salesData = salesRes.status === 'fulfilled' && salesRes.value.success 
        ? salesRes.value.data : [];

      // Calculate metrics
      const totalDrinks = drinksData.length;
      const lowStockItems = drinksData.filter(drink => 
        drink.stock_quantity <= drink.min_stock_level
      ).length;

      // Mock today's sales and revenue
      const todaySales = 25;
      const totalRevenue = 85000;

      // Mock top selling drinks
      const topSellingDrinks = [
        { name: 'Beer', quantity: 45, revenue: 22500 },
        { name: 'Wine', quantity: 20, revenue: 15000 },
        { name: 'Cocktail', quantity: 30, revenue: 25000 }
      ];

      // Generate stock alerts
      const stockAlerts = drinksData
        .filter(drink => drink.stock_quantity <= drink.min_stock_level)
        .map(drink => ({
          name: drink.name || drink.drink_name,
          currentStock: drink.stock_quantity,
          minLevel: drink.min_stock_level,
          severity: drink.stock_quantity === 0 ? 'critical' : 'warning'
        }));

      setDashboardData({
        totalDrinks,
        lowStockItems,
        todaySales,
        totalRevenue,
        topSellingDrinks,
        recentTransactions: salesData.slice(0, 5), // Show recent 5
        stockAlerts: stockAlerts.slice(0, 5) // Show top 5 alerts
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm p-6 border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const StockAlert = ({ alert }) => (
    <div className={`p-3 rounded-lg border-l-4 ${
      alert.severity === 'critical' 
        ? 'bg-red-50 border-red-400' 
        : 'bg-yellow-50 border-yellow-400'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{alert.name}</p>
          <p className="text-sm text-gray-600">
            Stock: {alert.currentStock} / Min: {alert.minLevel}
          </p>
        </div>
        <AlertTriangle className={`w-5 h-5 ${
          alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
        }`} />
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Drinks"
          value={dashboardData.totalDrinks}
          icon={Package}
          color="bg-blue-500"
          subtitle="In inventory"
          onClick={() => setActiveTab('drinks')}
        />
        <StatCard
          title="Low Stock Items"
          value={dashboardData.lowStockItems}
          icon={AlertTriangle}
          color="bg-red-500"
          subtitle="Need restocking"
          onClick={() => setActiveTab('inventory')}
        />
        <StatCard
          title="Today's Sales"
          value={dashboardData.todaySales}
          icon={ShoppingCart}
          color="bg-green-500"
          subtitle="Transactions"
          trend="+12% from yesterday"
        />
        <StatCard
          title="Total Revenue"
          value={`₦${dashboardData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          subtitle="This month"
          trend="+8% from last month"
        />
      </div>

      {/* Stock Alerts */}
      {dashboardData.stockAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Stock Alerts</h3>
            <button 
              onClick={() => setActiveTab('inventory')}
              className="text-sm text-[#7B3F00] hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.stockAlerts.map((alert, index) => (
              <StockAlert key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Sales Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Drinks */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Drinks</h3>
          <div className="space-y-4">
            {dashboardData.topSellingDrinks.map((drink, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{drink.name}</h4>
                  <p className="text-sm text-gray-600">{drink.quantity} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₦{drink.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.item_name || 'Sale'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at || Date.now()).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₦{(transaction.total_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('sales')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Plus className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">New Sale</h4>
            <p className="text-sm text-gray-500">Record a transaction</p>
          </button>
          <button
            onClick={() => setActiveTab('drinks')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Package className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Drinks</h4>
            <p className="text-sm text-gray-500">Update inventory</p>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <Search className="w-8 h-8 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900">Check Stock</h4>
            <p className="text-sm text-gray-500">Monitor inventory levels</p>
          </button>
          <button
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-orange-500 mb-2" />
            <h4 className="font-medium text-gray-900">View Reports</h4>
            <p className="text-sm text-gray-500">Sales analytics</p>
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
      case 'drinks':
        return <DrinksManagement />;
      case 'inventory':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Drink Inventory</h3>
            <p className="text-gray-600">Detailed inventory management functionality coming soon...</p>
          </div>
        );
      case 'sales':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Management</h3>
            <p className="text-gray-600">Sales recording functionality coming soon...</p>
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

export default BarmenDashboard;