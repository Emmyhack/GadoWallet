# Geo-Language Detection System

This system automatically detects a user's location and suggests the most appropriate language for the Gado Wallet interface based on their country.

## Features

### 🌍 Automatic Location Detection
- Uses IP-based geolocation to detect user's country
- Caches location data for 24 hours to minimize API calls
- Graceful fallback when geolocation services are unavailable

### 🗣️ Smart Language Suggestions
- Maps countries to their most commonly used languages
- Supports 6 languages: English, Spanish, French, Chinese, Yoruba, and Hausa
- Only suggests when user would benefit from a language change
- Respects user dismissals per country

### 💾 Privacy-Focused Caching
- All data stored locally (localStorage)
- No persistent tracking or user identification
- Cache expiration ensures fresh location detection
- User can dismiss suggestions permanently per country

### 🎨 Beautiful UI Components
- Non-intrusive modal with country flag and language preview
- Smooth language transitions with loading states
- Modern design matching the Gado Wallet theme
- Accessible with proper ARIA labels

## Architecture

### Core Components

1. **GeoLanguageService** (`src/lib/geo-language.ts`)
   - Main service class handling all geo-language functionality
   - Location detection with API fallbacks
   - Language suggestion logic with dismissal tracking
   - Country-to-language mapping for global coverage

2. **LanguageSuggestionModal** (`src/components/LanguageSuggestionModal.tsx`)
   - Modal component for displaying language suggestions
   - Beautiful UI with country flags and language previews
   - Handles user acceptance and dismissal

3. **useGeoLanguage** (`src/hooks/useGeoLanguage.ts`)
   - React hook for managing geo-language state
   - Automatic suggestion checking on app load
   - State management for modal visibility

4. **LanguageSelector** (`src/components/LanguageSelector.tsx`)
   - Enhanced dropdown for manual language selection
   - Replaces the basic select element in header
   - Shows flags and native language names

## Country-Language Mapping

### Spanish-Speaking Countries
Spain, Mexico, Argentina, Colombia, Peru, Venezuela, Chile, Ecuador, Guatemala, Cuba, Bolivia, Dominican Republic, Honduras, Paraguay, El Salvador, Nicaragua, Costa Rica, Panama, Uruguay, Equatorial Guinea

### French-Speaking Countries
France, Canada, Belgium, Switzerland, Luxembourg, Monaco, Senegal, Mali, Burkina Faso, Chad, Madagascar, Cameroon, Ivory Coast, Benin, Togo, Gabon, Republic of the Congo, Central African Republic, Djibouti, Comoros, Vanuatu, French Polynesia, New Caledonia

### Chinese-Speaking Regions
China, Taiwan, Hong Kong, Macau, Singapore

### Yoruba-Speaking Regions
Nigeria (primary region for Yoruba)

### Hausa-Speaking Regions
Niger (Hausa is widely spoken despite French being official)

### English (Default)
United States, United Kingdom, Australia, New Zealand, Ireland, South Africa, Kenya, Uganda, Tanzania, Ghana, India, Pakistan, Bangladesh, Sri Lanka, Malaysia, Philippines, Thailand, Vietnam, Indonesia, Japan, South Korea, and most other countries

## Usage

### Automatic Integration
The system is automatically integrated into the main App component and will:
1. Check user location on app load (with 1-second delay)
2. Show suggestion modal if appropriate
3. Handle user responses (accept/dismiss)
4. Remember dismissals per country

### Manual Testing
Development builds include test functions accessible in browser console:

```javascript
// Test the complete geo-language detection system
testGeoLanguage()

// Reset all stored geo-language data
resetGeoLanguage()
```

### API Integration
The system uses the `ipapi.co` service for location detection:
- **Primary API**: `https://ipapi.co/json/`
- **Fallback**: Graceful degradation when service unavailable
- **Cache Duration**: 24 hours to minimize API calls

## Configuration

### Supported Languages
```typescript
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' }
];
```

### Storage Keys
- `gado_language_suggestion_dismissed`: Array of dismissed country codes
- `gado_user_location`: Cached location data with timestamp
- `gado_preferred_language`: User's explicitly chosen language

## Translation Keys

The system adds new translation keys to all supported languages:

```typescript
languageSuggestion: {
  title: 'Language Suggestion',
  detectedLocation: 'Detected from {{country}}',
  message: 'We noticed you\'re visiting from {{country}}. Would you like to switch to {{language}} for a better experience?',
  currentLanguage: 'Current',
  suggestedLanguage: 'Suggested',
  switchTo: 'Switch to {{language}}',
  dismiss: 'Not now',
  changing: 'Changing...',
  footerNote: 'You can always change the language later in settings. This suggestion won\'t appear again for {{country}}.'
}
```

## Privacy & Performance

### Privacy Considerations
- **No Personal Data**: Only country-level location detection
- **Local Storage**: All preferences stored locally, not transmitted
- **User Control**: Users can dismiss suggestions permanently
- **Transparent**: Clear messaging about what's detected and why

### Performance Optimizations
- **Lazy Loading**: Geo-detection runs after initial app render
- **Caching**: 24-hour cache prevents repeated API calls
- **Minimal Bundle**: Only essential geolocation functionality
- **Graceful Degradation**: App works fully without geolocation

## Error Handling

The system gracefully handles various error scenarios:
- **Network Failures**: Silent fallback, no user disruption
- **API Limitations**: Fallback to manual language selection
- **Permission Denials**: Respects user privacy preferences
- **Cache Corruption**: Automatic cache reset and retry

## Future Enhancements

### Potential Improvements
1. **Browser Language Detection**: Combine with geolocation for better accuracy
2. **Regional Variants**: Support for regional language variants (e.g., Mexican Spanish vs. Argentinian Spanish)
3. **Time Zone Integration**: Use timezone data for additional location context
4. **A/B Testing**: Experiment with different suggestion timing and presentation
5. **Analytics**: Optional analytics for suggestion effectiveness (with consent)

### Multi-Language Regions
For countries with multiple official languages, consider:
- **Canada**: French/English based on province detection
- **Nigeria**: Yoruba/Hausa/English based on more specific location
- **Switzerland**: French/German/Italian based on region
- **Belgium**: French/Dutch based on region

## Development

### Adding New Languages
1. Add language to `languages` array in `LanguageSelector.tsx`
2. Add country mappings in `COUNTRY_LANGUAGE_MAP`
3. Add translations in `i18n.ts`
4. Update documentation

### Testing
- Use browser dev tools to test different locations
- Use `resetGeoLanguage()` to clear cache between tests
- Test with VPN to simulate different countries
- Verify modal appearance and dismissal behavior

---

This geo-language detection system enhances the user experience by automatically suggesting the most appropriate language based on the user's location, while respecting privacy and providing full user control over language preferences.