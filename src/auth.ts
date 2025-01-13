import NextAuth, {CredentialsSignin} from "next-auth"
import Credentials from "next-auth/providers/credentials";

import {createSignUpSchema, createSignInSchema} from "@/features/authentication/lib/zod";
import {getTranslator} from "@/locales/config/translation";
import {loginUser, registerUser} from "@/features/authentication/services/authService";
import {z} from "zod";
import {jwtDecode} from "jwt-decode";
import {CustomJwtPayload} from "@/types/user";
// import { setAccessToken, setRefreshToken } from "./services/tokenHelpers";

class InvalidLoginError extends CredentialsSignin {
    constructor(message: string) {
        super(message);
        this.name = "InvalidLoginError";
        this.code = message; // You can define a custom code if needed
    }
}


export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [
        Credentials({
            id: "signup",
            name: "signup",
            credentials: {
                email: {},
                password: {},
                confirm: {},
            },
            async authorize(credentials, req) {
                console.log({credentials})
                const t = await getTranslator();
                const {success, data, error} = await (await createSignUpSchema()).safeParseAsync(credentials);

                if (!success) {
                    if (error instanceof z.ZodError) {
                        const firstError = error.errors[0];
                        throw new InvalidLoginError(firstError.message || t("auth.unknownError"));
                    }

                    

                    // Fallback for unexpected errors
                    throw new InvalidLoginError(t("auth.unknownError"));
                }
                const {email, password, confirm} = data

                if (password !== confirm) {
                    throw new InvalidLoginError(t("auth.passwordAndConfirmMismatch"))
                }

                let result = await registerUser(email, password);

                if (!result.success) {
                    if (result.error?.includes("User with this email already exists")) {
                        throw new Error("Пользователь с таким email уже существует. Воспользуйтесь другим email или войдите в систему.");
                      }
                    throw new InvalidLoginError(result.error);
                }
                
                // await setAccessToken(result.data.access_token);
                // await setRefreshToken(result.data.refresh_token);
                const decodedAccessToken = jwtDecode(result.data.access_token) as CustomJwtPayload
                if (!decodedAccessToken) {
                    throw new InvalidLoginError(t("auth.invalidToken"));
                }

                console.log({in: 'signup', decodedAccessToken});
                // return decodedAccessToken.user
                return {
                    access_token: result.data.access_token, // или как у вас называется
                    data: decodedAccessToken.user,
                  };
            },
        }),
        Credentials({
            id: "login",
            name: "login",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials, req) {
                const t = await getTranslator();
                const {success, data, error} = await (await createSignInSchema()).safeParseAsync(credentials);

                if (!success) {
                    if (error instanceof z.ZodError) {
                        const firstError = error.errors[0];
                        throw new InvalidLoginError(firstError.message || t("auth.unknownError"));
                    }

                    // Fallback for unexpected errors
                    throw new InvalidLoginError(t("auth.unknownError"));
                }
                const {email, password} = data

                let result = await loginUser(email, password);

                if (!result.success) {
                    throw new InvalidLoginError(result.error);
                }
                const decodedAccessToken = jwtDecode(result.data.access_token) as CustomJwtPayload
                

                // await setAccessToken(result.data.access_token);
                // await setRefreshToken(result.data.refresh_token);
    

                if (!decodedAccessToken) {
                    throw new InvalidLoginError(t("auth.invalidToken"));
                }
                
                console.log({in: 'login', decodedAccessToken});
                // return decodedAccessToken.user
                return {
                    access_token: result.data.access_token, // или как у вас называется
                    data: decodedAccessToken.user,
                  };
            },
        })
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({token, user, account}) {
            if (account && user) {
                token.user = user;
         
            }
            return token;
        },
        async session({session, token}) {
            if (token) {
                session.user = token.user as any;
                
            }
            // console.log({ in: 'session', session });
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
})
