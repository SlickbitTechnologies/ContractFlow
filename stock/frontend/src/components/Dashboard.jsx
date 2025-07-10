import React, { useState } from 'react';
import SearchPanel from './SearchPanel';
import SidePanel from './SidePanel';
import FundamentalSection from './fundamental/FundamentalSection';
import SentimentAnalysis from './sentiment/SentimentAnalysis';
import NewsView from './news/NewsView';
import TechnicalAnalysis from './technical/TechnicalAnalysis';
import Comparison from './comparison/Comparison';
import Screener from './screener/Screener';
import Settings from './settings/Settings';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('fundamental');
  const [stockSymbol, setStockSymbol] = useState('');
  const [resolvedSymbol, setResolvedSymbol] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(true);

  const handleSearch = (symbol) => {
    setStockSymbol(symbol);
    setResolvedSymbol(''); // Reset resolved symbol when new search starts
    setShowAnalysis(true);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const renderMainContent = () => {
    if (!showAnalysis) return null;

    switch (activeSection) {
      case 'fundamental':
        return <FundamentalSection stockSymbol={stockSymbol} onSymbolResolved={setResolvedSymbol} />;
      case 'sentiment':
        return <SentimentAnalysis symbol={stockSymbol} />;
      case 'news':
        return <NewsView symbol={stockSymbol} />;
      case 'technical':
        return <TechnicalAnalysis symbol={stockSymbol} />;
      case 'comparison':
        return <Comparison stockSymbol={stockSymbol} />;
      case 'screener':
        return <Screener />;
      case 'settings':
        return <Settings />;
      default:
        return <FundamentalSection stockSymbol={stockSymbol} onSymbolResolved={setResolvedSymbol} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SearchPanel onSearch={handleSearch} />
        
        {showAnalysis && (
          <div className="bg-blue-50 p-4 border-t border-blue-100">
            <h3 className="text-lg font-medium text-blue-800">
              Analyzing: {resolvedSymbol || stockSymbol || 'Select a stock'}
            </h3>
            {(resolvedSymbol || stockSymbol) && (
              <p className="text-blue-600 text-sm">
                Showing comprehensive analysis for {resolvedSymbol || stockSymbol}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Layout with Side Panel */}
      <div className="flex gap-6">
        {/* Side Panel */}
        <SidePanel activeSection={activeSection} onSectionChange={handleSectionChange} />

        {/* Main Content Area */}
        <div className="flex-1">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 