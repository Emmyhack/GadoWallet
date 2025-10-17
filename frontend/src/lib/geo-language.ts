import i18n from './i18n';

// Country code to language mapping
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  // Spanish-speaking countries
  'ES': 'es', // Spain
  'MX': 'es', // Mexico
  'AR': 'es', // Argentina
  'CO': 'es', // Colombia
  'PE': 'es', // Peru
  'VE': 'es', // Venezuela
  'CL': 'es', // Chile
  'EC': 'es', // Ecuador
  'GT': 'es', // Guatemala
  'CU': 'es', // Cuba
  'BO': 'es', // Bolivia
  'DO': 'es', // Dominican Republic
  'HN': 'es', // Honduras
  'PY': 'es', // Paraguay
  'SV': 'es', // El Salvador
  'NI': 'es', // Nicaragua
  'CR': 'es', // Costa Rica
  'PA': 'es', // Panama
  'UY': 'es', // Uruguay
  'GQ': 'es', // Equatorial Guinea

  // French-speaking countries
  'FR': 'fr', // France
  'CA': 'fr', // Canada (could be English too, but we'll default to French)
  'BE': 'fr', // Belgium
  'CH': 'fr', // Switzerland
  'LU': 'fr', // Luxembourg
  'MC': 'fr', // Monaco
  'SN': 'fr', // Senegal
  'ML': 'fr', // Mali
  'BF': 'fr', // Burkina Faso
  // 'NE': 'fr', // Niger (using Hausa instead as it's more widely spoken)
  'TD': 'fr', // Chad
  'MG': 'fr', // Madagascar
  'CM': 'fr', // Cameroon
  'CI': 'fr', // Ivory Coast
  'BJ': 'fr', // Benin
  'TG': 'fr', // Togo
  'GA': 'fr', // Gabon
  'CG': 'fr', // Republic of the Congo
  'CF': 'fr', // Central African Republic
  'DJ': 'fr', // Djibouti
  'KM': 'fr', // Comoros
  'VU': 'fr', // Vanuatu
  'PF': 'fr', // French Polynesia
  'NC': 'fr', // New Caledonia

  // Chinese-speaking countries/regions
  'CN': 'zh', // China
  'TW': 'zh', // Taiwan
  'HK': 'zh', // Hong Kong
  'MO': 'zh', // Macau
  'SG': 'zh', // Singapore (multilingual, but has significant Chinese population)

  // Yoruba-speaking regions (primarily Nigeria)
  'NG': 'yo', // Nigeria

  // Hausa-speaking regions
  // We'll use Nigeria for Hausa as well, but in practice you might want more specific detection
  // 'NG': 'ha', // Nigeria (conflicts with Yoruba, you might want to use browser language as tie-breaker)
  'NE': 'ha', // Niger (also speaks Hausa)

  // Default to English for most other countries
  'US': 'en', // United States
  'GB': 'en', // United Kingdom
  'AU': 'en', // Australia
  'NZ': 'en', // New Zealand
  'IE': 'en', // Ireland
  'ZA': 'en', // South Africa
  'KE': 'en', // Kenya
  'UG': 'en', // Uganda
  'TZ': 'en', // Tanzania
  'GH': 'en', // Ghana
  'IN': 'en', // India
  'PK': 'en', // Pakistan
  'BD': 'en', // Bangladesh
  'LK': 'en', // Sri Lanka
  'MY': 'en', // Malaysia
  'PH': 'en', // Philippines
  'TH': 'en', // Thailand
  'VN': 'en', // Vietnam
  'ID': 'en', // Indonesia
  'JP': 'en', // Japan
  'KR': 'en', // South Korea
};

