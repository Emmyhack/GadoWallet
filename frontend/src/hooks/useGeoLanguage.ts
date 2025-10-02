import { useState, useEffect } from 'react';
import { geoLanguageService, type LanguageSuggestion } from '../lib/geo-language';

interface UseGeoLanguageReturn {
  suggestion: LanguageSuggestion | null;
  isLoading: boolean;
  showModal: boolean;
  hideModal: () => void;
  checkForSuggestion: () => Promise<void>;
}

export const useGeoLanguage = (): UseGeoLanguageReturn => {
  const [suggestion, setSuggestion] = useState<LanguageSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const checkForSuggestion = async () => {
    setIsLoading(true);
    try {
      const languageSuggestion = await geoLanguageService.getLanguageSuggestion();
      if (languageSuggestion && languageSuggestion.shouldSuggest) {
        setSuggestion(languageSuggestion);
        setShowModal(true);
      }
    } catch (error) {
      console.log('Failed to get language suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hideModal = () => {
    setShowModal(false);
    setSuggestion(null);
  };

  // Automatically check for language suggestion on component mount
  useEffect(() => {
    // Add a small delay to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      checkForSuggestion();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return {
    suggestion,
    isLoading,
    showModal,
    hideModal,
    checkForSuggestion
  };
};