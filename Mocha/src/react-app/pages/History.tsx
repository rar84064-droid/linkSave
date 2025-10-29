import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Link as RouterLink } from 'react-router';
import { ArrowLeft, Shield, History, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import LanguageToggle from '@/react-app/components/LanguageToggle';
import { useLanguage } from '@/react-app/context/LanguageContext';
import type { ScanResult } from '@/shared/types';

export default function HistoryPage() {
  const { user, isPending } = useAuth();
  const { t, isRTL } = useLanguage();
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchScanHistory();
    }
  }, [user]);

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('/api/scan-history');
      if (response.ok) {
        const data = await response.json();
        setScanHistory(data);
      }
    } catch (error) {
      console.error('Error fetching scan history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'suspicious':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'malicious':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe':
        return t('result.safe');
      case 'suspicious':
        return t('result.suspicious');
      case 'malicious':
        return t('result.malicious');
      default:
        return t('result.error');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'malicious':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredHistory = scanHistory.filter(scan =>
    scan.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('auth.loginRequired')}</h2>
          <RouterLink
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('auth.backToHome')}
          </RouterLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
            <RouterLink
              to="/"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className={`w-5 h-5 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
            </RouterLink>
            <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
            </div>
          </div>
          <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
            <LanguageToggle />
            <History className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('nav.scanHistory')}</h2>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('history.search')}
              className={`w-full ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors`}
            />
          </div>
        </div>

        {/* History List */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? t('history.noResults') : t('history.noHistory')}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? t('history.tryDifferent') : t('history.startFirst')}
              </p>
              {!searchTerm && (
                <RouterLink
                  to="/"
                  className={`inline-flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105`}
                >
                  <Shield className="w-5 h-5" />
                  <span>{t('history.scanNew')}</span>
                </RouterLink>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredHistory.map((scan) => (
                <div key={scan.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className={`flex items-start space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(scan.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''} mb-2`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(scan.status)}`}>
                          {getStatusText(scan.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(scan.scannedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 break-all mb-3">{scan.url}</p>
                      
                      {scan.scanDetails && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">{t('history.scanDetails')}</h4>
                          
                          {scan.scanDetails.threatLevel !== undefined && (
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>{t('result.threatLevel')}</span>
                                <span>{scan.scanDetails.threatLevel}/100</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    scan.scanDetails.threatLevel >= 70 ? 'bg-red-500' :
                                    scan.scanDetails.threatLevel >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${scan.scanDetails.threatLevel}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {scan.scanDetails.checks && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                                <span className={scan.scanDetails.checks.httpsEnabled ? 'text-green-600' : 'text-red-600'}>
                                  {scan.scanDetails.checks.httpsEnabled ? '✅' : '❌'}
                                </span>
                                <span className="text-gray-600">HTTPS</span>
                              </div>
                              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                                <span className={!scan.scanDetails.checks.suspiciousCharacters ? 'text-green-600' : 'text-yellow-600'}>
                                  {!scan.scanDetails.checks.suspiciousCharacters ? '✅' : '⚠️'}
                                </span>
                                <span className="text-gray-600">{t('history.safeChars')}</span>
                              </div>
                              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                                <span className={!scan.scanDetails.checks.shortenerService ? 'text-green-600' : 'text-yellow-600'}>
                                  {!scan.scanDetails.checks.shortenerService ? '✅' : '⚠️'}
                                </span>
                                <span className="text-gray-600">{t('history.direct')}</span>
                              </div>
                              <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                                <span className={scan.scanDetails.checks.threatIntelligence === 'clean' ? 'text-green-600' : 'text-red-600'}>
                                  {scan.scanDetails.checks.threatIntelligence === 'clean' ? '✅' : '❌'}
                                </span>
                                <span className="text-gray-600">{t('result.threatDatabase')}</span>
                              </div>
                            </div>
                          )}

                          {scan.scanDetails.detectedPatterns && scan.scanDetails.detectedPatterns.length > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-xs font-medium text-yellow-800 mb-1">{t('history.warnings')}</p>
                              <p className="text-xs text-yellow-700">
                                {scan.scanDetails.detectedPatterns.slice(0, 2).join(', ')}
                                {scan.scanDetails.detectedPatterns.length > 2 && `... +${scan.scanDetails.detectedPatterns.length - 2}`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {filteredHistory.length > 0 && !searchTerm && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('stats.totalScans'), value: scanHistory.length, color: 'bg-blue-500' },
              { label: t('stats.safeLinks'), value: scanHistory.filter(s => s.status === 'safe').length, color: 'bg-green-500' },
              { label: t('stats.suspiciousLinks'), value: scanHistory.filter(s => s.status === 'suspicious').length, color: 'bg-yellow-500' },
              { label: t('stats.dangerousLinks'), value: scanHistory.filter(s => s.status === 'malicious').length, color: 'bg-red-500' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className={`w-3 h-3 ${stat.color} rounded-full mb-2`}></div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
