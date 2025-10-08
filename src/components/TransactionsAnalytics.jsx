import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, BarChart3, Download, Calendar, RefreshCw } from 'lucide-react';
import { apiRequest } from '../utils/api';
import toast from 'react-hot-toast';

const TransactionsAnalytics = ({ refreshTrigger }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalDrinkSales: 0,
    totalDrinkSalesCount: 0,
    occupancyRate: 0,
    averageBookingValue: 0,
    averageDrinkSale: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '', // Empty by default to show all-time data
    endDate: '' // Empty by default to show all-time data
  });

  useEffect(() => {
    fetchAnalytics();
    fetchTransactions();
  }, [dateRange]);

  // Refresh when triggered by booking operations
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchAnalytics();
      fetchTransactions();
    }
  }, [refreshTrigger]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch data from working endpoints only
      const [bookingsResponse, roomsResponse, barSalesResponse] = await Promise.allSettled([
        apiRequest('/bookings'),
        apiRequest('/room-inventory/dashboard'), 
        apiRequest('/bar-sales')
      ]);

      // Parse responses safely
      let bookings = [];
      let rooms = [];
      let barSales = [];
      
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value && bookingsResponse.value.ok) {
        const bookingsData = await bookingsResponse.value.json();
        bookings = bookingsData.success ? bookingsData.data || [] : [];
      }
      
      if (roomsResponse.status === 'fulfilled' && roomsResponse.value && roomsResponse.value.ok) {
        const roomsData = await roomsResponse.value.json();
        rooms = roomsData.success ? roomsData.data || [] : [];
      }
      
      if (barSalesResponse.status === 'fulfilled' && barSalesResponse.value && barSalesResponse.value.ok) {
        const barSalesData = await barSalesResponse.value.json();
        barSales = barSalesData.success ? barSalesData.data || [] : [];
      }

        // Filter by date range only if user has set specific dates (not default)
        const isDefaultDateRange = !dateRange.startDate || !dateRange.endDate;
        
        const filteredBookings = isDefaultDateRange ? bookings : bookings.filter(booking => {
          const bookingDate = new Date(booking.created_at || booking.check_in);
          const start = new Date(dateRange.startDate);
          const end = new Date(dateRange.endDate);
          return bookingDate >= start && bookingDate <= end;
        });

        // Filter bar sales by date range only if user has set specific dates  
        const filteredDrinkSales = isDefaultDateRange ? barSales : barSales.filter(sale => {
          const saleDate = new Date(sale.created_at || sale.date || sale.transaction_date);
          const start = new Date(dateRange.startDate);
          const end = new Date(dateRange.endDate);
          return saleDate >= start && saleDate <= end;
        });

        // Debug logging
        console.log('Analytics Debug:', {
          totalBookings: bookings.length,
          filteredBookings: filteredBookings.length,
          totalBarSales: barSales.length,
          filteredBarSales: filteredDrinkSales.length,
          rooms: rooms.length,
          dateRange
        });
        
        // Calculate analytics
        const bookingsRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
        const barSalesRevenue = filteredDrinkSales.reduce((sum, sale) => sum + (sale.total_amount || sale.amount || 0), 0);
        const totalBookings = filteredBookings.length;
        
        // Calculate occupancy rate using dynamic room availability data
        // Now uses /dashboard endpoint which provides real-time availability based on active bookings
        const totalRoomCapacity = rooms.reduce((sum, room) => sum + (room.total_rooms || 0), 0);
        const totalOccupiedRooms = rooms.reduce((sum, room) => {
          return sum + ((room.total_rooms || 0) - (room.available_rooms || 0));
        }, 0);
        
        const occupancyRate = totalRoomCapacity > 0 ? (totalOccupiedRooms / totalRoomCapacity) * 100 : 0;
        const averageBookingValue = totalBookings > 0 ? bookingsRevenue / totalBookings : 0;
        const averageDrinkSale = filteredDrinkSales.length > 0 ? barSalesRevenue / filteredDrinkSales.length : 0;
        
        // Calculate booking source statistics using created_by_role
        const onlineBookings = filteredBookings.filter(b => 
          b.created_by_role === 'client' || b.payment_method === 'flutterwave'
        ).length;
        const manualBookings = filteredBookings.filter(b => 
          b.created_by_role === 'superadmin' || b.created_by_role === 'receptionist' || b.payment_method === 'manual'
        ).length;
        const onlineRevenue = filteredBookings.filter(b => 
          b.created_by_role === 'client' || b.payment_method === 'flutterwave'
        ).reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const manualRevenue = filteredBookings.filter(b => 
          b.created_by_role === 'superadmin' || b.created_by_role === 'receptionist' || b.payment_method === 'manual'
        ).reduce((sum, b) => sum + (b.total_amount || 0), 0);

        setAnalytics({
          totalRevenue: bookingsRevenue + barSalesRevenue,
          totalBookings,
          totalDrinkSales: barSalesRevenue,
          totalDrinkSalesCount: filteredDrinkSales.length,
          totalTransactions: totalBookings + filteredDrinkSales.length, // Combined count
          occupancyRate,
          averageBookingValue,
          averageDrinkSale,
          // Add booking source analytics
          onlineBookings,
          manualBookings,
          onlineRevenue,
          manualRevenue
        });
        
        // Create combined transactions for recent activities if transactions endpoint is not working
        if (transactions.length === 0) {
          const recentTransactions = [];
          
          // Add recent bookings with source indication
          filteredBookings.slice(0, 5).forEach(booking => {
            const isOnline = booking.created_by_role === 'client' || booking.payment_method === 'flutterwave';
            const sourceIcon = isOnline ? '🌐' : '🏢';
            const sourceText = isOnline ? 'Online' : 'Manual';
            const creatorLabel = booking.created_by_role === 'client' ? 'Client' :
                               booking.created_by_role === 'superadmin' ? 'SuperAdmin' :
                               booking.created_by_role === 'receptionist' ? 'Receptionist' :
                               isOnline ? 'Online' : 'Manual';
            
            recentTransactions.push({
              id: `booking_${booking.id}`,
              type: `${sourceIcon} ${sourceText} Booking`,
              description: `${booking.guest_name} - ${booking.room_type || 'Unknown Room'} (${creatorLabel})`,
              amount: booking.total_amount || 0,
              created_at: booking.check_in || booking.created_at,
              status: booking.status || 'completed',
              booking_source: isOnline ? 'online' : 'manual',
              created_by_role: booking.created_by_role
            });
          });
          
          // Add recent bar sales
          filteredDrinkSales.slice(0, 5).forEach(sale => {
            recentTransactions.push({
              id: `sale_${sale.id}`,
              type: 'Bar Sale',
              description: `${sale.drinks?.drink_name || sale.drink_name || 'Unknown Drink'} (${sale.quantity})`,
              amount: sale.total_amount || sale.amount || 0,
              created_at: sale.created_at || sale.date,
              status: 'completed'
            });
          });
          
          // Sort by date (newest first) and limit to 10
          recentTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setTransactions(recentTransactions.slice(0, 10));
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
      
      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter transactions by date range only if dates are set
          const isDefaultDateRange = !dateRange.startDate || !dateRange.endDate;
          const filtered = isDefaultDateRange ? (data.data || []) : (data.data || []).filter(transaction => {
            const transactionDate = new Date(transaction.created_at || transaction.transaction_date);
            const start = new Date(dateRange.startDate);
            const end = new Date(dateRange.endDate);
            return transactionDate >= start && transactionDate <= end;
          });
          setTransactions(filtered);
        } else {
          console.log('No transaction data available');
          setTransactions([]);
        }
      } else {
        console.log('Transaction endpoint not available');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      // For now, create mock transactions from bookings and bar sales
      setTransactions([]);
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
      toast.error('No data to export');
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
      const data = response && response.ok ? await response.json() : { success: false, data: [] };
      if (data.success) {
        exportToCSV(data.data, 'bookings_report');
      } else {
        toast.error('No bookings data available to export');
      }
    } catch (err) {
      toast.error('Failed to export bookings: ' + err.message);
    }
  };

  const exportTransactions = async () => {
    try {
      // If no transactions available, create them from bookings and bar sales
      if (transactions.length === 0) {
        const [bookingsRes, barSalesRes] = await Promise.allSettled([
          apiRequest('/bookings'),
          apiRequest('/bar-sales')
        ]);
        
        let combinedTransactions = [];
        
        // Add bookings as transactions
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value && bookingsRes.value.ok) {
          const bookingsData = await bookingsRes.value.json();
          const bookings = bookingsData.success ? bookingsData.data || [] : [];
          
          bookings.forEach(booking => {
            combinedTransactions.push({
              id: `booking_${booking.id}`,
              type: 'Room Booking',
              description: `Room: ${booking.room_type || 'Unknown'}`,
              amount: booking.total_amount || 0,
              date: booking.check_in || booking.created_at,
              guest: booking.guest_name,
              status: booking.status || 'completed'
            });
          });
        }
        
        // Add bar sales as transactions
        if (barSalesRes.status === 'fulfilled' && barSalesRes.value && barSalesRes.value.ok) {
          const barSalesData = await barSalesRes.value.json();
          const barSales = barSalesData.success ? barSalesData.data || [] : [];
          
          barSales.forEach(sale => {
            combinedTransactions.push({
              id: `sale_${sale.id}`,
              type: 'Bar Sale',
              description: `${sale.drinks?.drink_name || sale.drink_name || 'Unknown'} (${sale.quantity})`,
              amount: sale.total_amount || sale.amount || 0,
              date: sale.created_at || sale.date,
              status: 'completed'
            });
          });
        }
        
        exportToCSV(combinedTransactions, 'transactions_report');
      } else {
        exportToCSV(transactions, 'transactions_report');
      }
    } catch (err) {
      toast.error('Failed to export transactions: ' + err.message);
    }
  };

  const exportBarSales = async () => {
    try {
      const response = await apiRequest('/bar-sales');
      const data = response && response.ok ? await response.json() : { success: false, data: [] };
      if (data.success) {
        exportToCSV(data.data, 'bar_sales_report');
      } else {
        toast.error('No bar sales data available to export');
      }
    } catch (err) {
      toast.error('Failed to export bar sales: ' + err.message);
    }
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
          value={`₦${analytics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
          subtext="All sources combined"
        />
        
        <StatCard
          title="Total Bookings"
          value={analytics.totalBookings}
          icon={Users}
          color="bg-blue-500"
          subtext={`₦${(analytics.totalRevenue - analytics.totalDrinkSales).toLocaleString()} revenue`}
        />
        
        <StatCard
          title="Occupancy Rate"
          value={`${analytics.occupancyRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-purple-500"
          subtext="Current occupancy"
        />
        
        <StatCard
          title="Bar Sales"
          value={analytics.totalDrinkSalesCount || 0}
          icon={BarChart3}
          color="bg-orange-500"
          subtext={`₦${analytics.totalDrinkSales.toLocaleString()} revenue`}
        />
        
        <StatCard
          title="Total Transactions"
          value={analytics.totalTransactions || (analytics.totalBookings + analytics.totalDrinkSalesCount)}
          icon={DollarSign}
          color="bg-indigo-500"
          subtext={`₦${analytics.totalRevenue.toLocaleString()} total (Bookings + Bar Sales)`}
        />
      </div>

      {/* Booking Source Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">🌐 Online Bookings</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.onlineBookings || 0}</p>
                <p className="text-sm text-blue-600">₦{(analytics.onlineRevenue || 0).toLocaleString()} revenue</p>
              </div>
              <div className="text-blue-400">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">🏢 Manual Bookings</p>
                <p className="text-2xl font-bold text-green-900">{analytics.manualBookings || 0}</p>
                <p className="text-sm text-green-600">₦{(analytics.manualRevenue || 0).toLocaleString()} revenue</p>
              </div>
              <div className="text-green-400">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
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
          
          <button
            onClick={exportBarSales}
            className="flex items-center px-4 py-2 bg-[#7B3F00] text-white rounded-md hover:bg-[#8B4513] transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Bar Sales (CSV)
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
                      ₦{transaction.amount || 0}
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


    </div>
  );
};

export default TransactionsAnalytics;