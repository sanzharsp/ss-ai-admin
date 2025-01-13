import {Token} from "@/types/user";
import {ApiResponse} from "@/types/api";
import {apiClient} from "@/services/apiServer";
import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
    clearTokens,
} from "@/features/authentication/services/tokenHelpers";
import {getTranslator} from "@/locales/config/translation";
import axios from "axios";

// Centralized error extraction
function extractErrorMessage(
    error: unknown,
    translator: (key: string) => string
): string {
    if (error.status === 400){
        if (error.response?.data.detail.status === 'ADMIN_ALREADY_EXIST'){
            return translator("auth.adminAlreadyExist");
        }
    }
    if (error.status === 401){
        if (error.response?.data.detail.status === 'BAD_CREDENTIALS'){
            return translator("auth.badCredentials");
        }
    }
    if (axios.isAxiosError(error) && error.response?.data) {
        const {message} = error.response.data;
        return message || translator("services.unknownError");
    }
    

    return translator("services.serverError");
}

// Handle API responses
async function handleResponse<T>(
    request: Promise<any>,
    translator?: (key: string) => string
): Promise<ApiResponse<T>> {
    const t = translator || (await getTranslator());
    try {
        const response = await request;
        return {success: true, data: response.data};
    } catch (error) {
            
        console.error("API Error:", error);
        return {success: false, error: extractErrorMessage(error, t)};
    }
}

// Register a new user
export const registerUser = async (
    email: string,
    password: string
): Promise<ApiResponse<Token>> => {
    const t = await getTranslator();
    return handleResponse<Token>(
        apiClient.post("/auth/register", {email, password}),
        t
    );
};

// Log in a user
export const loginUser = async (
    email: string,
    password: string
): Promise<ApiResponse<Token>> => {
    const t = await getTranslator();
    const response = await handleResponse<Token>(
        apiClient.post("/auth/login", {email, password}),
        t
    );

    // Store tokens on successful login

    return response;
};

// Refresh the access token
export const refreshToken = async (): Promise<string> => {
    const refresh = getRefreshToken();

    if (!refresh) {
        await clearTokens();
        throw new Error("Refresh token not found. Please log in again.");
    }

    const t = await getTranslator();
    const response = await handleResponse<{ access: string }>(
        apiClient.post("/auth/refresh", {refresh}),
        t
    );

    if (response.success) {
        await setAccessToken(response.data.access);
        return response.data.access;
    } else {
        await clearTokens();
        throw new Error(response.error || "Failed to refresh token.");
    }
};
