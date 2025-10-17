import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { geoLanguageService, type LanguageSuggestion } from '../lib/geo-language';

interface LanguageSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: LanguageSuggestion;
}

const LanguageSuggestionModal: React.FC<LanguageSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestion
}) => {
  const { t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const handleAccept = async () => {
    setIsChanging(true);
    try {
      await geoLanguageService.applyLanguage(suggestion.suggestedLanguage);
      onClose();
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleDismiss = () => {
    geoLanguageService.dismissSuggestion(suggestion.countryCode);
    onClose();
  };

  if (!isOpen) return null;

  const countryFlag = geoLanguageService.getCountryFlag(suggestion.countryCode);
  const suggestedLanguageName = geoLanguageService.getLanguageName(suggestion.suggestedLanguage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{countryFlag}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('languageSuggestion.title', 'Language Suggestion')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('languageSuggestion.detectedLocation', 'Detected from {{country}}', { 
                    country: suggestion.countryName 
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('languageSuggestion.message', 'We noticed you\'re visiting from {{country}}. Would you like to switch to {{language}} for a better experience?', {
              country: suggestion.countryName,
              language: suggestedLanguageName
            })}
          </p>

          {/* Language Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t('languageSuggestion.currentLanguage', 'Current')}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {geoLanguageService.getLanguageName(suggestion.currentLanguage)}
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t('languageSuggestion.suggestedLanguage', 'Suggested')}
                </div>
                <div className="font-medium text-blue-600 dark:text-blue-400">
                  {suggestedLanguageName}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleAccept}
              disabled={isChanging}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isChanging ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                  </svg>
                  <span>{t('languageSuggestion.changing', 'Changing...')}</span>
                </>
              ) : (
                <>
                  <span>{countryFlag}</span>
                  <span>
                    {t('languageSuggestion.switchTo', 'Switch to {{language}}', { 
                      language: suggestedLanguageName 
                    })}
                  </span>
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              disabled={isChanging}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {t('languageSuggestion.dismiss', 'Not now')}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            {t('languageSuggestion.footerNote', 'You can always change the language later in settings. This suggestion won\'t appear again for {{country}}.', {
              country: suggestion.countryName
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSuggestionModal;