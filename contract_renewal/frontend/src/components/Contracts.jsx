import React, { useState } from 'react';
import { Filter, Eye, Edit, Download, X } from 'lucide-react';

const Contracts = ({ contracts, onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContract, setEditContract] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFiles = async (files) => {
    setLoadingMessage('Uploading and processing...');
    setLoading(true);
    setUploadedFiles(files.map(file => file.name));
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      // https://contractsrenewalapplication.nicefield-a95bbc97.southcentralus.azurecontainerapps.io
      await fetch('https://contractsrenewalapplication.nicefield-a95bbc97.southcentralus.azurecontainerapps.io/upload_contract/', {
        method: 'POST',
        body: formData,
      });
    }
    await onDataChange(); // Refresh contracts list
    setLoading(false);
    setLoadingMessage('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleEditClick = (contract) => {
    setEditContract({ ...contract });
    setIsEditModalOpen(true);
  };

  const handleViewPdf = (contract) => {
    setSelectedPdfUrl(contract.pdf_url);
    setPdfModalOpen(true);
  };

  // Filtering logic
  const filteredContracts = contracts.filter((contract) => {
    // Search by company or service
    const matchesSearch =
      contract.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.service.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === 'All Status' ||
      contract.status.toLowerCase() === statusFilter.toLowerCase();

    // Action filter
    const matchesAction =
      actionFilter === 'All Actions' ||
      contract.action.toLowerCase() === actionFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesAction;
  });

  const getStatusBadge = (status, priority) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded";
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-700`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'low':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const getActionBadge = (action) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded";
    return action === 'Renew' 
      ? `${baseClasses} bg-green-100 text-green-700`
      : `${baseClasses} bg-red-100 text-red-700`;
  };

  // Delete contract handler
  const handleDelete = async (contractToDelete) => {
    if (!contractToDelete.firebase_doc_id) {
      alert('Cannot delete: missing Firestore document ID.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this contract?')) {
      return;
    }
    try {
      setLoadingMessage('Please wait, deleting the PDF...');
      setLoading(true);
      await fetch(`https://contractsrenewalapplication.nicefield-a95bbc97.southcentralus.azurecontainerapps.io/contracts/${contractToDelete.firebase_doc_id}`, {
        method: 'DELETE',
      });
      await onDataChange(); // Refresh contracts list
      setLoading(false);
      setLoadingMessage('');
    } catch (error) {
      setLoading(false);
      setLoadingMessage('');
      alert('Failed to delete contract.');
    }
  };

  // Add effect to close PDF modal on Escape or outside click
  React.useEffect(() => {
    if (!pdfModalOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setPdfModalOpen(false);
    }
    function handleClickOutside(e) {
      if (e.target.classList.contains('pdf-modal-overlay')) setPdfModalOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pdfModalOpen]);

  return (
    <div className="space-y-6 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-lg text-white font-semibold">{loadingMessage}</span>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && editContract && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Contract</h3>
            <div className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                value={editContract.company}
                onChange={e => setEditContract({ ...editContract, company: e.target.value })}
                placeholder="Company"
              />
              <input
                className="w-full border p-2 rounded"
                value={editContract.service}
                onChange={e => setEditContract({ ...editContract, service: e.target.value })}
                placeholder="Service"
              />
              <select
                className="w-full border p-2 rounded"
                value={editContract.status}
                onChange={e => setEditContract({ ...editContract, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
              </select>
              <select
                className="w-full border p-2 rounded"
                value={editContract.action}
                onChange={e => setEditContract({ ...editContract, action: e.target.value })}
              >
                <option value="Renew">Renew</option>
                <option value="Cancel">Cancel</option>
                <option value="Review">Review</option>
              </select>
              <input
                className="w-full border p-2 rounded"
                value={editContract.category}
                onChange={e => setEditContract({ ...editContract, category: e.target.value })}
                placeholder="Category"
              />
              <input
                className="w-full border p-2 rounded"
                value={editContract.ends}
                onChange={e => setEditContract({ ...editContract, ends: e.target.value })}
                placeholder="Ends"
              />
              <input
                className="w-full border p-2 rounded"
                value={editContract.value}
                onChange={e => setEditContract({ ...editContract, value: e.target.value })}
                placeholder="Value"
              />
              <select
                className="w-full border p-2 rounded"
                value={editContract.priority}
                onChange={e => setEditContract({ ...editContract, priority: e.target.value })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={async () => {
                  await fetch(`https://contractsrenewalapplication.nicefield-a95bbc97.southcentralus.azurecontainerapps.io/contracts/${editContract.firebase_doc_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editContract),
                  });
                  setIsEditModalOpen(false);
                  onDataChange();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {pdfModalOpen && selectedPdfUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 pdf-modal-overlay">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all"
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Close PDF"
              onClick={() => setPdfModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={selectedPdfUrl}
              title="Contract PDF"
              className="w-full h-[80vh] rounded"
            />
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contract Management</h2>
          <p className="text-gray-600">Search, filter, and manage all contracts</p>
        </div>
        {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button> */}
      </div>

      {/* Upload Area */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 hover:shadow-lg hover:-translate-y-1 transition-all">
        <div className="flex items-center space-x-2 mb-4">
          <span role="img" aria-label="upload" className="w-5 h-5 text-gray-400">⬆️</span>
          <h3 className="font-medium text-gray-900">Upload Contract Documents</h3>
        </div>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${loading ? 'pointer-events-none opacity-60' : ''}`}
          onDragOver={loading ? undefined : handleDragOver}
          onDragLeave={loading ? undefined : handleDragLeave}
          onDrop={loading ? undefined : handleDrop}
        >
          <span role="img" aria-label="file" className="w-12 h-12 text-gray-400 mx-auto mb-4">📄</span>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Upload your contract documents
          </h4>
          <p className="text-gray-500 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Supports PDF up to 10MB
          </p>
          <label className="inline-block">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.word"
              onChange={loading ? undefined : handleFileSelect}
              className="hidden"
              disabled={loading}
            />
            <span className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
              Choose Files
            </span>
          </label>
        </div>
        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
            {uploadedFiles.map((fileName, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <span role="img" aria-label="check" className="text-green-500">✔️</span>
                <span>{fileName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Search & Filter</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search contracts or vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Expired</option>
            <option>Pending</option>
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>All Actions</option>
            <option>Renew</option>
            <option>Cancel</option>
            <option>Review</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredContracts.length} of {contracts.length} contracts
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.map((contract, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{contract.company}</h4>
                        <span className={getStatusBadge(contract.status, contract.priority)}>
                          {contract.status}
                        </span>
                        <span className={getStatusBadge(contract.status, contract.priority)}>
                          {contract.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{contract.service}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>📁</span>
                          <span>Category: {contract.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>Ends: {contract.ends}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>💰</span>
                          <span>Value: {contract.value}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>⚡</span>
                          <span>Action: </span>
                          <span className={getActionBadge(contract.action)}>
                            {contract.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => handleViewPdf(contract)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => handleEditClick(contract)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete contract"
                        onClick={() => handleDelete(contract)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contracts;