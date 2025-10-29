import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { Shield, Link, History, LogOut, AlertTriangle, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react';
import { Link as RouterLink } from 'react-router';
import LoadingSpinner from '@/react-app/components/LoadingSpinner';
import ScanProgress from '@/react-app/components/ScanProgress';
import LanguageToggle from '@/react-app/components/LanguageToggle';
import { useLanguage } from '@/react-app/context/LanguageContext';
import type { ScanResult } from '@/shared/types';

export default function Home() {
  const { user, isPending, redirectToLogin, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [scanProgress, setScanProgress] = useState({ step: 0, message: '' });
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    if (user) {
      fetchRecentScans();
    }
  }, [user]);

  const fetchRecentScans = async () => {
    try {
      const response = await fetch('/api/scan-history');
      if (response.ok) {
        const data = await response.json();
        setRecentScans(data.slice(0, 3)); // Show only recent 3
      }
    } catch (error) {
      console.error('Error fetching recent scans:', error);
    }
  };

  const validateUrl = (inputUrl: string) => {
    setUrlError('');
    
    if (!inputUrl.trim()) {
      setUrlError(t('error.invalidUrl'));
      return false;
    }

    try {
      new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);
      return true;
    } catch {
      setUrlError(t('error.invalidFormat'));
      return false;
    }
  };

  const scanUrl = async () => {
    if (!url.trim() || isScanning) return;

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    if (!validateUrl(normalizedUrl)) return;

    setIsScanning(true);
    setScanResult(null);
    setUrlError('');

    const steps = [
      t('scan.progress.step1'),
      t('scan.progress.step2'),
      t('scan.progress.step3'),
      t('scan.progress.step4')
    ];

    try {
      // Simulate progress steps
      for (let i = 0; i < steps.length; i++) {
        setScanProgress({ step: i, message: steps[i] });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const response = await fetch('/api/scan-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await response.json();
      setScanResult(data);
      fetchRecentScans(); // Refresh recent scans
    } catch (error) {
      console.error('Error scanning URL:', error);
      setScanResult({
        id: 0,
        url: normalizedUrl,
        status: 'error',
        scanDetails: { error: t('error.scanFailed') },
        scannedAt: new Date().toISOString(),
      });
    } finally {
      setIsScanning(false);
      setScanProgress({ step: 0, message: '' });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (urlError && value.trim()) {
      setUrlError('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'suspicious':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'malicious':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <XCircle className="w-6 h-6 text-gray-500" />;
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

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-50 border-green-200';
      case 'suspicious':
        return 'bg-yellow-50 border-yellow-200';
      case 'malicious':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner message={t('loading.app')} size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('app.title')}</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {t('app.description')}
            </p>
            <button
              onClick={redirectToLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {t('auth.login')}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              {t('auth.loginMessage')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
          </div>
          <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
            <LanguageToggle />
            <RouterLink
              to="/history"
              className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} text-gray-600 hover:text-blue-600 transition-colors`}
            >
              <History className="w-5 h-5" />
              <span>{t('nav.history')}</span>
            </RouterLink>
            <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
              <img
                src={user.google_user_data.picture || undefined}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-700">{user.google_user_data.name}</span>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title={t('nav.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('home.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        {/* URL Scanner */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''} mb-6`}>
            <Link className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">{t('home.scanNewLink')}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={t('home.pasteLink')}
                className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none transition-colors text-lg ${
                  urlError 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && scanUrl()}
                disabled={isScanning}
              />
              {urlError && (
                <p className={`text-red-500 text-sm mt-2 flex items-center space-x-1 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span>{urlError}</span>
                </p>
              )}
            </div>
            
            <button
              onClick={scanUrl}
              disabled={!url.trim() || isScanning || !!urlError}
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center justify-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('home.scanning')}</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>{t('home.scanLink')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan Progress */}
        {isScanning && (
          <ScanProgress 
            currentStep={scanProgress.step} 
            totalSteps={4} 
            stepMessage={scanProgress.message}
          />
        )}

        {/* Scan Result */}
        {scanResult && !isScanning && (
          <div className={`rounded-3xl shadow-xl p-8 mb-8 border-2 ${getStatusBgColor(scanResult.status)}`}>
            <div className={`flex items-start space-x-4 ${isRTL ? 'space-x-reverse' : ''} mb-6`}>
              {getStatusIcon(scanResult.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {t('result.title')}: {getStatusText(scanResult.status)}
                  </h3>
                  <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <button
                      onClick={() => copyToClipboard(scanResult.url)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                      title={t('result.copy')}
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <a
                      href={scanResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                      title={t('result.open')}
                    >
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </a>
                  </div>
                </div>
                <p className="text-gray-600 break-all text-sm">{scanResult.url}</p>
              </div>
            </div>
            
            {scanResult.scanDetails && (
              <div className="bg-white/50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{t('result.details')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    {scanResult.scanDetails.domain && (
                      <p><span className="font-medium">{t('result.domain')}:</span> {scanResult.scanDetails.domain}</p>
                    )}
                    {scanResult.scanDetails.threatLevel !== undefined && (
                      <p><span className="font-medium">{t('result.threatLevel')}:</span> {scanResult.scanDetails.threatLevel}/100</p>
                    )}
                    {scanResult.scanDetails.scanVersion && (
                      <p><span className="font-medium">{t('result.scanVersion')}:</span> {scanResult.scanDetails.scanVersion}</p>
                    )}
                  </div>
                  
                  {scanResult.scanDetails.checks && (
                    <div>
                      <p className="font-medium mb-2">{t('result.securityChecks')}:</p>
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                          <span className={scanResult.scanDetails.checks.httpsEnabled ? 'text-green-600' : 'text-red-600'}>
                            {scanResult.scanDetails.checks.httpsEnabled ? '✅' : '❌'}
                          </span>
                          <span>{t('result.httpsEnabled')}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                          <span className={!scanResult.scanDetails.checks.suspiciousCharacters ? 'text-green-600' : 'text-yellow-600'}>
                            {!scanResult.scanDetails.checks.suspiciousCharacters ? '✅' : '⚠️'}
                          </span>
                          <span>{t('result.noSuspiciousChars')}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                          <span className={!scanResult.scanDetails.checks.shortenerService ? 'text-green-600' : 'text-yellow-600'}>
                            {!scanResult.scanDetails.checks.shortenerService ? '✅' : '⚠️'}
                          </span>
                          <span>{t('result.notShortener')}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                          <span className={scanResult.scanDetails.checks.threatIntelligence === 'clean' ? 'text-green-600' : 'text-red-600'}>
                            {scanResult.scanDetails.checks.threatIntelligence === 'clean' ? '✅' : '❌'}
                          </span>
                          <span>{t('result.threatDatabase')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {scanResult.scanDetails.detectedPatterns && scanResult.scanDetails.detectedPatterns.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-medium text-yellow-800 mb-1">{t('result.detectedWarnings')}</p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {scanResult.scanDetails.detectedPatterns.map((pattern: string, index: number) => (
                        <li key={index}>• {pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <History className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">{t('home.recentScans')}</h3>
              </div>
              <RouterLink
                to="/history"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('home.viewAll')}
              </RouterLink>
            </div>
            
            <div className="space-y-4">
              {recentScans.map((scan) => (
                <div key={scan.id} className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''} p-4 bg-gray-50 rounded-2xl`}>
                  {getStatusIcon(scan.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{scan.url}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(scan.scannedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    scan.status === 'safe' ? 'bg-green-100 text-green-800' :
                    scan.status === 'suspicious' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getStatusText(scan.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
