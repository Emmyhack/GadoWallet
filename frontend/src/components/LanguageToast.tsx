import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, X } from 'lucide-react';
import { geoLanguageService, type LanguageSuggestion } from '../lib/geo-language';

interface LanguageToastProps {
  suggestion: LanguageSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
  onClose: () => void;
}

const LanguageToast: React.FC<LanguageToastProps> = ({
  suggestion,
  onAccept,
  onDismiss,
  onClose
}) => {
  const { t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show with animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = async () => {
    setIsChanging(true);
    try {
      await geoLanguageService.applyLanguage(suggestion.suggestedLanguage);
      onAccept();
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleDismiss = () => {
    geoLanguageService.dismissSuggestion(suggestion.countryCode);
    onDismiss();
  };

  const countryFlag = geoLanguageService.getCountryFlag(suggestion.countryCode);
  const languageName = geoLanguageService.getLanguageName(suggestion.suggestedLanguage);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('languageSuggestion.title', 'Language Suggestion')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {countryFlag} {suggestion.countryName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Switch to <span className="font-medium text-blue-600 dark:text-blue-400">{languageName}</span> for a better experience?
          </p>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleAccept}
              disabled={isChanging}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isChanging ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Switching...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  <span>Switch</span>
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Not now
            </button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
            Won't ask again for {suggestion.countryName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageToast;