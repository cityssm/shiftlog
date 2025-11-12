export interface APIRequest {
    params?: {
        apiKey?: string;
    };
}
export interface UserRequest {
    session?: {
        user?: User;
    };
}
export declare function apiKeyIsValid(request: APIRequest): Promise<boolean>;
export declare function userIsAdmin(request: UserRequest): boolean;
export declare function getUser(userName: string): Promise<User | undefined>;
