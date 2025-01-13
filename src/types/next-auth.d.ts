import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        email: string; // Required, valid email format, minLength: 1, maxLength: 255
        first_name: string;
        last_name: string;
        is_active?: boolean; // Optional, read-only
        is_superuser?: boolean; // Optional, read-only
        is_verified?: boolean; // Optional, read-only
        updated_at: string;
        created_at: string;
    }

    interface Session {
        user: User;
    }

    interface JWT {
        user: User;
    }
}
