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
    image: require('../assets/category_icons/salary.png'),
    icon: 'cash'
  },
  {
    id: 'investment',
    name: 'Investment',
    type: 'income',
    image: require('../assets/category_icons/investment.png'),
    icon: 'trending-up'
  },
  {
    id: 'freelance',
    name: 'Freelance',
    type: 'income',
    image: require('../assets/category_icons/freelance.png'),
    icon: 'laptop'
  },
  {
    id: 'other_income',
    name: 'Other',
    type: 'income',
    image: require('../assets/category_icons/other_income.png'),
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
    id: 'transport',
    name: 'Transport',
    type: 'expense',
    image: require('../assets/category_icons/transport.png'),
    icon: 'car'
  },
  
  {
    id: 'other_expense',
    name: 'Other',
    type: 'expense',
    image: require('../assets/category_icons/other_expense.png'),
    icon: 'add-circle'
  }
];
