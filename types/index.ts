export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    image: string | null;
    icon: string;
}

export interface Transaction {
    id: string;
    amount: number;
    category: Category;
    date: Date;
    note?: string;
}
