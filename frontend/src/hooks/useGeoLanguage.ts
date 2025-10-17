import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { geoLanguageService, type LanguageSuggestion } from '../lib/geo-language';

interface UseGeoLanguageReturn {
  suggestion: LanguageSuggestion | null;
  isLoading: boolean;
  showModal: boolean;
  hideModal: () => void;
  checkForSuggestion: () => Promise<void>;
}

export const useGeoLanguage = (): UseGeoLanguageReturn => {
  const { connected, publicKey } = useWallet();
  const [suggestion, setSuggestion] = useState<LanguageSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasCheckedOnConnect, setHasCheckedOnConnect] = useState(false);

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

  // Check for language suggestion when wallet connects (indicates active use)
  useEffect(() => {
    if (connected && publicKey && !hasCheckedOnConnect) {
      setHasCheckedOnConnect(true);
      // Add a small delay to avoid blocking wallet connection flow
      const timeoutId = setTimeout(() => {
        checkForSuggestion();
      }, 2000); // Increased delay to let wallet connection settle

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [connected, publicKey, hasCheckedOnConnect]);

  return {
    suggestion,
    isLoading,
    showModal,
    hideModal,
    checkForSuggestion
  };
};