import {JwtPayload} from "jwt-decode";

export interface User {

    email: string; // Required, valid email format, minLength: 1, maxLength: 255
    first_name: string;
    last_name: string;
    is_active?: boolean; // Optional, read-only
    is_superuser?: boolean; // Optional, read-only
    is_verified?: boolean; // Optional, read-only
    updated_at: string;
    created_at: string;

}


export interface Token {
    access_token: string;
    refresh_token: string;
}

export interface CustomJwtPayload extends JwtPayload {
    sub: string;
    aud: string;
    user: User;
}


interface UserProfile {
    id: string;
    email: string;
    last_name: string;
    first_name: string;
    is_active: boolean;
    is_superuser: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    // Если есть поле с аватаром, можно добавить:
    // avatar_url?: string;
  }
  

interface Settings {
    model_id: string;
    text: string;
    temperature: number;
    active: boolean;
    full_manual_mode: boolean;
    max_tokens: number;
  }