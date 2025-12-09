'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

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
            }
        } catch (error) {
            console.error('Error fetching departments:', error)
            setDepartments([])
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

            if (response.ok) {
                toast.success('Registration successful! Please login to continue.')
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
                // Redirect to login page
                router.push('/login')
            } else {
                const error = await response.json()
                toast.error(error.error || 'Registration failed')
            }
        } catch (error) {
            toast.error('An error occurred during registration')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Member Registration</CardTitle>
                    <CardDescription>
                        Join our church community by filling out the registration form below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your first name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your last name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter your email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a department" />
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date_of_birth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="marital_status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marital Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your occupation" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Registering...' : 'Register'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
