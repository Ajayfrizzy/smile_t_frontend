import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Bed, 
  Package, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  User,
  ChevronDown,
  Plus,
  Eye,
  ShoppingCart,
  Wine
} from 'lucide-react';

const DashboardLayout = ({ children, userRole, userName, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdown]);

  // Get navigation items based on user role
    const getNavigationItems = (role) => {
    const baseItems = [
      { id: 'overview', name: 'Overview', icon: Home, roles: ['superadmin', 'supervisor', 'receptionist', 'barmen'] }
    ];

    const roleSpecificItems = [
      // Super Admin - Full Access
      { id: 'staff', name: 'Staff Management', icon: Users, roles: ['superadmin'] },
      { id: 'room-inventory', name: 'Room Management', icon: Bed, roles: ['superadmin'] },
      { id: 'drinks', name: 'Drinks Management', icon: Package, roles: ['superadmin'] },
      { id: 'bookings', name: 'Bookings', icon: FileText, roles: ['superadmin', 'supervisor', 'receptionist'] },
      { id: 'bar-sales', name: 'Bar Sales', icon: BarChart3, roles: ['superadmin', 'supervisor'] },
      { id: 'analytics', name: 'Analytics', icon: BarChart3, roles: ['superadmin'] },
      
      // Receptionist - Front Desk
      { id: 'rooms', name: 'Available Rooms', icon: Bed, roles: ['receptionist'] },
      { id: 'check-in', name: 'Check In/Out', icon: Bed, roles: ['receptionist'] },
      
      // Barmen specific
      { id: 'create-sale', name: 'Create Sale', icon: ShoppingCart, roles: ['barmen'] },
      { id: 'view-inventory', name: 'View Inventory', icon: Wine, roles: ['barmen'] },
      
      // Common items
            // Settings removed from sidebar as requested
    ];

    return [...baseItems, ...roleSpecificItems].filter(item => 
      item.roles.includes(role)
    );
  };

  const navigationItems = getNavigationItems(userRole);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'superadmin': 'Super Administrator',
      'supervisor': 'Supervisor',
      'receptionist': 'Receptionist',
      'barmen': 'Barman'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed Position */}
      <div 
        className={`bg-white shadow-sm transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col fixed left-0 top-0 h-full z-30 overflow-y-auto hover:w-64 group`}
        onMouseEnter={() => !sidebarOpen && setSidebarOpen(true)}
        onMouseLeave={() => sidebarOpen && setSidebarOpen(false)}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#7B3F00] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">Smile-T</h1>
                <p className="text-xs text-gray-500">Continental</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-[#7B3F00] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
                  sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                }`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content - Adjusted margin to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header - Fixed position with proper z-index */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 fixed top-0 right-0 z-20 transition-all duration-300" 
                style={{ left: sidebarOpen ? '256px' : '80px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {activeTab.replace('-', ' ')} Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Welcome back, {userName}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown-container">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setProfileDropdown(!profileDropdown);
                  }}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-[#7B3F00] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[60]"
                    style={{ zIndex: 60 }}
                  >
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setProfileDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 p-6 mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;