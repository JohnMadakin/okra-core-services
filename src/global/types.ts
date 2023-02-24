import { ObjectId } from "mongoose";

export interface NormalizedUser {
    id: string | ObjectId;
    firstName: string;
    lastName: string;
    email: string;  
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedUsers {
    users: NormalizedUser[];
    hasNextPage: boolean;
    cursor: string | null;
}

export enum CurrencyEnum {
    NGN = 'NGN',
    USD = 'USD'
}

export interface AuthUser {
    id: string
    firstName: string;
    lastName: string;
    email: string;  
    createdAt: Date;
    updatedAt: Date;
}

export interface Wallets {
    id: string | ObjectId
    amount: number;
    currency: string;
    dailyLimit: number;  
    createdAt: Date;
    updatedAt: Date;
}
export interface FundedWallet {
    id: string | ObjectId
    amount: number;
    currency: string;
}
