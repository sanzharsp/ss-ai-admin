import { useTranslations } from "next-intl";
export function Footer() {
    const t = useTranslations("app.(ui)._components.Footer");
    return (
        <footer className="h-full py-6 md:px-8 md:py-0 bg-sidebar">
            <div className="container-wrapper">
                <div className="container py-4">
                    <div className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">


                        {t.rich('createdBy', {

                            library: (chunks) => (
                                <a href="https://ui.shadcn.com" className="font-medium underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                                    {chunks}
                                </a>
                            )
                        })}

                    </div>
                </div>
            </div>
        </footer>
    )
}
