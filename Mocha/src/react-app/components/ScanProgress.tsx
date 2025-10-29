import { Shield, CheckCircle, Search, Database, Globe } from 'lucide-react';
import { useLanguage } from '@/react-app/context/LanguageContext';

interface ScanProgressProps {
  currentStep: number;
  totalSteps: number;
  stepMessage: string;
}

export default function ScanProgress({ currentStep, totalSteps, stepMessage }: ScanProgressProps) {
  const { t, isRTL } = useLanguage();
  
  const steps = [
    { icon: Search, label: t('scan.progress.step1') },
    { icon: Database, label: t('scan.progress.step2') },
    { icon: Globe, label: t('scan.progress.step3') },
    { icon: CheckCircle, label: t('scan.progress.step4') }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''} mb-4`}>
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{t('scan.progress.title')}</h3>
          <p className="text-sm text-gray-600">{stepMessage}</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.slice(0, totalSteps).map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isCompleted 
                  ? 'bg-green-100 text-green-600' 
                  : isCurrent 
                    ? 'bg-blue-100 text-blue-600 animate-pulse' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                <StepIcon className="w-4 h-4" />
              </div>
              <span className={`text-sm ${
                isCompleted 
                  ? 'text-green-600 font-medium' 
                  : isCurrent 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {isCompleted && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          {t('scan.progress.current').replace('{current}', (currentStep + 1).toString()).replace('{total}', totalSteps.toString())}
        </p>
      </div>
    </div>
  );
}
