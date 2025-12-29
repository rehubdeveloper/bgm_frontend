"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useCachedData } from "@/hooks/use-cached-data"
import { Plus, Loader2, CheckCircle, AlertCircle, Edit, Trash2, Search, SortAsc, SortDesc, Grid, List, User, Mail, Phone, Calendar, MapPin, Users, RefreshCw } from "lucide-react"


interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department: number;
    date_of_birth: string;
    marital_status: 'single' | 'married' | 'divorced' | 'widowed';
    gender: 'male' | 'female' | 'other';
    occupation: string;
    address: string;
    created_at: string;
    updated_at: string;
}

interface Department {
    id: number;
    name: string;
    description: string;
    leader: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function MembersManagement() {
    const searchParams = useSearchParams()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<Member | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [submitSuccess, setSubmitSuccess] = useState("")
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department: "",
        date_of_birth: "",
        marital_status: "single" as 'single' | 'married' | 'divorced' | 'widowed',
        gender: "male" as 'male' | 'female' | 'other',
        occupation: "",
        address: "",
        password: "",
    })
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'department'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [filterText, setFilterText] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

    // Fetch functions for cached data hook
    const fetchMembersData = async (): Promise<Member[]> => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            throw new Error('No access token found')
        }

        const response = await fetch('/api/contents/members/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('access_token')
                window.location.href = '/login'
                throw new Error('Authentication failed')
            }
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to fetch members (${response.status})`)
        }

        const data = await response.json()
        return Array.isArray(data) ? data : (data.results || [])
    }

    const fetchDepartmentsData = async (): Promise<Department[]> => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            throw new Error('No access token found')
        }

        const response = await fetch('/api/contents/departments/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('access_token')
                window.location.href = '/login'
                throw new Error('Authentication failed')
            }
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to fetch departments (${response.status})`)
        }

        const data = await response.json()
        return Array.isArray(data) ? data : (data.results || [])
    }

    // Use cached data hooks
    const {
        data: members,
        isLoading: membersLoading,
        error: membersError,
        refresh: refreshMembers
    } = useCachedData(fetchMembersData, {
        cacheKey: 'admin-members',
        cacheDuration: 5 * 60 * 1000 // 5 minutes
    })

    const {
        data: departments,
        isLoading: departmentsLoading,
        error: departmentsError,
        refresh: refreshDepartments
    } = useCachedData(fetchDepartmentsData, {
        cacheKey: 'admin-departments',
        cacheDuration: 10 * 60 * 1000 // 10 minutes (departments change less frequently)
    })

    const isLoading = membersLoading || departmentsLoading
    const error = membersError || departmentsError

    // Check for URL parameters to auto-open dialogs
    useEffect(() => {
        const action = searchParams.get('action')

        if (action === 'create') {
            setIsDialogOpen(true)
            // Clean up the URL
            window.history.replaceState({}, '', '/admin/members')
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitError("")
        setSubmitSuccess("")

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('No access token found')
                setSubmitError('Authentication required')
                return
            }

            const memberData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                department: parseInt(formData.department) || 0,
                date_of_birth: formData.date_of_birth,
                marital_status: formData.marital_status,
                gender: formData.gender,
                occupation: formData.occupation,
                address: formData.address,
                password: formData.password,
            }

            const response = await fetch('/api/contents/members/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(memberData),
            })

            if (response.ok) {
                // Refresh the cached data instead of manually updating state
                refreshMembers()
                setFormData({
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    department: "",
                    date_of_birth: "",
                    marital_status: "single",
                    gender: "male",
                    occupation: "",
                    address: "",
                    password: "",
                })
                setIsDialogOpen(false)
                setSubmitSuccess("Member created successfully!")
                // Clear success message after 3 seconds
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                if (response.status === 401) {
                    // Token expired or invalid, redirect to login
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to create member (${response.status})`)
            }
        } catch (error) {
            console.error('Error creating member:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            department: "",
            date_of_birth: "",
            marital_status: "single",
            gender: "male",
            occupation: "",
            address: "",
            password: "",
        })
        setSubmitError("")
        setSubmitSuccess("")
        setIsDialogOpen(false)
    }

    const handleViewMember = (member: Member) => {
        setSelectedMember(member)
        setIsViewDialogOpen(true)
    }

    const handleEditMember = (member: Member) => {
        setSelectedMember(member)
        setFormData({
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            phone: member.phone || "",
            department: member.department?.toString() || "",
            date_of_birth: member.date_of_birth || "",
            marital_status: member.marital_status,
            gender: member.gender,
            occupation: member.occupation || "",
            address: member.address || "",
            password: "", // Don't populate password for security
        })
        setIsEditDialogOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMember) return

        setIsSubmitting(true)
        setSubmitError("")

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            const updateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                department: parseInt(formData.department) || 0,
                date_of_birth: formData.date_of_birth,
                marital_status: formData.marital_status,
                gender: formData.gender,
                occupation: formData.occupation,
                address: formData.address,
                ...(formData.password && { password: formData.password }), // Only include password if provided
            }

            const response = await fetch(`/api/contents/members/${selectedMember.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            })

            if (response.ok) {
                const updatedMember = await response.json()

                // Refresh the cached data instead of manually updating state
                refreshMembers()

                setSubmitSuccess("Member updated successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
                setIsEditDialogOpen(false)
            } else {
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to update member (${response.status})`)
            }
        } catch (error) {
            console.error('Error updating member:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteMember = async (memberId: number) => {
        try {
            setIsDeleting(true)
            setSubmitError("")

            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            const response = await fetch(`/api/contents/members/${memberId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Refresh the cached data instead of manually updating state
                refreshMembers()
                setSubmitSuccess("Member deleted successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to delete member (${response.status})`)
            }
        } catch (error) {
            console.error('Error deleting member:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    // Filter and sort members
    const filteredAndSortedMembers = (members || [])
        .filter(member => {
            if (!filterText) return true
            const searchLower = filterText.toLowerCase()
            return (
                `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchLower) ||
                member.email.toLowerCase().includes(searchLower) ||
                member.phone.includes(searchLower) ||
                member.occupation.toLowerCase().includes(searchLower)
            )
        })
        .sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case 'name':
                    comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
                    break
                case 'email':
                    comparison = a.email.localeCompare(b.email)
                    break
                case 'department':
                    comparison = a.department - b.department
                    break
            }

            return sortOrder === 'asc' ? comparison : -comparison
        })

    const getMaritalStatusColor = (status: string) => {
        switch (status) {
            case 'single': return 'bg-blue-100 text-blue-800'
            case 'married': return 'bg-green-100 text-green-800'
            case 'divorced': return 'bg-red-100 text-red-800'
            case 'widowed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getGenderColor = (gender: string) => {
        switch (gender) {
            case 'male': return 'bg-blue-100 text-blue-800'
            case 'female': return 'bg-pink-100 text-pink-800'
            case 'other': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getDepartmentName = (departmentId: number) => {
        const department = departments.find(dept => dept.id === departmentId)
        return department ? department.name : `Department ${departmentId}`
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Success/Error Messages */}
            {submitSuccess && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{submitSuccess}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">Members</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Manage church members and their information</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary flex items-center gap-2 w-full sm:w-auto">
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Add Member</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">Add New Member</DialogTitle>
                        </DialogHeader>

                        {submitError && (
                            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-sm">{submitError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name" className="text-sm md:text-base font-medium">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        placeholder="Enter first name"
                                        required
                                        className="text-sm md:text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name" className="text-sm md:text-base font-medium">Last Name *</Label>
                                    <Input
                                        id="last_name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        placeholder="Enter last name"
                                        required
                                        className="text-sm md:text-base"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm md:text-base font-medium">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="member@email.com"
                                        required
                                        className="text-sm md:text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm md:text-base font-medium">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1234567890"
                                        className="text-sm md:text-base"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department" className="text-sm md:text-base font-medium">Department</Label>
                                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(departments || []).map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth" className="text-sm md:text-base font-medium">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        className="text-sm md:text-base"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm md:text-base font-medium">Marital Status</Label>
                                    <Select value={formData.marital_status} onValueChange={(value: 'single' | 'married' | 'divorced' | 'widowed') => setFormData({ ...formData, marital_status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single</SelectItem>
                                            <SelectItem value="married">Married</SelectItem>
                                            <SelectItem value="divorced">Divorced</SelectItem>
                                            <SelectItem value="widowed">Widowed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm md:text-base font-medium">Gender</Label>
                                    <Select value={formData.gender} onValueChange={(value: 'male' | 'female' | 'other') => setFormData({ ...formData, gender: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="occupation" className="text-sm md:text-base font-medium">Occupation</Label>
                                    <Input
                                        id="occupation"
                                        value={formData.occupation}
                                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                        placeholder="Job title"
                                        className="text-sm md:text-base"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm md:text-base font-medium">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Full address..."
                                    className="text-sm md:text-base min-h-[60px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm md:text-base font-medium">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Create password"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2 cursor-pointer" />
                                            Add Member
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Total Members</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">{filteredAndSortedMembers.length}</p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">This Month</p>
                    <p className="text-3xl font-display font-bold text-primary mt-2">
                        {(members || []).filter(member => {
                            const memberDate = new Date(member.created_at || 0)
                            const monthAgo = new Date()
                            monthAgo.setMonth(monthAgo.getMonth() - 1)
                            return memberDate >= monthAgo
                        }).length}
                    </p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Male</p>
                    <p className="text-3xl font-display font-bold text-blue-600 mt-2">
                        {(members || []).filter(member => member.gender === 'male').length}
                    </p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Female</p>
                    <p className="text-3xl font-display font-bold text-pink-600 mt-2">
                        {(members || []).filter(member => member.gender === 'female').length}
                    </p>
                </Card>
            </div>

            {/* Members List - Responsive */}
            <Card className="p-4 md:p-6 glass-card border-2 border-primary/20">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading members...</span>
                    </div>
                ) : !members || members.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No members yet</h3>
                        <p className="text-muted-foreground">Add your first church member to get started.</p>
                    </div>
                ) : (
                    <>
                        {/* Search, Sort, and Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/20 rounded-lg border">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search members..."
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'department')}
                                    className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="email">Sort by Email</option>
                                    <option value="department">Sort by Department</option>
                                </select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-3"
                                >
                                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                </Button>
                                <div className="flex border border-border rounded-md">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-r-none"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-l-none"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Contact</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Department</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedMembers.map((member, index) => (
                                        <tr key={member.id || index} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">{member.first_name} {member.last_name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGenderColor(member.gender)}`}>
                                                                {member.gender}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                                    </div>
                                                    {member.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">{member.phone}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {getDepartmentName(member.department)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMaritalStatusColor(member.marital_status)}`}>
                                                        {member.marital_status}
                                                    </span>
                                                    {member.occupation && (
                                                        <p className="text-xs text-muted-foreground">{member.occupation}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewMember(member)}
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                        title="View details"
                                                    >
                                                        <User className="w-4 h-4 text-primary" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditMember(member)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit member"
                                                    >
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                disabled={isDeleting}
                                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Delete member"
                                                            >
                                                                {isDeleting ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                                ) : (
                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                )}
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Member</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{member.first_name} {member.last_name}"? This action cannot be undone and will permanently remove the member from the system.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            {isDeleting && (
                                                                <div className="py-4">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                        <p className="text-sm font-medium">Deleting member...</p>
                                                                    </div>
                                                                    <Progress value={75} className="w-full" />
                                                                    <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the member from the system.</p>
                                                                </div>
                                                            )}
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteMember(member.id!)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                    disabled={isDeleting}
                                                                >
                                                                    {isDeleting ? (
                                                                        <>
                                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                            Deleting...
                                                                        </>
                                                                    ) : (
                                                                        "Delete Member"
                                                                    )}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredAndSortedMembers.map((member, index) => (
                                <Card key={member.id || index} className="p-4 glass-card border-2 border-primary/20">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-foreground truncate">{member.first_name} {member.last_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGenderColor(member.gender)}`}>
                                                            {member.gender}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getMaritalStatusColor(member.marital_status)}`}>
                                                            {member.marital_status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleViewMember(member)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <User className="w-4 h-4 text-primary" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditMember(member)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit member"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            disabled={isDeleting}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete member"
                                                        >
                                                            {isDeleting ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Member</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{member.first_name} {member.last_name}"? This action cannot be undone and will permanently remove the member from the system.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        {isDeleting && (
                                                            <div className="py-4">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                    <p className="text-sm font-medium">Deleting member...</p>
                                                                </div>
                                                                <Progress value={75} className="w-full" />
                                                                <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the member from the system.</p>
                                                            </div>
                                                        )}
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteMember(member.id!)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        Deleting...
                                                                    </>
                                                                ) : (
                                                                    "Delete Member"
                                                                )}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                            {member.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">{member.phone}</p>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">{getDepartmentName(member.department)}</p>
                                            </div>
                                            {member.occupation && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">{member.occupation}</p>
                                                </div>
                                            )}
                                        </div>

                                        {member.address && (
                                            <div className="pt-2 border-t border-border">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                    <p className="text-sm text-muted-foreground">{member.address}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground">
                                                Joined: {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Member Details Dialog */}
                        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                            <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-lg md:text-xl flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        Member Details
                                    </DialogTitle>
                                </DialogHeader>

                                {selectedMember && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <User className="w-8 h-8 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-foreground">{selectedMember.first_name} {selectedMember.last_name}</h3>
                                            <p className="text-muted-foreground">{selectedMember.email}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-primary flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        Email
                                                    </Label>
                                                    <p className="text-base text-foreground">{selectedMember.email}</p>
                                                </div>

                                                {selectedMember.phone && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-primary flex items-center gap-2">
                                                            <Phone className="w-4 h-4" />
                                                            Phone
                                                        </Label>
                                                        <p className="text-base text-foreground">{selectedMember.phone}</p>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-primary flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        Department
                                                    </Label>
                                                    <p className="text-base text-foreground">{getDepartmentName(selectedMember.department)}</p>
                                                </div>

                                                {selectedMember.occupation && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-primary flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            Occupation
                                                        </Label>
                                                        <p className="text-base text-foreground">{selectedMember.occupation}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-primary">Gender</Label>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGenderColor(selectedMember.gender)}`}>
                                                        {selectedMember.gender}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-primary">Marital Status</Label>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMaritalStatusColor(selectedMember.marital_status)}`}>
                                                        {selectedMember.marital_status}
                                                    </span>
                                                </div>

                                                {selectedMember.date_of_birth && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-primary">Date of Birth</Label>
                                                        <p className="text-base text-foreground">
                                                            {new Date(selectedMember.date_of_birth).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-primary">Member Since</Label>
                                                    <p className="text-base text-foreground">
                                                        {new Date(selectedMember.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedMember.address && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-primary flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    Address
                                                </Label>
                                                <p className="text-base text-foreground leading-relaxed">{selectedMember.address}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Edit Member Dialog */}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="w-[95vw] max-w-[600px] mx-auto p-4 sm:p-6 md:max-h-[85vh] lg:max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl flex items-center gap-3">
                                        <User className="w-6 h-6 text-blue-600" />
                                        Edit Member
                                    </DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-first_name" className="text-base font-semibold">First Name *</Label>
                                            <Input
                                                id="edit-first_name"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                placeholder="Enter first name"
                                                className="text-base"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-last_name" className="text-base font-semibold">Last Name *</Label>
                                            <Input
                                                id="edit-last_name"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                placeholder="Enter last name"
                                                className="text-base"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-email" className="text-base font-semibold">Email *</Label>
                                            <Input
                                                id="edit-email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="member@email.com"
                                                className="text-base"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-phone" className="text-base font-semibold">Phone</Label>
                                            <Input
                                                id="edit-phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1234567890"
                                                className="text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-department" className="text-base font-semibold">Department</Label>
                                            <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(departments || []).map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            {dept.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-date_of_birth" className="text-base font-semibold">Date of Birth</Label>
                                            <Input
                                                id="edit-date_of_birth"
                                                type="date"
                                                value={formData.date_of_birth}
                                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                                className="text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-base font-semibold">Marital Status</Label>
                                            <Select value={formData.marital_status} onValueChange={(value: 'single' | 'married' | 'divorced' | 'widowed') => setFormData({ ...formData, marital_status: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single">Single</SelectItem>
                                                    <SelectItem value="married">Married</SelectItem>
                                                    <SelectItem value="divorced">Divorced</SelectItem>
                                                    <SelectItem value="widowed">Widowed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base font-semibold">Gender</Label>
                                            <Select value={formData.gender} onValueChange={(value: 'male' | 'female' | 'other') => setFormData({ ...formData, gender: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-occupation" className="text-base font-semibold">Occupation</Label>
                                            <Input
                                                id="edit-occupation"
                                                value={formData.occupation}
                                                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                                placeholder="Job title"
                                                className="text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-address" className="text-base font-semibold">Address</Label>
                                        <Textarea
                                            id="edit-address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Full address..."
                                            className="text-base min-h-[60px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-password" className="text-base font-semibold">New Password (optional)</Label>
                                        <Input
                                            id="edit-password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Leave empty to keep current password"
                                            className="text-base"
                                        />
                                        <p className="text-xs text-muted-foreground">Only enter a password if you want to change it</p>
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <div className="flex flex-col-reverse xs:flex-row xs:justify-end gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditDialogOpen(false)}
                                                className="w-full xs:w-auto h-11 text-base font-medium"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full xs:w-auto h-11 text-base font-semibold"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit className="w-5 h-5 mr-2" />
                                                        Update Member
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </Card>
        </div>
    )
}
