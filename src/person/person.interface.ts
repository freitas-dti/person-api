export interface PersonRequest {
    name: string;
    lastName: string;
    age: number;
    weight: number;
    localId: string;
    }
    
    export interface PersonResponse {
    id: number;
    name: string;
    lastName: string;
    age: number;
    weight: number;
    saved: boolean;
    message: string;
    }
    
    export interface SyncResponse {
    success: boolean;
    syncedIds: string[];
    message: string;
    }