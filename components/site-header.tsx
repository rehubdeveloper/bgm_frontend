"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function SiteHeader() {
    const pathname = usePathname()

    const navItems = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Giving", href: "/giving" },
        { name: "Contact", href: "/contact" },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                            ✦
                        </div>
                        <div className="hidden sm:block">
                            <p className="font-display font-bold text-lg">BGM</p>
                            <p className="text-xs text-muted-foreground">Believers Glorious</p>
                        </div>
                    </Link>

                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-sm font-body font-medium transition-colors relative group",
                                    pathname === item.href ? "text-primary" : "text-foreground hover:text-primary",
                                )}
                            >
                                {item.name}
                                <span
                                    className={cn(
                                        "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                                        pathname === item.href ? "w-full" : "w-0 group-hover:w-full",
                                    )}
                                />
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Button */}
                    <button className="btn-primary text-sm">Watch Live</button>
                </div>
            </div>
        </header>
    )
}
