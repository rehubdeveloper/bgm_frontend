'use client'

import { useState, useEffect } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const pathname = usePathname()

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('access_token')
            setIsLoggedIn(!!token)
            setCheckingAuth(false)
        }

        checkAuth()

        // Listen for storage changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'access_token') {
                setIsLoggedIn(!!e.newValue)
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('admin_authorized')
        setIsLoggedIn(false)
        window.location.href = '/'
    }

    const navItems = [
        { label: 'Home', href: '/', section: '/' },
        { label: 'About', href: '/#about', section: 'about' },
        { label: 'Ministries', href: '/#ministries', section: 'ministries' },
        { label: 'Contact', href: '/#contact', section: 'contact' },
        { label: 'Watch Live', href: '/', external: true },
    ]

    // Don't show navbar on login/register pages and admin pages
    if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/admin')) {
        return null
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-strong backdrop-blur-md border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg transition-transform group-hover:scale-105">
                            <Image src="/BGM.png" alt="BGM Logo" width={32} height={32} />
                        </div>
                        <div className="hidden sm:block">
                            <p className="font-display font-bold text-lg">BGM</p>
                            <p className="text-xs text-muted-foreground">Believers Glorious</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-sm font-body font-medium hover:text-primary transition-colors relative group"
                            >
                                {item.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                    </nav>

                    {/* Auth Buttons - Desktop */}
                    {!checkingAuth && (
                        <div className="hidden md:flex items-center gap-2 md:gap-3">
                            {!isLoggedIn ? (
                                <>
                                    <Link
                                        href="/login"
                                        className="btn-outline text-sm px-3 md:px-4 py-2 hover:bg-primary/10 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link href="/register" className="btn-primary text-sm px-4 md:px-6">
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        Welcome back!
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="btn-outline text-sm px-3 md:px-4 py-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors flex items-center gap-2"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
                        <div className="px-4 py-6 space-y-4">
                            {/* Mobile Nav Items */}
                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block py-3 text-sm font-body font-medium hover:text-primary transition-colors border-b border-border/30 last:border-b-0"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>

                            {/* Mobile Auth Buttons */}
                            {!checkingAuth && (
                                <div className="pt-4 border-t border-border/50 space-y-3">
                                    {!isLoggedIn ? (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="btn-outline w-full text-center text-sm py-2.5"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="btn-primary w-full text-center text-sm py-2.5"
                                            >
                                                Register
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-center py-2">
                                                <span className="text-sm text-muted-foreground">Welcome back!</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    handleLogout()
                                                    setIsMenuOpen(false)
                                                }}
                                                className="btn-outline w-full text-center text-sm py-2.5 hover:bg-red-50 hover:text-red-600 hover:border-red-300 flex items-center justify-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
