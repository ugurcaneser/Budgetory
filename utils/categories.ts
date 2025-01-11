export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  image: any | null;
  icon: string;
}

// Income Categories
export const incomeCategories: Category[] = [
  {
    id: 'salary',
    name: 'Salary',
    type: 'income',
    image: null,
    icon: 'cash'
  },
  {
    id: 'investment',
    name: 'Investment',
    type: 'income',
    image: null,
    icon: 'trending-up'
  },
  {
    id: 'freelance',
    name: 'Freelance',
    type: 'income',
    image: null,
    icon: 'laptop'
  },
  {
    id: 'other_income',
    name: 'Other',
    type: 'income',
    image: null,
    icon: 'add-circle'
  }
];

// Expense Categories
export const expenseCategories: Category[] = [
  {
    id: 'food',
    name: 'Food',
    type: 'expense',
    image: require('../assets/category_icons/food.png'),
    icon: 'restaurant'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    type: 'expense',
    image: null,
    icon: 'cart'
  },
  {
    id: 'transport',
    name: 'Transport',
    type: 'expense',
    image: null,
    icon: 'car'
  },
  {
    id: 'bills',
    name: 'Bills',
    type: 'expense',
    image: null,
    icon: 'receipt'
  },
  {
    id: 'other_expense',
    name: 'Other',
    type: 'expense',
    image: null,
    icon: 'add-circle'
  }
];
