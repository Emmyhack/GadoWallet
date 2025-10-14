// Language detection based on geolocation
export interface LocationInfo {
  country: string;
  countryCode: string;
  suggestedLanguage: string;
  suggestedLanguageCode: string;
}

// Country to language mapping
const countryLanguageMap: Record<string, { language: string; code: string }> = {
  // European Languages
  'ES': { language: 'Spanish', code: 'es' },
  'FR': { language: 'French', code: 'fr' },
  'DE': { language: 'German', code: 'de' },
  'IT': { language: 'Italian', code: 'it' },
  'PT': { language: 'Portuguese', code: 'pt' },
  'NL': { language: 'Dutch', code: 'nl' },
  'RU': { language: 'Russian', code: 'ru' },
  'PL': { language: 'Polish', code: 'pl' },
  
  // Asian Languages
  'CN': { language: 'Chinese', code: 'zh' },
  'JP': { language: 'Japanese', code: 'ja' },
  'KR': { language: 'Korean', code: 'ko' },
  'IN': { language: 'Hindi', code: 'hi' },
  'TH': { language: 'Thai', code: 'th' },
  'VN': { language: 'Vietnamese', code: 'vi' },
  'ID': { language: 'Indonesian', code: 'id' },
  'MY': { language: 'Malay', code: 'ms' },
  'PH': { language: 'Filipino', code: 'tl' },
  
  // Arabic Countries
  'SA': { language: 'Arabic', code: 'ar' },
  'AE': { language: 'Arabic', code: 'ar' },
  'EG': { language: 'Arabic', code: 'ar' },
  'MA': { language: 'Arabic', code: 'ar' },
  
  // African Languages
  'NG': { language: 'English', code: 'en' }, // Nigeria uses English
  'ZA': { language: 'English', code: 'en' }, // South Africa
  'KE': { language: 'English', code: 'en' }, // Kenya
  
  // Latin American Spanish
  'MX': { language: 'Spanish', code: 'es' },
  'AR': { language: 'Spanish', code: 'es' },
  'CO': { language: 'Spanish', code: 'es' },
  'PE': { language: 'Spanish', code: 'es' },
  'CL': { language: 'Spanish', code: 'es' },
  'VE': { language: 'Spanish', code: 'es' },
  'EC': { language: 'Spanish', code: 'es' },
  
  // Portuguese
  'BR': { language: 'Portuguese', code: 'pt' },
  
  // Other
  'TR': { language: 'Turkish', code: 'tr' },
  'IL': { language: 'Hebrew', code: 'he' },
  'IR': { language: 'Persian', code: 'fa' },
  
  // Default to English for English-speaking countries
  'US': { language: 'English', code: 'en' },
  'GB': { language: 'English', code: 'en' },
  'CA': { language: 'English', code: 'en' },
  'AU': { language: 'English', code: 'en' },
  'NZ': { language: 'English', code: 'en' },
  'IE': { language: 'English', code: 'en' },
};

export const detectUserLocation = async (): Promise<LocationInfo | null> => {
  try {
    // First try to get location from IP geolocation API
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();
    
    if (data.error) {
      console.log('IP API error:', data.reason);
      return fallbackDetection();
    }

    const countryCode = data.country_code;
    const country = data.country_name;
    
    if (!countryCode) {
      return fallbackDetection();
    }

    const languageInfo = countryLanguageMap[countryCode];
    
    if (!languageInfo) {
      // Default to English if country not in our map
      return {
        country,
        countryCode,
        suggestedLanguage: 'English',
        suggestedLanguageCode: 'en'
      };
    }

    return {
      country,
      countryCode,
      suggestedLanguage: languageInfo.language,
      suggestedLanguageCode: languageInfo.code
    };

  } catch (error) {
    console.error('Error detecting location:', error);
    return fallbackDetection();
  }
};

// Fallback detection using browser language
const fallbackDetection = (): LocationInfo | null => {
  try {
    const browserLanguage = navigator.language || 'en';
    const langCode = browserLanguage.split('-')[0].toLowerCase();
    
    // Find language in our map
    for (const [countryCode, langInfo] of Object.entries(countryLanguageMap)) {
      if (langInfo.code === langCode) {
        return {
          country: 'Unknown',
          countryCode: 'XX',
          suggestedLanguage: langInfo.language,
          suggestedLanguageCode: langInfo.code
        };
      }
    }
    
    // Default to English
    return {
      country: 'Unknown',
      countryCode: 'XX',
      suggestedLanguage: 'English',
      suggestedLanguageCode: 'en'
    };
    
  } catch (error) {
    console.error('Fallback detection failed:', error);
    return null;
  }
};

// Check if user has already been prompted for this language
export const shouldShowLanguageSuggestion = (suggestedLanguageCode: string, currentLanguage: string): boolean => {
  // Don't suggest if already using the suggested language
  if (currentLanguage === suggestedLanguageCode) {
    return false;
  }
  
  // Don't suggest if user already declined this language
  const declinedLanguage = localStorage.getItem('declinedLanguageSuggestion');
  if (declinedLanguage === suggestedLanguageCode) {
    return false;
  }
  
  // Don't suggest if user has manually set a preferred language
  const preferredLanguage = localStorage.getItem('preferredLanguage');
  if (preferredLanguage && preferredLanguage !== 'en') {
    return false;
  }
  
  return true;
};