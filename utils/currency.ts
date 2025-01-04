interface ExchangeRates {
  [key: string]: number;
}

// Using the European Central Bank's free API
const BASE_URL = 'https://api.frankfurter.app';

export async function fetchExchangeRates(baseCurrency: string): Promise<ExchangeRates> {
  try {
    // Get all rates with EUR as base (Frankfurter's default base)
    const response = await fetch(`${BASE_URL}/latest`);
    const data = await response.json();
    const eurRates = { EUR: 1, ...data.rates };

    // If base currency is EUR, return rates directly
    if (baseCurrency === 'EUR') return eurRates;

    // Convert all rates to the desired base currency
    const baseRate = eurRates[baseCurrency];
    const convertedRates: ExchangeRates = {};
    
    Object.entries(eurRates).forEach(([currency, rate]) => {
      convertedRates[currency] = Number(rate) / baseRate;
    });

    return convertedRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return default rates in case of error
    return {
      USD: 1.0,
      EUR: 0.91,
      GBP: 0.79,
      TRY: 29.5
    };
  }
}

export function convertAmount(amount: number, fromCurrency: string, toCurrency: string, rates: ExchangeRates): number {
  if (fromCurrency === toCurrency) return amount;
  
  const baseAmount = amount / rates[fromCurrency]; // Convert to base currency first
  return baseAmount * rates[toCurrency]; // Then convert to target currency
}
