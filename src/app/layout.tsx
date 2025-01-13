import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "@/core/styles/globals.css";
import {NextIntlClientProvider} from "next-intl";
import {defaultLocale} from "@/locales/config/locales";
import {ToastContainer} from "react-toastify";
import React from "react";
import {getMessages} from "next-intl/server";
import {AllProviders} from "@/core/providers/AllProviders";
import { Toaster } from "@/shared/components/ui/toaster";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


export const metadata: Metadata = {
    title: {
        default: "SS AI ADMIN",
        template: `%s - SS AI ADMIN`,
    },
    metadataBase: new URL("https://github.com/Sayyat/next-intl-auth"),
    description: "Админ панель для SS AI",
    keywords: [
        "SS",
        "AI",
        "ADMIN",
        "SS AI",
        "SS AI ADMIN",
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Next-Auth",
        "Internationalization",
    ],
    authors: [
        {
            name: "Sanzhar Sapar & Sayat Raykul",
            url: "https://web.ziz.kz/",
        },
    ],
    creator: "Sanzhar Sapar & Sayat Raykul",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://next-intl-auth-mu.vercel.app",
        title: "SS AI ADMIN",
        description: "Админ панель для SS AI",
        siteName: "SS AI ADMIN",
        images: [
            {
                url: "https://yourprojectdomain.com/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "SS AI ADMIN",
            },
        ],
    },
    generator: "Next js",
    icons: {
        icon: "/globe.svg",
        shortcut: "/globe.svg",
        apple: "/globe.svg",
    },
    manifest: "https://next-intl-auth-mu.vercel.app/site.webmanifest",
};


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const messages = await getMessages();

    return (
        <html lang={defaultLocale}>
        <head>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no"
            />
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <NextIntlClientProvider messages={messages}>
            <AllProviders>
                {children}
                <ToastContainer
                    limit={3}
                    toastClassName={
                        "font-bold text-secondaryColor flex items-center p-4 "
                    }
                />
                <Toaster />
            </AllProviders>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
