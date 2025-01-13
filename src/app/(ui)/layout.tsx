import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/app/(ui)/_components/Header";
import { Footer } from "@/app/(ui)/_components/Footer";
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/app-sidebar";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    if (!session) redirect("/login");

    return (
        <div className="flex flex-col h-dvh">
            {/* Header */}
            <SidebarProvider>
                <AppSidebar />
                <div className="w-full h-full flex flex-col justify-between bg-sidebar">
                    <div className="h-16 flex-shrink-0 ">
                        <Header />

                    </div>
                    <div className="flex-1 h-full overflow-auto rounded-2xl bg-white">
                        <SidebarTrigger />
                        {children}
                    </div>
                    <div className="h-16 flex-shrink-0">
                        <Footer />
                    </div>
                </div>

                {/* Footer */}
            </SidebarProvider>

        </div>
    );
}
