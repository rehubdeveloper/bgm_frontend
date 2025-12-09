"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Plus, Eye, Trash2, Loader2 } from "lucide-react"

interface Department {
    id: number;
    name: string;
    description: string;
    leader: string;
    members?: number;
    created?: string;
}

export default function DepartmentsManagement() {
    const [departments_list, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        leader: "",
    })

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('No access token found')
                return
            }

            const response = await fetch('/api/departments/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                // Handle both array response and object with results property
                const departments = Array.isArray(data) ? data : (data.results || [])
                setDepartments(departments)
            } else {
                console.error('Failed to fetch departments')
            }
        } catch (error) {
            console.error('Error fetching departments:', error)
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

            const response = await fetch('/api/departments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    leader: formData.leader ? parseInt(formData.leader) : null,
                }),
            })

            if (response.ok) {
                const newDepartment = await response.json()
                setDepartments([...departments_list, {
                    id: newDepartment.id || departments_list.length + 1,
                    name: formData.name,
                    description: formData.description,
                    leader: formData.leader ? `Leader ID: ${formData.leader}` : 'No leader assigned',
                    members: 0,
                    created: new Date().toISOString().split('T')[0],
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
                                <Label htmlFor="leader" className="text-sm md:text-base">Leader ID (Optional)</Label>
                                <Input
                                    id="leader"
                                    type="number"
                                    value={formData.leader}
                                    onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                                    placeholder="Enter leader ID (optional)"
                                    className="text-sm md:text-base"
                                />
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Total Departments</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">{departments_list.length}</p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Active Leaders</p>
                    <p className="text-3xl font-display font-bold text-primary mt-2">{departments_list.length}</p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Total Members</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">
                        {departments_list.reduce((sum, dept) => sum + (dept.members || 0), 0)}
                    </p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">New This Month</p>
                    <p className="text-3xl font-display font-bold text-accent mt-2">2</p>
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
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Members</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Created</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments_list.map((department) => (
                                <tr key={department.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-4 text-sm text-foreground font-medium">{department.name}</td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground max-w-xs truncate">{department.description}</td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">{department.leader}</td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">{department.members}</td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground">{department.created}</td>
                                    <td className="px-4 py-4 flex items-center justify-center gap-2">
                                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Eye className="w-4 h-4 text-primary" />
                                        </button>
                                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </button>
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
                                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Eye className="w-4 h-4 text-primary" />
                                        </button>
                                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Leader</p>
                                        <p className="text-foreground font-medium truncate">{department.leader}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Members</p>
                                        <p className="text-foreground font-medium">{department.members}</p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border">
                                    <p className="text-xs text-muted-foreground">Created: {department.created}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>
        </div>
    )
}
