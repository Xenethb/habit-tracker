// src/types.ts

export interface Habit {
    id: number;
    text: string;
    category: string;
}

export interface Completion {
    habitId: number;
    date: string;
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

export type PlanStatus = 'to-do' | 'in-progress' | 'in-review' | 'complete';

export interface PlanTask {
    id: number;
    text: string;
    status: PlanStatus;
}

// --- NEW: Notes Interface ---
export interface Note {
    id: number;
    title: string;
    content: string;
    color: string; // To store the note's background color
    date: string;  // Created/Updated date
}