// Interface for geolocation response
interface GeolocationResponse {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

// Interface for language suggestion
interface LanguageSuggestion {
  countryCode: string;
  countryName: string;
  suggestedLanguage: string;
  currentLanguage: string;
  shouldSuggest: boolean;
}

class GeoLanguageService {
  private readonly GEOLOCATION_API_URL = 'https://ipapi.co/json/';
  private readonly FALLBACK_API_URL = 'https://api.ipify.org?format=json';
  private readonly STORAGE_KEY = 'gado_language_suggestion_dismissed';
  private readonly CACHE_KEY = 'gado_user_location';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get user's geolocation from IP
   */
  async getUserLocation(): Promise<GeolocationResponse | null> {
    try {
      // Check cache first
      const cached = this.getCachedLocation();
      if (cached) {
        return cached;
      }

      // Try primary API
      const response = await fetch(this.GEOLOCATION_API_URL);
      if (!response.ok) {
        throw new Error('Primary geolocation API failed');
      }

      const data = await response.json();
      
      const location: GeolocationResponse = {
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
        timezone: data.timezone
      };

      // Cache the result
      this.cacheLocation(location);
      
      return location;
    } catch (error) {
      console.log('Geolocation detection failed:', error);
      return null;
    }
  }

  /**
   * Cache location data in localStorage
   */
  private cacheLocation(location: GeolocationResponse): void {
    try {
      const cacheData = {
        location,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.log('Failed to cache location:', error);
    }
  }

  /**
   * Get cached location if still valid
   */
  private getCachedLocation(): GeolocationResponse | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid (24 hours)
      if (now - cacheData.timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      return cacheData.location;
    } catch (error) {
      console.log('Failed to read cached location:', error);
      return null;
    }
  }

  /**
   * Get language suggestion based on user's location
   */
  async getLanguageSuggestion(): Promise<LanguageSuggestion | null> {
    const location = await this.getUserLocation();
    if (!location || !location.countryCode) {
      return null;
    }

    const countryCode = location.countryCode.toUpperCase();
    const suggestedLanguage = COUNTRY_LANGUAGE_MAP[countryCode];
    const currentLanguage = i18n.language;

    // Don't suggest if we don't have a mapping for this country
    if (!suggestedLanguage) {
      return null;
    }

    // Don't suggest if user is already using the suggested language
    if (currentLanguage === suggestedLanguage) {
      return null;
    }

    // Check if user has already dismissed suggestions for this country
    if (this.isSuggestionDismissed(countryCode)) {
      return null;
    }

    return {
      countryCode,
      countryName: location.country || countryCode,
      suggestedLanguage,
      currentLanguage,
      shouldSuggest: true
    };
  }

  /**
   * Check if user has dismissed language suggestion for a country
   */
  private isSuggestionDismissed(countryCode: string): boolean {
    try {
      const dismissed = localStorage.getItem(this.STORAGE_KEY);
      if (!dismissed) return false;
      
      const dismissedList = JSON.parse(dismissed);
      return dismissedList.includes(countryCode);
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark language suggestion as dismissed for a country
   */
  dismissSuggestion(countryCode: string): void {
    try {
      let dismissedList: string[] = [];
      const existing = localStorage.getItem(this.STORAGE_KEY);
      
      if (existing) {
        dismissedList = JSON.parse(existing);
      }
      
      if (!dismissedList.includes(countryCode)) {
        dismissedList.push(countryCode);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dismissedList));
      }
    } catch (error) {
      console.log('Failed to save dismissed suggestion:', error);
    }
  }

  /**
   * Apply the suggested language
   */
  async applyLanguage(languageCode: string): Promise<void> {
    try {
      await i18n.changeLanguage(languageCode);
      // Optionally save preference
      localStorage.setItem('gado_preferred_language', languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }

  /**
   * Get friendly language name
   */
  getLanguageName(languageCode: string): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'zh': '中文',
      'yo': 'Yorùbá',
      'ha': 'Hausa'
    };
    
    return languageNames[languageCode] || languageCode;
  }

  /**
   * Get country flag emoji
   */
  getCountryFlag(countryCode: string): string {
    // Convert country code to flag emoji
    if (countryCode.length !== 2) return '🌍';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 0x1F1E6 - 65 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  }

  /**
   * Reset all stored preferences (for development/testing)
   */
  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem('gado_preferred_language');
  }
}

export const geoLanguageService = new GeoLanguageService();
export type { LanguageSuggestion, GeolocationResponse };