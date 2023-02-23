export interface NormalizedUser {
    id: string
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
