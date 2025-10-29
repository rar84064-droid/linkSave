import { Languages } from 'lucide-react';
import { useLanguage } from '@/react-app/context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, t, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''} px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors`}
      title={t('common.language')}
    >
      <Languages className="w-5 h-5" />
      <span className="text-sm font-medium">
        {language === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
}
