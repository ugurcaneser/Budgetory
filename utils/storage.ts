import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string; // Store as ISO string
}

const STORAGE_KEYS = {
  TRANSACTIONS: '@budgetory_transactions',
  TOTAL_INCOME: '@budgetory_total_income',
  TOTAL_EXPENSE: '@budgetory_total_expense',
};

export const saveTransactions = async (transactions: Transaction[]) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions)
    );
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const saveTotals = async (totalIncome: number, totalExpense: number) => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOTAL_INCOME, totalIncome.toString()],
      [STORAGE_KEYS.TOTAL_EXPENSE, totalExpense.toString()],
    ]);
  } catch (error) {
    console.error('Error saving totals:', error);
  }
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const loadTotals = async (): Promise<{
  totalIncome: number;
  totalExpense: number;
}> => {
  try {
    const [incomeStr, expenseStr] = await AsyncStorage.multiGet([
      STORAGE_KEYS.TOTAL_INCOME,
      STORAGE_KEYS.TOTAL_EXPENSE,
    ]);

    return {
      totalIncome: parseFloat(incomeStr[1] || '0'),
      totalExpense: parseFloat(expenseStr[1] || '0'),
    };
  } catch (error) {
    console.error('Error loading totals:', error);
    return { totalIncome: 0, totalExpense: 0 };
  }
};
