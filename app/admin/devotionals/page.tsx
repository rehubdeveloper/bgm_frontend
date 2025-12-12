"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react"
import { Plus, BookOpen, Loader2, CheckCircle, AlertCircle, Edit, Trash2 } from "lucide-react"

interface Devotional {
    id?: number;
    title: string;
    bible_verse: string;
    reflection: string;
    prayer: string;
    application_tip: string;
    closing_thought: string;
    created_at?: string;
    updated_at?: string;
}

export default function DevotionalsManagement() {
    const [devotionals, setDevotionals] = useState<Devotional[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null)
    const [editingDevotional, setEditingDevotional] = useState<Devotional | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [submitSuccess, setSubmitSuccess] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        bible_verse: "",
        reflection: "",
        prayer: "",
        application_tip: "",
        closing_thought: "",
    })

    useEffect(() => {
        fetchDevotionals()
    }, [])

    const fetchDevotionals = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('No access token found')
                return
            }

            const response = await fetch('/api/contents/devotionals/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                // Handle response with results property (pagination format)
                const devotionalsList = data.results || []
                setDevotionals(devotionalsList)
            } else {
                console.error('Failed to fetch devotionals')
            }
        } catch (error) {
            console.error('Error fetching devotionals:', error)
        } finally {
            setLoading(false)
        }
    }

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

            const response = await fetch('/api/contents/devotionals/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                const newDevotional = await response.json()
                setDevotionals([...devotionals, newDevotional])
                setFormData({
                    title: "",
                    bible_verse: "",
                    reflection: "",
                    prayer: "",
                    application_tip: "",
                    closing_thought: "",
                })
                setIsDialogOpen(false)
                setSubmitSuccess("Daily devotional created successfully!")
                // Clear success message after 3 seconds
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to create devotional (${response.status})`)
            }
        } catch (error) {
            console.error('Error creating devotional:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            bible_verse: "",
            reflection: "",
            prayer: "",
            application_tip: "",
            closing_thought: "",
        })
        setSubmitError("")
        setSubmitSuccess("")
        setIsDialogOpen(false)
    }

    const handleViewDevotional = (devotional: Devotional) => {
        setSelectedDevotional(devotional)
        setIsViewDialogOpen(true)
    }

    const handleEditDevotional = (devotional: Devotional) => {
        setEditingDevotional(devotional)
        setFormData({
            title: devotional.title,
            bible_verse: devotional.bible_verse,
            reflection: devotional.reflection,
            prayer: devotional.prayer,
            application_tip: devotional.application_tip,
            closing_thought: devotional.closing_thought,
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdateDevotional = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingDevotional?.id) return

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

            const response = await fetch(`/api/contents/devotionals/${editingDevotional.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                const updatedDevotional = await response.json()
                setDevotionals(devotionals.map(d => d.id === editingDevotional.id ? updatedDevotional : d))
                setIsEditDialogOpen(false)
                setSubmitSuccess("Daily devotional updated successfully!")
                // Clear success message after 3 seconds
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to update devotional (${response.status})`)
            }
        } catch (error) {
            console.error('Error updating devotional:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteDevotional = async (devotional: Devotional) => {
        if (!devotional.id) return

        setIsDeleting(true)
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('No access token found')
                return
            }

            const response = await fetch(`/api/contents/devotionals/${devotional.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setDevotionals(devotionals.filter(d => d.id !== devotional.id))
                setSubmitSuccess("Daily devotional deleted successfully!")
                // Clear success message after 3 seconds
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to delete devotional (${response.status})`)
            }
        } catch (error) {
            console.error('Error deleting devotional:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    const resetEditForm = () => {
        setEditingDevotional(null)
        setFormData({
            title: "",
            bible_verse: "",
            reflection: "",
            prayer: "",
            application_tip: "",
            closing_thought: "",
        })
        setSubmitError("")
        setIsEditDialogOpen(false)
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground">Daily Devotionals</h1>
                    <p className="text-muted-foreground text-sm md:text-base">Create and manage daily spiritual devotionals for the congregation</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary flex items-center gap-2 w-full sm:w-auto">
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Create Devotional</span>
                            <span className="sm:hidden">Create</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">Create New Daily Devotional</DialogTitle>
                        </DialogHeader>

                        {submitError && (
                            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-sm">{submitError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm md:text-base font-medium">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter devotional title"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bible_verse" className="text-sm md:text-base font-medium">Bible Verse</Label>
                                <Input
                                    id="bible_verse"
                                    value={formData.bible_verse}
                                    onChange={(e) => setFormData({ ...formData, bible_verse: e.target.value })}
                                    placeholder="e.g., Hebrews 11:1"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reflection" className="text-sm md:text-base font-medium">Reflection</Label>
                                <Textarea
                                    id="reflection"
                                    value={formData.reflection}
                                    onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                                    placeholder="Write the main reflection content..."
                                    required
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prayer" className="text-sm md:text-base font-medium">Prayer</Label>
                                <Textarea
                                    id="prayer"
                                    value={formData.prayer}
                                    onChange={(e) => setFormData({ ...formData, prayer: e.target.value })}
                                    placeholder="Write the closing prayer..."
                                    required
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="application_tip" className="text-sm md:text-base font-medium">Application Tip</Label>
                                <Textarea
                                    id="application_tip"
                                    value={formData.application_tip}
                                    onChange={(e) => setFormData({ ...formData, application_tip: e.target.value })}
                                    placeholder="How can readers apply this to their daily life?"
                                    required
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="closing_thought" className="text-sm md:text-base font-medium">Closing Thought</Label>
                                <Textarea
                                    id="closing_thought"
                                    value={formData.closing_thought}
                                    onChange={(e) => setFormData({ ...formData, closing_thought: e.target.value })}
                                    placeholder="Final encouraging words..."
                                    required
                                    className="text-sm md:text-base min-h-[60px] md:min-h-[80px]"
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
                                            <BookOpen className="w-4 h-4 mr-2 cursor-pointer" />
                                            Create Devotional
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Devotional Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">{editingDevotional?.title ? `Edit "${editingDevotional.title}"` : 'Edit Devotional'}</DialogTitle>
                        </DialogHeader>

                        {submitError && (
                            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-sm">{submitError}</p>
                            </div>
                        )}

                        <form onSubmit={handleUpdateDevotional} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title" className="text-sm md:text-base font-medium">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter devotional title"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-bible_verse" className="text-sm md:text-base font-medium">Bible Verse</Label>
                                <Input
                                    id="edit-bible_verse"
                                    value={formData.bible_verse}
                                    onChange={(e) => setFormData({ ...formData, bible_verse: e.target.value })}
                                    placeholder="e.g., Hebrews 11:1"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-reflection" className="text-sm md:text-base font-medium">Reflection</Label>
                                <Textarea
                                    id="edit-reflection"
                                    value={formData.reflection}
                                    onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                                    placeholder="Write the main reflection content..."
                                    required
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-prayer" className="text-sm md:text-base font-medium">Prayer</Label>
                                <Textarea
                                    id="edit-prayer"
                                    value={formData.prayer}
                                    onChange={(e) => setFormData({ ...formData, prayer: e.target.value })}
                                    placeholder="Write the closing prayer..."
                                    required
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-application_tip" className="text-sm md:text-base font-medium">Application Tip</Label>
                                <Textarea
                                    id="edit-application_tip"
                                    value={formData.application_tip}
                                    onChange={(e) => setFormData({ ...formData, application_tip: e.target.value })}
                                    placeholder="How can readers apply this to their daily life?"
                                    required
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-closing_thought" className="text-sm md:text-base font-medium">Closing Thought</Label>
                                <Textarea
                                    id="edit-closing_thought"
                                    value={formData.closing_thought}
                                    onChange={(e) => setFormData({ ...formData, closing_thought: e.target.value })}
                                    placeholder="Final encouraging words..."
                                    required
                                    className="text-sm md:text-base min-h-[60px] md:min-h-[80px]"
                                />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={resetEditForm} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4 mr-2 cursor-pointer" />
                                            Update Devotional
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* View Devotional Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-w-[95vw] mx-4 max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg md:text-xl lg:text-2xl flex items-start gap-3 break-words pr-8">
                            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0 mt-1" />
                            <span className="leading-tight">{selectedDevotional?.title}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDevotional && (
                        <div className="space-y-4 md:space-y-6 mt-4">
                            {/* Bible Verse */}
                            <div className="bg-primary/5 border-l-4 border-primary p-3 md:p-4 rounded-r-lg">
                                <h3 className="font-semibold text-primary mb-2 text-base md:text-lg">Bible Verse</h3>
                                <p className="text-foreground text-base md:text-lg italic leading-relaxed break-words">"{selectedDevotional.bible_verse}"</p>
                            </div>

                            {/* Reflection */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                                    📖 Reflection
                                </h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {selectedDevotional.reflection}
                                </p>
                            </div>

                            {/* Prayer */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                                    🙏 Prayer
                                </h3>
                                <div className="bg-muted/30 p-4 rounded-lg italic text-muted-foreground whitespace-pre-wrap">
                                    {selectedDevotional.prayer}
                                </div>
                            </div>

                            {/* Application Tip */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                                    💡 Application Tip
                                </h3>
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                                    <p className="text-foreground whitespace-pre-wrap">
                                        {selectedDevotional.application_tip}
                                    </p>
                                </div>
                            </div>

                            {/* Closing Thought */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                                    ✨ Closing Thought
                                </h3>
                                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
                                    <p className="text-foreground font-medium whitespace-pre-wrap">
                                        {selectedDevotional.closing_thought}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="pt-4 border-t border-border">
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-muted-foreground">
                                    <div>
                                        <strong>Created:</strong> {selectedDevotional.created_at ? new Date(selectedDevotional.created_at).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </div>
                                    {selectedDevotional.updated_at && selectedDevotional.updated_at !== selectedDevotional.created_at && (
                                        <div>
                                            <strong>Last Updated:</strong> {new Date(selectedDevotional.updated_at).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setIsViewDialogOpen(false)} className="w-full sm:w-auto">
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Total Devotionals</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">{devotionals.length}</p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">This Week</p>
                    <p className="text-3xl font-display font-bold text-primary mt-2">
                        {devotionals.filter(devotional => {
                            const devotionalDate = new Date(devotional.created_at || 0)
                            const weekAgo = new Date()
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            return devotionalDate >= weekAgo
                        }).length}
                    </p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">This Month</p>
                    <p className="text-3xl font-display font-bold text-accent mt-2">
                        {devotionals.filter(devotional => {
                            const devotionalDate = new Date(devotional.created_at || 0)
                            const monthAgo = new Date()
                            monthAgo.setMonth(monthAgo.getMonth() - 1)
                            return devotionalDate >= monthAgo
                        }).length}
                    </p>
                </Card>
            </div>

            {/* Devotionals List - Responsive */}
            <Card className="p-4 md:p-6 glass-card border-2 border-primary/20">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading devotionals...</span>
                    </div>
                ) : devotionals.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No devotionals yet</h3>
                        <p className="text-muted-foreground">Create your first daily devotional to inspire the congregation.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Bible Verse</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Created</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devotionals.map((devotional, index) => (
                                        <tr key={devotional.id || index} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">{devotional.title}</p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-xs">{devotional.reflection.substring(0, 60)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {devotional.bible_verse}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {devotional.created_at ? new Date(devotional.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewDevotional(devotional)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                    title="View devotional"
                                                >
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditDevotional(devotional)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                    title="Edit devotional"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                            title="Delete devotional"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Devotional</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "<strong>{devotional.title}</strong>"?
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteDevotional(devotional)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
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
                            {devotionals.map((devotional, index) => (
                                <Card key={devotional.id || index} className="p-4 glass-card border-2 border-primary/20">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <BookOpen className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-foreground truncate">{devotional.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{devotional.bible_verse}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleViewDevotional(devotional)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                    title="View devotional"
                                                >
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditDevotional(devotional)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                    title="Edit devotional"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                            title="Delete devotional"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Devotional</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "<strong>{devotional.title}</strong>"?
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteDevotional(devotional)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                <strong>Reflection:</strong> {devotional.reflection.substring(0, 100)}...
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                <strong>Prayer:</strong> {devotional.prayer.substring(0, 80)}...
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground">
                                                Created: {devotional.created_at ? new Date(devotional.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}
