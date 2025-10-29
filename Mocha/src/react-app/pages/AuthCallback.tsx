import { useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Shield } from 'lucide-react';
import { useLanguage } from '@/react-app/context/LanguageContext';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate('/');
      } catch (error) {
        console.error('Authentication failed:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('auth.loggingIn')}</h2>
        <p className="text-gray-600">{t('auth.pleaseWait')}</p>
      </div>
    </div>
  );
}
