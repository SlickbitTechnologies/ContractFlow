import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Share2, 
  CheckCircle, 
  AlertCircle, 
  Upload,
  FileText,
  ArrowRight
} from 'lucide-react';

const Settings = ({ setActiveTab, onDataChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // SharePoint integration state
  const [sharepointStatus, setSharepointStatus] = useState('disconnected');
  const [sharepointSites, setSharepointSites] = useState([]);
  const [sharepointFiles, setSharepointFiles] = useState([]);
  const [sharepointLoading, setSharepointLoading] = useState(false);
  const [sharepointError, setSharepointError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(null);

  const integrations = [
    {
      name: 'Microsoft SharePoint',
      description: 'Connected to Microsoft SharePoint',

    },
  ];

  // Test SharePoint connection
  const testSharePointConnection = async () => {
    setSharepointLoading(true);
    setSharepointError('');
    try {
      const response = await fetch('https://contract.orangebeach-467a73d4.southindia.azurecontainerapps.io/sharepoint/status');
      const data = await response.json();
      setSharepointStatus(data.status);
      if (data.status === 'connected') {
        await fetchSharePointSites();
        await fetchSharePointFiles();
      } else {
        setSharepointError(data.message);
      }
    } catch (error) {
      setSharepointStatus('error');
      setSharepointError('Failed to connect to SharePoint');
    }
    setSharepointLoading(false);
  };

  // Fetch SharePoint sites
  const fetchSharePointSites = async () => {
    try {
      const response = await fetch('https://contract.orangebeach-467a73d4.southindia.azurecontainerapps.io/sharepoint/sites');
      const data = await response.json();
      if (data.value) {
        setSharepointSites(data.value);
      }
    } catch (error) {
      setSharepointError('Failed to fetch SharePoint sites');
    }
  };

  // Fetch SharePoint files from specific site
  const fetchSharePointFiles = async () => {
    try {
      const response = await fetch('https://contract.orangebeach-467a73d4.southindia.azurecontainerapps.io/sharepoint/specific-site/files');
      const data = await response.json();
      if (data.value) {
        setSharepointFiles(data.value);
      }
    } catch (error) {
      setSharepointError('Failed to fetch SharePoint files');
    }
  };

  // Upload document to contracts
  const uploadDocumentToContracts = async (file) => {
    setUploadingFile(file.name);
    try {
      // First, download the file from SharePoint
      const downloadResponse = await fetch(`https://contract.orangebeach-467a73d4.southindia.azurecontainerapps.io/sharepoint/download/${file.id}`);
      const fileBlob = await downloadResponse.blob();
      
      // Create a File object from the blob
      const fileObject = new File([fileBlob], file.name, { type: file.file?.mimeType || 'application/pdf' });
      
      // Upload to contracts page
      const formData = new FormData();
      formData.append('file', fileObject);
      
      const uploadResponse = await fetch('https://contract.orangebeach-467a73d4.southindia.azurecontainerapps.io/upload_contract/', {
        method: 'POST',
        body: formData,
      });
      
      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        alert(`Successfully uploaded ${file.name} to contracts!`);
        // Switch to contracts tab and refresh contracts list
        if (typeof setActiveTab === 'function') setActiveTab('contracts');
        if (typeof onDataChange === 'function') onDataChange();
      } else {
        throw new Error('Failed to upload to contracts');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`Failed to upload ${file.name}: ${error.message}`);
    } finally {
      setUploadingFile(null);
    }
  };

  // Connect to SharePoint
  const connectToSharePoint = async () => {
    await testSharePointConnection();
  };

  // Get expiring contracts for notifications
  const getExpiringContracts = () => {
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return contracts.filter(contract => {
      const endDate = new Date(contract.ends);
      return endDate <= thirtyDaysFromNow && endDate >= new Date();
    });
  };

  useEffect(() => {
    const expiringContracts = getExpiringContracts();
    setNotifications(expiringContracts);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your application preferences and integrations</p>
      </div>

      {/* Notifications Section */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-lg hover:-translate-y-1 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Contracts Expiring Soon</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((contract, index) => (
                      <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{contract.company}</p>
                            <p className="text-sm text-gray-600">{contract.service}</p>
                            <p className="text-sm text-red-600">Expires: {contract.ends}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500 text-center">
                      No contracts expiring in the next 30 days
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
          </div> */}
          
      {/* Integrations Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 rounded-full p-2">
            <Share2 className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
        </div>
        
        <div className="space-y-6">
          {integrations.map((integration, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Share2 className="w-5 h-5 text-blue-600" />
                  </div>
            <div>
                    <h3 className="font-medium text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-green-600">{integration.description}</p>
                  </div>
            </div>
                <button
                  onClick={connectToSharePoint}
                  disabled={sharepointLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sharepointLoading ? 'Fetching...' : 'Fetch Files'}
                </button>
          </div>
          
              {/* SharePoint Status and Files */}
              {sharepointStatus === 'connected' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">SharePoint Connected</span>
                  </div>
                  {sharepointSites.length > 0 && (
                    <div className="mb-4">
                      {/* <h5 className="font-medium text-green-800 mb-2">Available Sites:</h5> */}
                      <ul className="space-y-1">
                        {/* {sharepointSites.map((site, index) => (
                          <li key={index} className="text-sm text-green-700">
                            • {site.name} ({site.webUrl})
                          </li>
                        ))} */}
                      </ul>
                    </div>
                  )}
                  {sharepointFiles.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-800 mb-3">Documents in SharePoint:</h5>
                      <div className="space-y-2">
                        {sharepointFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 rounded-full p-1">
                                <FileText className="w-4 h-4 text-green-600" />
                              </div>
            <div>
                                <p className="font-medium text-green-800">{file.name}</p>
                                <p className="text-sm text-green-600">
                                  {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => uploadDocumentToContracts(file)}
                              disabled={uploadingFile === file.name}
                              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {uploadingFile === file.name ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  <span>Upload to Contracts</span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
            </div>
                  )}
          </div>
              )}

              {sharepointError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{sharepointError}</span>
            </div>
          </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;