"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { LanguageSelect } from "@/shared/components/LanguageSelect";
import { useTranslations } from "next-intl";
import { LogOut, Settings, UserRoundPen } from "lucide-react"
import { useTheme } from "@/shared/hooks/useTheme";

import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/shared/components/ui/menubar"

import { Badge } from "@/shared/components/ui/badge"
import Link from "next/link";

export function Header() {
    const { data } = useSession();
    const t = useTranslations("app.(ui)._components.Header");

    const [menuOpen, setMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme()
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMenuOpen(false); // Automatically close menu on desktop dimensions
            }
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <header className="flex justify-between items-center h-16 px-8 bg-sidebar">
            <div className="flex items-center gap-6 ml-auto">

                <LanguageSelect />

                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>{data?.user?.data?.email || t("unknownUser")}</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => signOut()}>
                                <Badge> {t("signOut")}</Badge> <MenubarShortcut><LogOut size={20} /></MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem asChild>
                                <Link href="/profile">
                                    {t("profile")}
                                    <MenubarShortcut>
                                        <UserRoundPen size={20} />
                                    </MenubarShortcut>
                                </Link>
                            </MenubarItem>
                            <MenubarItem> {t("settings")} <MenubarShortcut><Settings size={20} /></MenubarShortcut></MenubarItem>
                            <MenubarSeparator />

                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>
        </header>
    );
}
