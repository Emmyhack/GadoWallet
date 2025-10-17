/**
 * Test script for geo-language detection functionality
 * This can be run in the browser console to test the geo-language service
 */

import { geoLanguageService } from '../lib/geo-language';

export async function testGeoLanguageService() {
  console.log('🌍 Testing Geo-Language Detection Service...\n');

  try {
    // Test 1: Get user location
    console.log('1. Testing location detection...');
    const location = await geoLanguageService.getUserLocation();
    console.log('Location detected:', location);
    
    if (location) {
      console.log(`   Country: ${location.country} (${location.countryCode})`);
      console.log(`   City: ${location.city}, ${location.region}`);
      console.log(`   Timezone: ${location.timezone}`);
    } else {
      console.log('   Location detection failed or blocked');
    }

    // Test 2: Get language suggestion
    console.log('\n2. Testing language suggestion...');
    const suggestion = await geoLanguageService.getLanguageSuggestion();
    console.log('Language suggestion:', suggestion);
    
    if (suggestion) {
      console.log(`   From: ${suggestion.countryName} (${suggestion.countryCode})`);
      console.log(`   Current language: ${suggestion.currentLanguage}`);
      console.log(`   Suggested language: ${suggestion.suggestedLanguage}`);
      console.log(`   Should suggest: ${suggestion.shouldSuggest}`);
    } else {
      console.log('   No language suggestion (already optimal or dismissed)');
    }

    // Test 3: Test language names and flags
    console.log('\n3. Testing language utilities...');
    const testLanguages = ['en', 'es', 'fr', 'zh', 'yo', 'ha'];
    testLanguages.forEach(lang => {
      const name = geoLanguageService.getLanguageName(lang);
      console.log(`   ${lang}: ${name}`);
    });

    console.log('\n4. Testing country flags...');
    const testCountries = ['US', 'ES', 'FR', 'CN', 'NG', 'NE'];
    testCountries.forEach(country => {
      const flag = geoLanguageService.getCountryFlag(country);
      console.log(`   ${country}: ${flag}`);
    });

    // Test 4: Test dismissal functionality
    console.log('\n5. Testing dismissal functionality...');
    console.log('   Current dismissals:', localStorage.getItem('gado_language_suggestion_dismissed'));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n✅ Geo-Language service test completed!');
}

// Also provide a function to reset all preferences for testing
export function resetGeoLanguageData() {
  console.log('🔄 Resetting geo-language data...');
  geoLanguageService.reset();
  console.log('✅ All geo-language data cleared!');
}

// Test the service if running in development
if (import.meta.env.DEV) {
  // Make functions available globally for console testing
  (window as any).testGeoLanguage = testGeoLanguageService;
  (window as any).resetGeoLanguage = resetGeoLanguageData;
  
  console.log('🧪 Geo-Language test functions loaded!');
  console.log('Run `testGeoLanguage()` in console to test the service');
  console.log('Run `resetGeoLanguage()` to clear stored data');
}