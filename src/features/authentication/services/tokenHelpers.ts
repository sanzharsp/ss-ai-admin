import {cookies} from "next/headers";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
// Retrieve the access token from cookies
export const getAccessToken = async (): Promise<string | null> => {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_KEY)?.value;
    return accessToken || null;
};

// Set the access token in cookies
export const setAccessToken = async (token: string): Promise<void> => {
    (await cookies()).set(ACCESS_TOKEN_KEY, token, {
        httpOnly: true, // Prevent JavaScript access for added security
        secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
        sameSite: "strict", // Prevent CSRF attacks
        path: "/", // Make the cookie available throughout the app
    });
};

// Retrieve the refresh token from cookies
export const getRefreshToken = async (): Promise<string | null> => {
    const refreshToken = (await cookies()).get(REFRESH_TOKEN_KEY)?.value;
    return refreshToken || null;
};

// Set the refresh token in cookies
export const setRefreshToken = async (token: string): Promise<void> => {
    (await cookies()).set(REFRESH_TOKEN_KEY, token, {
        httpOnly: true, // Prevent JavaScript access for added security
        secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
        sameSite: "strict", // Prevent CSRF attacks
        path: "/", // Make the cookie available throughout the app
    });
};

// Clear both tokens from cookies
export const clearTokens = async (): Promise<void> => {
    (await cookies()).delete(ACCESS_TOKEN_KEY);
    (await cookies()).delete(REFRESH_TOKEN_KEY);
};
