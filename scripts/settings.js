// scripts/settings.js
const SETTINGS_KEY = 'finance:settings';

// Default settings
const defaultSettings = {
  baseCurrency: 'RWF',
  rates: {
    USD: 0.00077,  // RWF to USD
    EUR: 0.00071   // RWF to EUR
  }
};

export function loadSettings() {
  const data = localStorage.getItem(SETTINGS_KEY);
  try {
    return data ? JSON.parse(data) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to base currency (RWF) first
  let inRWF = amount;
  if (fromCurrency !== 'RWF') {
    inRWF = amount / rates[fromCurrency];
  }
  
  // Then convert to target currency
  if (toCurrency === 'RWF') {
    return inRWF;
  }
  return inRWF * rates[toCurrency];
}

