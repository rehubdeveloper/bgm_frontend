
'use client'

import { useState } from 'react'
// @ts-ignore: 'next/server' types may not be available in this environment
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof formSchema>

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const router = useRouter()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            console.log('Login form data:', { email: data.email, hasPassword: !!data.password })

            const response = await fetch('/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            let result
            try {
                result = await response.json()
            } catch {
                result = { detail: 'Invalid response from server' }
            }

            if (response.ok && result.access) {
                setSuccess('Login successful! Redirecting...')
                console.log('Login successful, access token present, dispatching auth-change')
                // Store tokens in localStorage
                localStorage.setItem('access_token', result.access)
                localStorage.setItem('refresh_token', result.refresh || '')

                // Dispatch event to notify other components of auth change
                window.dispatchEvent(new CustomEvent('auth-change'))

                form.reset()
                // Small delay to show success message
                setTimeout(() => {
                    router.push('/')
                }, 1000)
            } else {
                console.log('Login response not ok or no access token:', result)
                // Handle different error types
                if (result.detail) {
                    setError(result.detail)
                } else if (result.error) {
                    setError(result.error)
                } else if (response.status === 401) {
                    setError('Invalid email or password. Please check your credentials.')
                } else if (response.status >= 500) {
                    setError('Server error. Please try again later.')
                } else {
                    setError('Login failed. Please try again.')
                }
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* BGM Logo/Branding */}
                <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <Image src="/BGM.png" alt="BGM Logo" width={70} height={70} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-600 font-body">
                        Sign in to your Believers Glorious Ministry account
                    </p>
                </div>

                {/* Login Form */}
                <div className="glass-strong rounded-2xl shadow-xl border border-white/20 p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Error Alert */}
                            {error && (
                                <Alert variant="destructive" className="border-red-200 bg-red-50">
                                    <AlertDescription className="text-red-800">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Success Alert */}
                            {success && (
                                <Alert className="border-green-200 bg-green-50">
                                    <AlertDescription className="text-green-800">
                                        {success}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email Address
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email address"
                                                    className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 pl-4"
                                                    {...field}
                                                />
                                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-600" />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 pl-4"
                                                    {...field}
                                                />
                                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-600" />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing In...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Sign In
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-slate-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Join our community
                            </Link>
                        </p>
                        <Link href="/" className="text-slate-500 hover:text-slate-600 text-sm inline-block">
                            ← Back to home
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-slate-500 text-sm">
                        Believers Glorious Ministry<br />
                        Building faith, strengthening community
                    </p>
                </div>
            </div>
        </div>
    )
}
