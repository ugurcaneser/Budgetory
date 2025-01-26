import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

type Currency = typeof currencies[0];

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  defaultCurrency: Currency | null;
  setDefaultCurrency: (currency: Currency | null) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SELECTED_CURRENCY: '@budgetory_selected_currency',
  DEFAULT_CURRENCY: '@budgetory_default_currency'
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | null>(null);

  // Load saved currencies on app start
  useEffect(() => {
    const loadSavedCurrencies = async () => {
      try {
        const [savedSelectedCurrency, savedDefaultCurrency] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CURRENCY),
          AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_CURRENCY)
        ]);

        if (savedDefaultCurrency) {
          const defaultCurr = currencies.find(c => c.code === JSON.parse(savedDefaultCurrency).code);
          if (defaultCurr) {
            setDefaultCurrency(defaultCurr);
            // If there's no selected currency, use the default
            if (!savedSelectedCurrency) {
              setSelectedCurrency(defaultCurr);
            }
          }
        }

        if (savedSelectedCurrency) {
          const selectedCurr = currencies.find(c => c.code === JSON.parse(savedSelectedCurrency).code);
          if (selectedCurr) {
            setSelectedCurrency(selectedCurr);
          }
        }
      } catch (error) {
        console.error('Error loading saved currencies:', error);
      }
    };

    loadSavedCurrencies();
  }, []);

  // Save selected currency when it changes
  const handleSetSelectedCurrency = async (currency: Currency) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CURRENCY, JSON.stringify(currency));
      setSelectedCurrency(currency);
    } catch (error) {
      console.error('Error saving selected currency:', error);
    }
  };

  // Save default currency when it changes
  const handleSetDefaultCurrency = async (currency: Currency | null) => {
    try {
      if (currency) {
        await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_CURRENCY, JSON.stringify(currency));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.DEFAULT_CURRENCY);
      }
      setDefaultCurrency(currency);
    } catch (error) {
      console.error('Error saving default currency:', error);
    }
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        selectedCurrency, 
        setSelectedCurrency: handleSetSelectedCurrency,
        defaultCurrency,
        setDefaultCurrency: handleSetDefaultCurrency
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
