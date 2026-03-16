// src/types.ts

export interface Habit {
    id: number;
    name?: string;
    text: string;
    category: string;
    completed: boolean;
    date?: string;
}

export interface Goal {
    id: number;
    text: string;
}

export interface Wallet {
    cash: string;
    bank: string;
    debtors: string;
    creditors: string;
    fd: string;
    [key: string]: string; // This allows us to loop through keys dynamically
}