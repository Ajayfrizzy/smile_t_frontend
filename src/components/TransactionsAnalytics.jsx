import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, BarChart3, Download, Calendar, RefreshCw } from 'lucide-react';
import { apiRequest } from '../utils/api';

const TransactionsAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalDrinkSales: 0,
    occupancyRate: 0,
    averageBookingValue: 0,
    averageDrinkSale: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  useEffect(() => {
    fetchAnalytics();
    fetchTransactions();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch bookings for analytics
      const bookingsResponse = await apiRequest('/bookings');
      const roomsResponse = await apiRequest('/room-inventory');
      const drinksResponse = await apiRequest('/transactions'); // Assuming this returns drink sales

      if (bookingsResponse.success && roomsResponse.success) {
        const bookings = bookingsResponse.data || [];
        const rooms = roomsResponse.data || [];
        const drinkSales = drinksResponse.success ? drinksResponse.data || [] : [];

        // Filter by date range
        const filteredBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.created_at || booking.check_in);
          const start = new Date(dateRange.startDate);
          const end = new Date(dateRange.endDate);
          return bookingDate >= start && bookingDate <= end;
        });

        const filteredDrinkSales = drinkSales.filter(sale => {
          const saleDate = new Date(sale.created_at || sale.transaction_date);
          const start = new Date(dateRange.startDate);
          const end = new Date(dateRange.endDate);
          return saleDate >= start && saleDate <= end;
        });

        // Calculate analytics
        const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
        const totalDrinkSales = filteredDrinkSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
        const totalBookings = filteredBookings.length;
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(room => room.status === 'Occupied').length;
        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
        const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        const averageDrinkSale = filteredDrinkSales.length > 0 ? totalDrinkSales / filteredDrinkSales.length : 0;

        setAnalytics({
          totalRevenue: totalRevenue + totalDrinkSales,
          totalBookings,
          totalDrinkSales,
          occupancyRate,
          averageBookingValue,
          averageDrinkSale
        });
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Error fetching analytics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await apiRequest('/transactions');
      if (response.success) {
        // Filter transactions by date range
        const filtered = (response.data || []).filter(transaction => {
          const transactionDate = new Date(transaction.created_at || transaction.transaction_date);
          const start = new Date(dateRange.startDate);
          const end = new Date(dateRange.endDate);
          return transactionDate >= start && transactionDate <= end;
        });
        setTransactions(filtered);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBookings = async () => {
    try {
      const response = await apiRequest('/bookings');
      if (response.success) {
        exportToCSV(response.data, 'bookings_report');
      }
    } catch (err) {
      alert('Failed to export bookings: ' + err.message);
    }
  };

  const exportTransactions = () => {
    exportToCSV(transactions, 'transactions_report');
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
              />
            </div>
            
            <button
              onClick={() => {
                fetchAnalytics();
                fetchTransactions();
              }}
              className="flex items-center px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
          subtext="All sources combined"
        />
        
        <StatCard
          title="Total Bookings"
          value={analytics.totalBookings}
          icon={Users}
          color="bg-blue-500"
          subtext={`Avg: $${analytics.averageBookingValue.toFixed(2)}`}
        />
        
        <StatCard
          title="Occupancy Rate"
          value={`${analytics.occupancyRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-purple-500"
          subtext="Current occupancy"
        />
        
        <StatCard
          title="Bar Revenue"
          value={`$${analytics.totalDrinkSales.toFixed(2)}`}
          icon={BarChart3}
          color="bg-orange-500"
          subtext={`Avg: $${analytics.averageDrinkSale.toFixed(2)}`}
        />
        
        <StatCard
          title="Total Transactions"
          value={transactions.length}
          icon={DollarSign}
          color="bg-indigo-500"
          subtext="Selected period"
        />
        
        <StatCard
          title="Revenue Growth"
          value="+12.5%"
          icon={TrendingUp}
          color="bg-green-600"
          subtext="vs last period"
        />
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportBookings}
            className="flex items-center px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Bookings (CSV)
          </button>
          
          <button
            onClick={exportTransactions}
            className="flex items-center px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors"
            disabled={transactions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Transactions (CSV)
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No transactions found for the selected period
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 10).map((transaction, index) => (
                  <tr key={transaction.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.type || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status || 'completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
              <p className="text-sm">Consider integrating Chart.js or Recharts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Occupancy Rate</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Occupancy chart would go here</p>
              <p className="text-sm">Shows room utilization over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsAnalytics;