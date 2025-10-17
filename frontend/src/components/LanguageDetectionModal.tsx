import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, X, Check } from 'lucide-react';

interface LanguageDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedCountry: string;
  suggestedLanguage: string;
  suggestedLanguageCode: string;
}

const LanguageDetectionModal: React.FC<LanguageDetectionModalProps> = ({
  isOpen,
  onClose,
  detectedCountry,
  suggestedLanguage,
  suggestedLanguageCode
}) => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const handleAcceptLanguage = async () => {
    setIsChanging(true);
    try {
      await i18n.changeLanguage(suggestedLanguageCode);
      localStorage.setItem('preferredLanguage', suggestedLanguageCode);
      onClose();
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleDecline = () => {
    // Remember user declined this suggestion
    localStorage.setItem('declinedLanguageSuggestion', suggestedLanguageCode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Language Detection</h3>
              <p className="text-sm text-gray-300">We detected your location</p>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="text-center">
            <p className="text-white mb-2">
              We detected you're connecting from <span className="font-semibold text-blue-300">{detectedCountry}</span>
            </p>
            <p className="text-gray-300 text-sm mb-4">
              Would you like to switch to <span className="font-semibold text-blue-300">{suggestedLanguage}</span> for a better experience?
            </p>
          </div>

          {/* Language Preview */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{suggestedLanguage}</div>
                <div className="text-gray-400 text-sm">{suggestedLanguageCode.toUpperCase()}</div>
              </div>
              <div className="w-8 h-5 rounded border border-white/20 bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{suggestedLanguageCode.slice(0, 2).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleDecline}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
          >
            Keep Current
          </button>
          <button
            onClick={handleAcceptLanguage}
            disabled={isChanging}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isChanging ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Changing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Switch Language</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            You can always change language later in settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageDetectionModal;