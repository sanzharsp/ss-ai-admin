import {z} from "zod";
import {getTranslator} from "@/locales/config/translation";

export const createSignUpSchema = async () => {
    const t = await getTranslator();

    return z
        .object({
            username: z
                .string()
                .min(3, t("auth.errors.username.min"))
                .max(30, t("auth.errors.username.max")),
            email: z.string().email(t("auth.errors.email.invalid")),
            password: z
                .string()
                .min(8, t("auth.errors.password.min"))
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    t("auth.errors.password.weak")
                ),
            confirm: z.string(),
        })
        .refine((data) => data.password === data.confirm, {
            message: t("auth.errors.password.mismatch"),
            path: ["confirm"],
        });
};

export const createSignInSchema = async () => {
    const t = await getTranslator();

    return z.object({
        email: z.string().email(t("auth.errors.email.invalid")),
        password: z.string().min(8, t("auth.errors.password.min")),
    });
};



export const createChangePasswordSchema = async () => {
    const t = await getTranslator();
  
    return z
      .object({
        password: z
          .string()
          .min(8, t('auth.errors.password.min'))
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            t('auth.errors.password.weak')
          ),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t('auth.errors.password.mismatch'),
        path: ['confirmPassword'],
      });
  };