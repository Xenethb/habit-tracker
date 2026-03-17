// src/types.ts

export interface Habit {
    id: number;
    text: string;     // What the habit is
    category: string; // Health, Education, etc.
}

export interface Completion {
    habitId: number;  // Connects to the Habit ID
    date: string;     // The specific day you did it (YYYY-MM-DD)
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
    [key: string]: string;
}