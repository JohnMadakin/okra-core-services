import { ObjectId } from "mongoose";
import { User } from "src/users/user.schema";
import { Wallet } from "src/wallet/wallet.schema";

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

export enum PaymentStatusEnum {
    COMPLETED = 'completed',
    INITIATED = 'initiated',
    PENDING = 'pending',
    FAILED = 'failed',
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
    id: string | ObjectId;
    amount: number;
    currency: string;
}

export interface WalletFilter{ 
    currency?: string;
    _id: string; 
    isDeleted: boolean; 
    owner?: string 
}

export interface MetaData{ 
    systemData?: Object | null;
    userData?: Object | null;
}

export enum PaymentTypeEnum {
    CREDIT = 'credit',
    DEBIT = 'debit',
}

export interface NormalizedPaymentEntry {
    walletToCredit: string;
    walletToDebit: string;
    currency: string;
    ref: string;
    debitOwner: string | ObjectId;
    creditOwner: string | ObjectId;
    amount: number;
    newCreditBalnce: number;
    newDebitBalnce: number;
    oldCreditBalnce: number;
    oldDebitBalnce: number;
    meta: MetaData;
}

export interface NormalizedPaymentResponse {
    id: string | ObjectId;
    creditWallet: Wallet | null;
    debitWallet: Wallet | null;
    currency: string;
    ref: string;
    providerRef: string;
    owner: User | null;
    amount: number;
    status: string,
    metadata: MetaData;
}

export interface UnNormalizedPayment {
    _id: string | ObjectId;
    creditWallet: string;
    debitWallet: string;
    currency: string;
    ref: string;
    type: 'debit' | 'credit';
    providerRef: string;
    owner: string | ObjectId;
    amount: number;
    status: string,
    metaData: MetaData;
}

export interface NormalizedPayment {
    id: string | ObjectId;
    creditWallet: string;
    debitWallet: string;
    currency: string;
    ref: string;
    providerRef: string;
    owner: string | ObjectId;
    amount: number;
    status: string,
    meta: MetaData;
}
