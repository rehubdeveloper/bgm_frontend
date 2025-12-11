'use client'

import { useState, useEffect } from 'react'
// @ts-ignore: 'next/server' types may not be available in this environment
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, User, Phone, MapPin, Briefcase, Heart, Calendar, Building2, CheckCircle, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const formSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +1234567890)'),
    department: z.string().min(1, 'Department is required'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    marital_status: z.string().min(1, 'Marital status is required'),
    gender: z.string().min(1, 'Gender is required'),
    occupation: z.string().min(1, 'Occupation is required'),
    address: z.string().min(1, 'Address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof formSchema>

interface Department {
    id: number;
    name: string;
    description?: string;
    is_active?: boolean;
}

const maritalStatuses = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
]

const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
]

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])
    const [departmentsLoading, setDepartmentsLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments/')
            if (response.ok) {
                const data = await response.json()
                // Handle paginated response format
                const departmentsData = data.results || []
                setDepartments(departmentsData)
            } else {
                console.error('Failed to fetch departments')
                setDepartments([])
                setError('Failed to load departments. Please refresh the page.')
            }
        } catch (error) {
            console.error('Error fetching departments:', error)
            setDepartments([])
            setError('Network error while loading departments.')
        } finally {
            setDepartmentsLoading(false)
        }
    }

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            department: '',
            date_of_birth: '',
            marital_status: 'single',
            gender: 'male',
            occupation: '',
            address: '',
            password: '',
        },
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    department: parseInt(data.department),
                }),
            })

            let result
            try {
                result = await response.json()
            } catch {
                result = { detail: 'Invalid response from server' }
            }

            if (response.ok) {
                setSuccess('Registration successful! Redirecting to login...')
                form.reset({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    department: '',
                    date_of_birth: '',
                    marital_status: 'single',
                    gender: 'male',
                    occupation: '',
                    address: '',
                    password: '',
                })
                // Redirect to login page after showing success
                setTimeout(() => {
                    router.push('/login')
                }, 1500)
            } else {
                // Handle different error types
                if (result.detail) {
                    setError(result.detail)
                } else if (result.error) {
                    setError(result.error)
                } else if (result.email && Array.isArray(result.email)) {
                    setError(result.email[0])
                } else if (result.phone && Array.isArray(result.phone)) {
                    setError(result.phone[0])
                } else if (response.status === 400) {
                    setError('Please check your information and try again.')
                } else if (response.status >= 500) {
                    setError('Server error. Please try again later.')
                } else {
                    setError('Registration failed. Please try again.')
                }
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-8">
                {/* BGM Logo/Branding */}
                <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <Image src="/BGM.png" alt="BGM Logo" width={40} height={40} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                        Join Our Community
                    </h1>
                    <p className="text-slate-600 font-body">
                        Become a member of Believers Glorious Ministry
                    </p>
                </div>

                {/* Registration Form */}
                <div className="glass-strong rounded-2xl shadow-xl border border-white/20 p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-display font-semibold text-slate-800 mb-2">
                            Member Registration
                        </h2>
                        <p className="text-slate-600">
                            Fill out the form below to join our faith community
                        </p>
                    </div>

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

                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <User className="w-5 h-5" />
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">First Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your first name"
                                                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-600" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Last Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your last name"
                                                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-600" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Phone Number
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Enter your phone number (+1234567890)"
                                                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 pl-4"
                                                        {...field}
                                                    />
                                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-600" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Church Information Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <Building2 className="w-5 h-5" />
                                    Church Information
                                </h3>

                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Department
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={departmentsLoading}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12">
                                                        <SelectValue placeholder={departmentsLoading ? "Loading departments..." : "Select a department"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            {dept.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-red-600" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Additional Information Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <Heart className="w-5 h-5" />
                                    Additional Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="date_of_birth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Date of Birth
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-600" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="marital_status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                    <Heart className="w-4 h-4" />
                                                    Marital Status
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12">
                                                            <SelectValue placeholder="Select marital status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {maritalStatuses.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                {status.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-red-600" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Gender</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12">
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {genders.map((gender) => (
                                                            <SelectItem key={gender.value} value={gender.value}>
                                                                {gender.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-red-600" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="occupation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4" />
                                                    Occupation
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="Enter your occupation"
                                                            className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 pl-4"
                                                            {...field}
                                                        />
                                                        <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-600" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Address
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Enter your full address"
                                                        className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-12 pl-4"
                                                        {...field}
                                                    />
                                                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-600" />
                                        </FormItem>
                                    )}
                                />

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
                                                        placeholder="Create a secure password (min. 6 characters)"
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
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Registering...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Join Our Community
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-slate-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Sign in here
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
