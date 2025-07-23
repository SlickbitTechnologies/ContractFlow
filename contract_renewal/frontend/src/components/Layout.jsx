import React, { useRef, useEffect } from 'react';
import { Bell, Settings, User } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Layout = ({ children, activeTab, onTabChange, user, contracts }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'contracts', label: 'Contracts', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Calculate notification count (contracts expiring in next 30 days)
  const getNotificationCount = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);
    return contracts.filter((c) => {
      if (!c.ends || c.ends === 'TBD') return false;
      const endDate = new Date(c.ends);
      return endDate >= now && endDate <= in30Days;
    }).length;
  };

  const notificationCount = getNotificationCount();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationRef = useRef();

  // Get contracts expiring in next 30 days
  const getExpiringContracts = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);
    return contracts.filter((c) => {
      if (!c.ends || c.ends === 'TBD') return false;
      const endDate = new Date(c.ends);
      return endDate >= now && endDate <= in30Days;
    });
  };

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* <div className="flex items-center space-x-2"> */}
                <img
                  src="assets/images/slickbitLogo.png"                  alt="slickbit Logo"
                  className="w-35 h-10 rounded-lg object-contain bg-white border border-gray-200"
                />
                {/* <h1 className="text-xl font-semibold text-gray-900">ContractFlow</h1> */}
              {/* </div> */}
              
              <nav className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4 relative">
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-2 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowNotifications((prev) => !prev)}
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b font-semibold text-gray-900">Expiring in 30 Days</div>
                    <ul className="max-h-64 overflow-y-auto">
                      {getExpiringContracts().length === 0 ? (
                        <li className="p-4 text-gray-500">No contracts expiring soon.</li>
                      ) : (
                        getExpiringContracts().map((c, idx) => (
                          <li key={idx} className="p-4 border-b last:border-b-0">
                            <div className="font-medium">{c.company}</div>
                            <div className="text-sm text-gray-500">{c.service}</div>
                            <div className="text-xs text-gray-400">Ends: {c.ends}</div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={handleLogout}>
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                    alt="User" 
                    className="w-8 h-8 rounded-full"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;