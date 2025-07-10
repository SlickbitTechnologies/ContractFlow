import React, { useState } from 'react';
import { Bell, Moon, Sun, RefreshCw, Globe, Shield } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    notifications: true,
    darkMode: false,
    dataSource: 'yahoo',
    currency: 'USD',
    language: 'en'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">General</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RefreshCw size={20} className="text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Auto-refresh</div>
                <div className="text-sm text-gray-500">Automatically update data every 5 minutes</div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('autoRefresh')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.autoRefresh ? 'transform translate-x-6' : 'transform translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell size={20} className="text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Notifications</div>
                <div className="text-sm text-gray-500">Get alerts for price changes and news</div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('notifications')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.notifications ? 'transform translate-x-6' : 'transform translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {settings.darkMode ? <Moon size={20} className="text-gray-600 mr-3" /> : <Sun size={20} className="text-gray-600 mr-3" />}
              <div>
                <div className="font-medium text-gray-900">Dark Mode</div>
                <div className="text-sm text-gray-500">Switch between light and dark themes</div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('darkMode')}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                settings.darkMode ? 'transform translate-x-6' : 'transform translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Display</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
            <select
              value={settings.dataSource}
              onChange={(e) => handleSelect('dataSource', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="yahoo">Yahoo Finance</option>
              <option value="alpha">Alpha Vantage</option>
              <option value="polygon">Polygon.io</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleSelect('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleSelect('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Security</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <Shield size={20} className="text-gray-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Data Privacy</div>
              <div className="text-sm text-gray-500">Your data is encrypted and never shared</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Globe size={20} className="text-gray-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">API Usage</div>
              <div className="text-sm text-gray-500">Current usage: 1,234 calls this month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 