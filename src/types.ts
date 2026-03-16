// src/types.ts

export interface Habit {
    id: number;
    text: string;
    category: string;
    completed: boolean;
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