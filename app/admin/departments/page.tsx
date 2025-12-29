"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { Plus, Eye, Trash2, Loader2, Edit } from "lucide-react"

interface Department {
    id: number;
    name: string;
    description: string;
    leader: number | null; // Changed from string to number | null to match API
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

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

export default function DepartmentsManagement() {
    const [departments_list, setDepartments] = useState<Department[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        leader: "",
    })
    const [editFormData, setEditFormData] = useState({
        name: "",
        description: "",
        leader: "",
    })

    useEffect(() => {
        fetchDepartments()
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('❌ No access token found')
                return
            }

            const apiUrl = '/api/contents/members/'

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })


            if (response.ok) {
                const data = await response.json()

                // Check if data is the array or if it's inside a 'results' property
                const membersArray = Array.isArray(data) ? data : (data.results || [])
                setMembers(membersArray)
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }
                const errorData = await response.json()
                console.error('❌ Members fetch failed:', errorData)
            }
        } catch (error) {
            console.error('💥 Error fetching members:', error)
        }
    }

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('❌ No access token found')
                window.location.href = '/login'
                return
            }

            const apiUrl = '/api/admin/departments/'

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                // Extract departments from results array (API returns paginated data)
                const departments = data.results || []
                setDepartments(departments)
            } else {
                if (response.status === 401) {
                    console.error('❌ Token expired or invalid, redirecting to login')
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }
                console.error('❌ Failed to fetch departments:', response.status, response.statusText)
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                console.error('❌ Error details:', errorData)
            }
        } catch (error) {
            console.error('💥 Error fetching departments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('No access token found')
                return
            }

            // Validate required fields
            if (!formData.name.trim()) {
                console.error('Department name is required')
                setIsSubmitting(false)
                return
            }

            if (!formData.description.trim()) {
                console.error('Department description is required')
                setIsSubmitting(false)
                return
            }

            const response = await fetch('/api/admin/departments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    leader: formData.leader && formData.leader !== "none" ? parseInt(formData.leader) : null,
                }),
            })

            if (response.ok) {
                const newDepartment = await response.json()
                setDepartments([...departments_list, {
                    id: newDepartment.id || departments_list.length + 1,
                    name: newDepartment.name || formData.name,
                    description: newDepartment.description || formData.description,
                    leader: newDepartment.leader,
                    is_active: newDepartment.is_active ?? true,
                    created_at: newDepartment.created_at || new Date().toISOString(),
                    updated_at: newDepartment.updated_at || new Date().toISOString(),
                }])
                setFormData({ name: "", description: "", leader: "" })
                setIsDialogOpen(false)
            } else {
                console.error('Failed to create department')
            }
        } catch (error) {
            console.error('Error creating department:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (department: Department) => {

        setEditingDepartment(department)
        setEditFormData({
            name: department.name,
            description: department.description,
            leader: department.leader ? department.leader.toString() : "none",
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingDepartment) {
            console.error('❌ No editing department set')
            return
        }


        setIsSubmitting(true)

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('No access token found')
                return
            }

            // Validate required fields
            if (!editFormData.name.trim()) {
                console.error('Department name is required')
                setIsSubmitting(false)
                return
            }

            if (!editFormData.description.trim()) {
                console.error('Department description is required')
                setIsSubmitting(false)
                return
            }

            // Check what fields actually changed
            const changes: any = {}

            if (editFormData.name.trim() !== editingDepartment.name) {
                changes.name = editFormData.name.trim()
            }

            if (editFormData.description.trim() !== editingDepartment.description) {
                changes.description = editFormData.description.trim()
            }

            // Always include leader field if it changed
            const newLeader = editFormData.leader && editFormData.leader !== "none" ? parseInt(editFormData.leader) : null
            if (newLeader !== editingDepartment.leader) {
                changes.leader = newLeader
            }

            // If no changes, don't send request
            if (Object.keys(changes).length === 0) {
                setIsEditDialogOpen(false)
                setEditingDepartment(null)
                return
            }


            const response = await fetch(`/api/admin/departments/${editingDepartment.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(changes),
            })

            if (response.ok) {
                const updatedDepartment = await response.json()
                setDepartments(departments_list.map(dept =>
                    dept.id === editingDepartment.id
                        ? {
                            ...dept,
                            name: updatedDepartment.name || editFormData.name,
                            description: updatedDepartment.description || editFormData.description,
                            leader: updatedDepartment.leader,
                            updated_at: updatedDepartment.updated_at || new Date().toISOString(),
                        }
                        : dept
                ))
                setIsEditDialogOpen(false)
                setEditingDepartment(null)
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                console.error('Failed to update department:', errorData)
                console.error('Response status:', response.status)
                console.error('Response status text:', response.statusText)
            }
        } catch (error) {
            console.error('Error updating department:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteDepartment = async (departmentId: number) => {

        try {
            setIsDeleting(true)

            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('No access token found')
                return
            }


            const response = await fetch(`/api/admin/departments/${departmentId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })


            if (response.ok) {
                // Remove the department from the local state
                setDepartments(departments_list.filter(department => department.id !== departmentId))
            } else {
                console.error('❌ Delete request failed with status:', response.status, response.statusText)

                if (response.status === 401) {
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }

                // For non-OK responses, try to parse error JSON, but handle cases where there's no body
                try {
                    const errorData = await response.json()
                    console.error('❌ Failed to delete department - error details:', errorData)
                    console.error('❌ Error keys:', Object.keys(errorData))
                } catch (parseError) {
                    console.error('❌ Failed to parse error response as JSON:', parseError)
                    console.error('❌ Raw response status:', response.status, response.statusText)
                }
            }
        } catch (error) {
            console.error('💥 Error deleting department:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const getMemberName = (memberId: number) => {
        const member = members.find(mem => mem.id === memberId)
        return member ? `${member.first_name} ${member.last_name}` : `Member ${memberId}`
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground">Departments</h1>
                    <p className="text-muted-foreground text-sm md:text-base">Manage church departments and their leadership</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary flex items-center gap-2 w-full sm:w-auto">
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Create Department</span>
                            <span className="sm:hidden">Create</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] mx-4">
                        <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">Create New Department</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm md:text-base">Department Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter department name"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter department description"
                                    required
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leader" className="text-sm md:text-base">Leader (Optional)</Label>
                                <Select value={formData.leader} onValueChange={(value) => setFormData({ ...formData, leader: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a leader (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No leader</SelectItem>
                                        {members.map((member) => (
                                            <SelectItem key={member.id} value={member.id.toString()}>
                                                {member.first_name} {member.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Department'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Department Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] mx-4">
                        <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">Edit Department</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-sm md:text-base">Department Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    placeholder="Enter department name"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description" className="text-sm md:text-base">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    placeholder="Enter department description"
                                    required
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-leader" className="text-sm md:text-base">Leader (Optional)</Label>
                                <Select value={editFormData.leader} onValueChange={(value) => setEditFormData({ ...editFormData, leader: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a leader (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No leader</SelectItem>
                                        {members.map((member) => (
                                            <SelectItem key={member.id} value={member.id.toString()}>
                                                {member.first_name} {member.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Department'
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
                    <p className="text-muted-foreground text-sm">Total Departments</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">{departments_list.length}</p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Active Leaders</p>
                    <p className="text-3xl font-display font-bold text-primary mt-2">
                        {Array.from(new Set(departments_list.filter(dept => dept.leader !== null && dept.leader !== 0).map(dept => dept.leader))).length}
                    </p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Total Members</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">
                        0
                    </p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">New This Month</p>
                    <p className="text-3xl font-display font-bold text-accent mt-2">
                        {departments_list.filter(department => {
                            const departmentDate = new Date(department.created_at)
                            const now = new Date()
                            return departmentDate.getMonth() === now.getMonth() &&
                                departmentDate.getFullYear() === now.getFullYear()
                        }).length}
                    </p>
                </Card>
            </div>

            {/* Departments List - Responsive */}
            <Card className="p-4 md:p-6 glass-card border-2 border-primary/20">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Leader</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Created</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments_list.map((department) => (
                                <tr key={department.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-4 text-sm text-foreground font-medium">{department.name}</td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground max-w-xs truncate">{department.description}</td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">
                                        {department.leader ? getMemberName(department.leader) : 'No leader assigned'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${department.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                            {department.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">
                                        {new Date(department.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(department)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-primary" />
                                        </button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    disabled={isDeleting}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete department"
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
                                                    <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{department.name}"? This action cannot be undone and will permanently remove the department from the system.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                {isDeleting && (
                                                    <div className="py-4">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                            <p className="text-sm font-medium">Deleting department...</p>
                                                        </div>
                                                        <Progress value={75} className="w-full" />
                                                        <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the department from the system.</p>
                                                    </div>
                                                )}
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteDepartment(department.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Deleting...
                                                            </>
                                                        ) : (
                                                            "Delete Department"
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {departments_list.map((department) => (
                        <Card key={department.id} className="p-4 glass-card border-2 border-primary/20">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-foreground truncate">{department.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 overflow-hidden" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: '1.4em',
                                            maxHeight: '2.8em'
                                        }}>{department.description}</p>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            onClick={() => handleEdit(department)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-primary" />
                                        </button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    disabled={isDeleting}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete department"
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
                                                    <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{department.name}"? This action cannot be undone and will permanently remove the department from the system.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                {isDeleting && (
                                                    <div className="py-4">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                            <p className="text-sm font-medium">Deleting department...</p>
                                                        </div>
                                                        <Progress value={75} className="w-full" />
                                                        <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the department from the system.</p>
                                                    </div>
                                                )}
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteDepartment(department.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Deleting...
                                                            </>
                                                        ) : (
                                                            "Delete Department"
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Leader</p>
                                        <p className="text-foreground font-medium truncate">
                                            {department.leader ? getMemberName(department.leader) : 'No leader assigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Status</p>
                                        <p className="text-foreground font-medium">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${department.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {department.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border">
                                    <p className="text-xs text-muted-foreground">Created: {new Date(department.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>
        </div>
    )
}
