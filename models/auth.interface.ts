export interface LoginResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    isFirstLogin: boolean;
    access_token: string;
}
