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
    owner: User;
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
    owner: string;
    debitWallet: string;
    creditWallet: string;
    ref: string;
    providerRef: string;
    type: string;
    currency: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    status: string;
    metaData: MetaData;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;

}

export interface NormalizedPaymentResponse {
    id: string | ObjectId;
    creditWallet: string | null;
    debitWallet: string | null;
    currency: string;
    ref: string;
    providerRef: string;
    owner: string | ObjectId;
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
    type: string,
    meta: MetaData;
}

export interface PaymentEntry {
    walletToCredit: string;
    walletToDebit: string;
    currency: string;
    ref: string;
    debitOwner: string;
    creditOwner: string;
    amount: number;
    newCreditBalnce: number;
    newDebitBalnce: number;
    oldCreditBalnce: number;
    oldDebitBalnce: number;
    meta: MetaData;
}

export interface SingleNormalizedPayment {
    id?: string;
    creditWallet: Wallet;
    debitWallet: Wallet;
    currency: string;
    ref: string;
    providerRef: string;
    owner: User;
    amount: number;
    status: string,
    metaData: MetaData;
    balanceBefore: number;
    balanceAfter: number;
    createdAt?: Date;
}

export interface PaginatedNormalizedPayment {
    payments: SingleNormalizedPayment[];
    nextCursor: string | null;
    previousCursor: string | null;
    hasNextPage: boolean;
}
