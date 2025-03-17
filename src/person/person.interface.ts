export interface PersonRequest {
    name: string;
    lastName: string;
    age: number;
    weight: number;
    localId: string;
    createdAt: string;
    }
    
    export interface PersonResponse {
    id: number;
    name: string;
    lastName: string;
    age: number;
    weight: number;
    localId: string;
    saved: boolean;
    message: string;
    createdAt: string;
    syncedAt: string;
    }
    
    export interface SyncResponse {
    success: boolean;
    syncedIds: string[];
    message: string;
    }

    export interface EmptyRequest {}
    export interface EmptyResponse {}