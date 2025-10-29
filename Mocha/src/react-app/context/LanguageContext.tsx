import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    'app.title': 'LinkSafe',
    'app.description': 'Scan suspicious links and protect against fraud',
    'auth.login': 'Login with Google',
    'auth.loginMessage': 'Sign in to start scanning suspicious links',
    'auth.loggingIn': 'Signing in...',
    'auth.pleaseWait': 'Please wait',
    'auth.loginRequired': 'Please sign in',
    'auth.backToHome': 'Back to home',
    'nav.history': 'History',
    'nav.logout': 'Logout',
    'nav.scanHistory': 'Scan History',
    'home.title': 'Scan Suspicious Links',
    'home.subtitle': 'Check the safety of any link before clicking to protect against fraud and hacking',
    'home.scanNewLink': 'Scan New Link',
    'home.pasteLink': 'Paste link here... (example: https://example.com)',
    'home.scanLink': 'Scan Link',
    'home.scanning': 'Scanning...',
    'home.recentScans': 'Recent Scans',
    'home.viewAll': 'View All',
    'scan.progress.title': 'Scanning Link',
    'scan.progress.step1': 'Checking URL format',
    'scan.progress.step2': 'Checking threat database',
    'scan.progress.step3': 'Analyzing domain',
    'scan.progress.step4': 'Completing scan',
    'scan.progress.current': 'Step {current} of {total}',
    'result.title': 'Scan Result',
    'result.safe': 'Safe',
    'result.suspicious': 'Suspicious',
    'result.malicious': 'Dangerous',
    'result.error': 'Error',
    'result.details': 'Scan Details:',
    'result.domain': 'Domain',
    'result.threatLevel': 'Threat Level',
    'result.scanVersion': 'Scan Version',
    'result.securityChecks': 'Security Checks',
    'result.httpsEnabled': 'HTTPS Enabled',
    'result.noSuspiciousChars': 'No suspicious characters',
    'result.notShortener': 'Not a link shortener service',
    'result.threatDatabase': 'Threat database',
    'result.detectedWarnings': 'Detected warnings:',
    'result.copy': 'Copy link',
    'result.open': 'Open link',
    'history.title': 'Scan History',
    'history.search': 'Search scan history...',
    'history.noResults': 'No results found',
    'history.tryDifferent': 'Try searching with different terms',
    'history.noHistory': 'No previous scans',
    'history.startFirst': 'Start by scanning your first link',
    'history.scanNew': 'Scan New Link',
    'history.scanDetails': 'Scan Details:',
    'history.warnings': 'Warnings:',
    'history.safeChars': 'Safe characters',
    'history.direct': 'Direct',
    'stats.totalScans': 'Total Scans',
    'stats.safeLinks': 'Safe Links',
    'stats.suspiciousLinks': 'Suspicious Links',
    'stats.dangerousLinks': 'Dangerous Links',
    'loading.app': 'Loading app...',
    'loading.default': 'Loading...',
    'error.invalidUrl': 'Please enter a valid link',
    'error.invalidFormat': 'Link format is invalid',
    'error.scanFailed': 'Failed to scan link',
    'common.loading': 'Loading',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.settings': 'Settings',
    'common.help': 'Help',
    'common.about': 'About',
    'common.contact': 'Contact',
    'common.privacy': 'Privacy',
    'common.terms': 'Terms',
    'common.language': 'Language',
  },
  ar: {
    'app.title': 'LinkSafe',
    'app.description': 'فحص الروابط المشبوهة وحماية من الاحتيال',
    'auth.login': 'تسجيل الدخول بـ Google',
    'auth.loginMessage': 'سجل الدخول للبدء في فحص الروابط المشبوهة',
    'auth.loggingIn': 'جاري تسجيل الدخول...',
    'auth.pleaseWait': 'يرجى الانتظار',
    'auth.loginRequired': 'يرجى تسجيل الدخول',
    'auth.backToHome': 'العودة للصفحة الرئيسية',
    'nav.history': 'السجل',
    'nav.logout': 'تسجيل الخروج',
    'nav.scanHistory': 'سجل الفحوصات',
    'home.title': 'فحص الروابط المشبوهة',
    'home.subtitle': 'تحقق من سلامة أي رابط قبل الضغط عليه للحماية من الاحتيال والاختراق',
    'home.scanNewLink': 'فحص رابط جديد',
    'home.pasteLink': 'الصق الرابط هنا... (مثال: https://example.com)',
    'home.scanLink': 'فحص الرابط',
    'home.scanning': 'جاري الفحص...',
    'home.recentScans': 'الفحوصات الأخيرة',
    'home.viewAll': 'عرض الكل',
    'scan.progress.title': 'جاري فحص الرابط',
    'scan.progress.step1': 'فحص صيغة الرابط',
    'scan.progress.step2': 'التحقق من قاعدة التهديدات',
    'scan.progress.step3': 'تحليل النطاق',
    'scan.progress.step4': 'إنهاء الفحص',
    'scan.progress.current': 'الخطوة {current} من {total}',
    'result.title': 'نتيجة الفحص',
    'result.safe': 'آمن',
    'result.suspicious': 'مشبوه',
    'result.malicious': 'خطر',
    'result.error': 'خطأ',
    'result.details': 'تفاصيل الفحص:',
    'result.domain': 'النطاق',
    'result.threatLevel': 'مستوى التهديد',
    'result.scanVersion': 'إصدار الفحص',
    'result.securityChecks': 'الفحوصات الأمنية',
    'result.httpsEnabled': 'HTTPS مفعل',
    'result.noSuspiciousChars': 'لا يحتوي على أحرف مشبوهة',
    'result.notShortener': 'ليس خدمة اختصار روابط',
    'result.threatDatabase': 'قاعدة بيانات التهديدات',
    'result.detectedWarnings': 'تحذيرات تم اكتشافها:',
    'result.copy': 'نسخ الرابط',
    'result.open': 'فتح الرابط',
    'history.title': 'سجل الفحوصات',
    'history.search': 'البحث في سجل الفحوصات...',
    'history.noResults': 'لا توجد نتائج',
    'history.tryDifferent': 'جرب البحث بكلمات أخرى',
    'history.noHistory': 'لا توجد فحوصات سابقة',
    'history.startFirst': 'ابدأ بفحص أول رابط لك',
    'history.scanNew': 'فحص رابط جديد',
    'history.scanDetails': 'تفاصيل الفحص:',
    'history.warnings': 'تحذيرات:',
    'history.safeChars': 'أحرف آمنة',
    'history.direct': 'مباشر',
    'stats.totalScans': 'إجمالي الفحوصات',
    'stats.safeLinks': 'روابط آمنة',
    'stats.suspiciousLinks': 'روابط مشبوهة',
    'stats.dangerousLinks': 'روابط خطرة',
    'loading.app': 'جاري تحميل التطبيق...',
    'loading.default': 'جاري التحميل...',
    'error.invalidUrl': 'يرجى إدخال رابط صحيح',
    'error.invalidFormat': 'صيغة الرابط غير صحيحة',
    'error.scanFailed': 'فشل في فحص الرابط',
    'common.loading': 'تحميل',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.close': 'إغلاق',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.search': 'بحث',
    'common.filter': 'فلتر',
    'common.sort': 'ترتيب',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.settings': 'الإعدادات',
    'common.help': 'مساعدة',
    'common.about': 'حول',
    'common.contact': 'اتصل بنا',
    'common.privacy': 'الخصوصية',
    'common.terms': 'الشروط',
    'common.language': 'اللغة',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update HTML direction and lang attribute
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update body class for CSS direction handling
    document.body.className = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key as keyof typeof translations['en']];
    return translation || key;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    // Set initial direction and lang
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.className = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
