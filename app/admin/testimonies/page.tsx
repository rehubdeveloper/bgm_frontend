"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, Plus, CheckCircle, Clock, Eye, Loader2, AlertCircle, Image, Video, FileText, Check, X, Upload } from "lucide-react"
import { useState, useEffect } from "react"

interface Testimony {
  id: number;
  text: string;
  member_name: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  images: string; // API returns string, not array
  videos: string; // API returns string, not array
  created_at: string;
}

export default function TestimoniesManagement() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [selectedTestimony, setSelectedTestimony] = useState<Testimony | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    text: "",
    image: null as File | null,
    video: null as File | null,
    status: "pending"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [loadingActions, setLoadingActions] = useState<Set<number>>(new Set())
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    console.log('🗣️ Testimonies admin component mounted, fetching testimonies...')
    fetchTestimonies()
  }, [])

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => {
        setSubmitError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [submitError])

  const fetchTestimonies = async () => {
    console.log('🚀 Starting testimonies fetch...')
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.error('❌ No access token found')
        return
      }
      console.log('✅ Access token found')

      const apiUrl = '/api/contents/testimonies/'
      console.log('🌐 Fetching testimonies from:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('📊 Testimonies fetch response status:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Testimonies fetched successfully:', data.length, 'testimonies')
        setTestimonies(data)
      } else {
        if (response.status === 401) {
          console.log('🔐 Token expired, redirecting to login')
          localStorage.removeItem('access_token')
          window.location.href = '/login'
          return
        }
        const errorData = await response.json()
        console.error('❌ Testimonies fetch failed:', errorData)
        setSubmitError(errorData.error || `Failed to fetch testimonies (${response.status})`)
      }
    } catch (error) {
      console.error('💥 Error fetching testimonies:', error)
      setSubmitError('Network error occurred')
    } finally {
      console.log('🏁 Testimonies fetch completed')
      setLoading(false)
    }
  }

  const getTestimonyType = (testimony: Testimony) => {
    if ((testimony.videos?.length || 0) > 0) return "video"
    if ((testimony.images?.length || 0) > 0) return "image"
    return "text"
  }

  const getTestimonyTypeIcon = (testimony: Testimony) => {
    const type = getTestimonyType(testimony)
    if (type === "video") return <Video className="w-4 h-4 text-blue-500" />
    if (type === "image") return <Image className="w-4 h-4 text-green-500" />
    return <FileText className="w-4 h-4 text-purple-500" />
  }

  const handleViewTestimony = (testimony: Testimony) => {
    setSelectedTestimony(testimony)
    setIsViewDialogOpen(true)
  }

  const handleEditTestimony = (testimony: Testimony) => {
    setSelectedTestimony(testimony)
    setEditFormData({
      text: testimony.text,
      image: null,
      video: null,
      status: testimony.status
    })
    setIsEditDialogOpen(true)
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0] || null
    setEditFormData({ ...editFormData, [type]: file })
    // Clear the other file type when one is selected
    if (type === 'image' && file) {
      setEditFormData(prev => ({ ...prev, video: null }))
    } else if (type === 'video' && file) {
      setEditFormData(prev => ({ ...prev, image: null }))
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTestimony) return

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setSubmitError('Authentication required')
        return
      }

      const updateFormData = new FormData()
      updateFormData.append('text', editFormData.text)
      updateFormData.append('status', editFormData.status)
      if (editFormData.image) updateFormData.append('images', editFormData.image)
      if (editFormData.video) updateFormData.append('videos', editFormData.video)

      const response = await fetch(`/api/admin-panel/testimonies/${selectedTestimony.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: updateFormData,
      })

      if (response.ok) {
        const updatedTestimony = await response.json()
        console.log('✅ Testimony updated successfully:', updatedTestimony)

        // Update local state
        setTestimonies(prevTestimonies =>
          prevTestimonies.map(testimony =>
            testimony.id === selectedTestimony.id
              ? { ...testimony, text: editFormData.text, status: editFormData.status as "pending" | "approved" | "rejected" }
              : testimony
          )
        )

        setSubmitSuccess("Testimony updated successfully!")
        setTimeout(() => setSubmitSuccess(""), 3000)
        setIsEditDialogOpen(false)
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.error || `Failed to update testimony (${response.status})`)
      }
    } catch (error) {
      console.error('Error updating testimony:', error)
      setSubmitError('Network error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMediaUrl = (mediaPath: string) => {
    // If it's already a full URL, return as is
    if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
      return mediaPath
    }
    // Otherwise, prepend the API base URL for media
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:8000'
    return `${apiBaseUrl}${mediaPath}`
  }

  const moderateTestimony = async (testimonyId: number, action: "approve" | "reject", reason?: string) => {
    console.log(`⚖️ Moderating testimony ${testimonyId} with action: ${action}`)
    try {
      // Add loading state for specific testimony
      setLoadingActions(prev => new Set(prev).add(testimonyId))

      const token = localStorage.getItem('access_token')
      if (!token) {
        setSubmitError('Authentication required')
        return
      }

      const requestBody: any = { action }
      if (action === 'reject' && reason) {
        requestBody.reason = reason
      }

      const response = await fetch(`/api/contents/testimonies/${testimonyId}/moderate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result = await response.json()

        // Update the testimony status in the local state
        setTestimonies(prevTestimonies =>
          prevTestimonies.map(testimony =>
            testimony.id === testimonyId
              ? {
                ...testimony,
                status: action === 'approve' ? 'approved' : 'rejected' as const,
                rejection_reason: action === 'reject' ? reason : testimony.rejection_reason
              }
              : testimony
          )
        )

        setSubmitSuccess(`Testimony ${action}d successfully!`)
        setRejectReason("") // Clear the reason
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.error || `Failed to ${action} testimony`)
      }
    } catch (error) {
      console.error(`Error moderating testimony:`, error)
      setSubmitError(`Failed to ${action} testimony`)
    } finally {
      // Remove loading state for specific testimony
      setLoadingActions(prev => {
        const updated = new Set(prev)
        updated.delete(testimonyId)
        return updated
      })
    }
  }

  const handleDeleteTestimony = async (testimonyId: number) => {
    try {
      setIsSubmitting(true)
      setSubmitError("")

      const token = localStorage.getItem('access_token')
      if (!token) {
        setSubmitError('Authentication required')
        return
      }

      const response = await fetch(`/api/admin-panel/testimonies/${testimonyId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove the testimony from the local state
        setTestimonies(testimonies.filter(testimony => testimony.id !== testimonyId))
        setSubmitSuccess("Testimony deleted successfully!")
        setTimeout(() => setSubmitSuccess(""), 3000)
      } else {
        if (response.status === 401) {
          localStorage.removeItem('access_token')
          window.location.href = '/login'
          return
        }
        const errorData = await response.json()
        setSubmitError(errorData.error || `Failed to delete testimony (${response.status})`)
      }
    } catch (error) {
      console.error('Error deleting testimony:', error)
      setSubmitError('Network error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter testimonies based on active tab
  const getFilteredTestimonies = () => {
    switch (activeTab) {
      case "pending":
        return testimonies.filter(t => t.status === "pending")
      case "approved":
        return testimonies.filter(t => t.status === "approved")
      case "rejected":
        return testimonies.filter(t => t.status === "rejected")
      default:
        return testimonies
    }
  }

  const getPendingCount = () => testimonies.filter(t => t.status === "pending").length
  const getApprovedCount = () => testimonies.filter(t => t.status === "approved").length
  const getRejectedCount = () => testimonies.filter(t => t.status === "rejected").length

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">Testimonies</h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Review and manage member testimonies</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="btn-primary flex items-center gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Add Testimony</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Add New Testimony</DialogTitle>
            </DialogHeader>

            {submitError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{submitError}</p>
              </div>
            )}

            <TestimonyForm onError={setSubmitError} onSuccess={setSubmitSuccess} onSubmit={fetchTestimonies} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{submitSuccess}</p>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Total Testimonies</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">{testimonies.length}</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-orange-500/20">
          <p className="text-muted-foreground text-sm">Pending Review</p>
          <p className="text-3xl font-display font-bold text-orange-500 mt-2">{getPendingCount()}</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-green-500/20">
          <p className="text-muted-foreground text-sm">Approved</p>
          <p className="text-3xl font-display font-bold text-green-500 mt-2">{getApprovedCount()}</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-red-500/20">
          <p className="text-muted-foreground text-sm">Rejected</p>
          <p className="text-3xl font-display font-bold text-red-500 mt-2">{getRejectedCount()}</p>
        </Card>
      </div>

      {/* Testimonies Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All ({testimonies.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            Pending ({getPendingCount()})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Approved ({getApprovedCount()})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-500" />
            Rejected ({getRejectedCount()})
          </TabsTrigger>
        </TabsList>

        <Card className="p-6 glass-card border-2 border-primary/20">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading testimonies...</span>
            </div>
          ) : getFilteredTestimonies().length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {activeTab === "pending" ? "No pending testimonies" :
                  activeTab === "approved" ? "No approved testimonies" :
                    activeTab === "rejected" ? "No rejected testimonies" : "No testimonies yet"}
              </h3>
              <p className="text-muted-foreground">
                {activeTab === "pending" ? "All testimonies have been reviewed" :
                  activeTab === "approved" ? "No testimonies have been approved yet" :
                    activeTab === "rejected" ? "No testimonies have been rejected yet" :
                      "Member testimonies will appear here once submitted"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Member</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Content</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Submitted</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTestimonies().map((testimony, index) => (
                      <tr key={testimony.id || index} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {getTestimonyTypeIcon(testimony)}
                            <span className="font-medium text-foreground text-sm">{testimony.member_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${testimony.status === "approved" ? 'bg-green-100 text-green-800' :
                            testimony.status === "rejected" ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                            {testimony.status === "approved" ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </>
                            ) : testimony.status === "rejected" ? (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Rejected
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground capitalize">
                          {getTestimonyType(testimony)}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                            {testimony.text.substring(0, 80)}...
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {new Date(testimony.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewTestimony(testimony)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="View testimony"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </button>

                          <button
                            onClick={() => handleEditTestimony(testimony)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit testimony"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>

                          {testimony.status === "pending" ? (
                            <>
                              <button
                                onClick={() => moderateTestimony(testimony.id!, 'approve')}
                                disabled={loadingActions.has(testimony.id!)}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors relative"
                                title="Approve testimony"
                              >
                                {loadingActions.has(testimony.id!) ? (
                                  <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-600" />
                                )}
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    disabled={loadingActions.has(testimony.id!)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject testimony"
                                  >
                                    {loadingActions.has(testimony.id!) ? (
                                      <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                                    ) : (
                                      <X className="w-4 h-4 text-red-600" />
                                    )}
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="sm:max-w-[500px]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Testimony</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject this testimony from {testimony.member_name}?
                                      Please provide a reason for rejection.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="py-4">
                                    <Label htmlFor="reject-reason" className="text-sm font-medium">Rejection Reason *</Label>
                                    <Textarea
                                      id="reject-reason"
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      placeholder="Please provide a reason for rejecting this testimony..."
                                      className="mt-2 min-h-[80px]"
                                      required
                                    />
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setRejectReason("")}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        if (rejectReason.trim()) {
                                          moderateTestimony(testimony.id!, 'reject', rejectReason.trim())
                                        }
                                      }}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={!rejectReason.trim()}
                                    >
                                      Reject Testimony
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : null}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                disabled={isSubmitting}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete testimony"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Testimony</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{testimony.text.substring(0, 50)}..." from {testimony.member_name}?
                                  This action cannot be undone and will permanently remove the testimony from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTestimony(testimony.id!)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? "Deleting..." : "Delete Testimony"}
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
                {getFilteredTestimonies().map((testimony, index) => (
                  <Card key={testimony.id || index} className="p-4 glass-card border-2 border-primary/20">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-2">
                            {getTestimonyTypeIcon(testimony)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-foreground">{testimony.member_name}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{getTestimonyType(testimony)}</p>

                            <div className="mt-2">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${testimony.status === "approved" ? 'bg-green-100 text-green-800' :
                                testimony.status === "rejected" ? 'bg-red-100 text-red-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                {testimony.status === "approved" ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approved
                                  </>
                                ) : testimony.status === "rejected" ? (
                                  <>
                                    <X className="w-3 h-3 mr-1" />
                                    Rejected
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {testimony.text}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          {new Date(testimony.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewTestimony(testimony)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="View testimony"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </button>

                          <button
                            onClick={() => handleEditTestimony(testimony)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit testimony"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>

                          {testimony.status === "pending" ? (
                            <>
                              <button
                                onClick={() => moderateTestimony(testimony.id!, 'approve')}
                                disabled={isSubmitting}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve testimony"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    disabled={isSubmitting}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject testimony"
                                  >
                                    <X className="w-4 h-4 text-red-600" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="sm:max-w-[500px]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Testimony</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject this testimony from {testimony.member_name}?
                                      Please provide a reason for rejection.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="py-4">
                                    <Label htmlFor="reject-reason-mobile" className="text-sm font-medium">Rejection Reason *</Label>
                                    <Textarea
                                      id="reject-reason-mobile"
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      placeholder="Please provide a reason for rejecting this testimony..."
                                      className="mt-2 min-h-[80px]"
                                      required
                                    />
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setRejectReason("")}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        if (rejectReason.trim()) {
                                          moderateTestimony(testimony.id!, 'reject', rejectReason.trim())
                                        }
                                      }}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={!rejectReason.trim()}
                                    >
                                      Reject Testimony
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Testimony Details Dialog */}
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl flex items-center gap-3">
                      {selectedTestimony && getTestimonyTypeIcon(selectedTestimony)}
                      Testimony Details
                    </DialogTitle>
                  </DialogHeader>

                  {selectedTestimony && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-primary">Member Name</Label>
                        <p className="text-base md:text-lg font-semibold text-foreground">{selectedTestimony.member_name}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-primary">Status</Label>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${selectedTestimony.status === "approved" ? 'bg-green-100 text-green-800' :
                            selectedTestimony.status === "rejected" ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                            {selectedTestimony.status === "approved" ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approved
                              </>
                            ) : selectedTestimony.status === "rejected" ? (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Rejected
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 mr-2" />
                                Pending Review
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-primary">Type</Label>
                          <div className="flex items-center gap-2">
                            {getTestimonyTypeIcon(selectedTestimony)}
                            <span className="text-base text-foreground capitalize">{getTestimonyType(selectedTestimony)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-primary">Submitted Date</Label>
                        <p className="text-base text-foreground">
                          {new Date(selectedTestimony.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {((selectedTestimony.images && selectedTestimony.images.trim() !== '') || (selectedTestimony.videos && selectedTestimony.videos.trim() !== '')) && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-primary">Media</Label>
                          <div className="space-y-3">
                            {selectedTestimony.images && selectedTestimony.images.trim() !== '' && (
                              <img
                                src={getMediaUrl(selectedTestimony.images)}
                                alt="Testimony"
                                className="w-full max-w-md h-48 object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            )}
                            {selectedTestimony.videos && selectedTestimony.videos.trim() !== '' && (
                              <video
                                src={getMediaUrl(selectedTestimony.videos)}
                                controls
                                className="w-full max-w-md h-48 rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLVideoElement
                                  target.style.display = 'none'
                                }}
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-primary">Testimony</Label>
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">{selectedTestimony.text}</p>
                        </div>
                      </div>

                      {selectedTestimony.status === "pending" && (
                        <div className="flex gap-3 pt-4 border-t border-border">
                          <Button
                            onClick={() => {
                              moderateTestimony(selectedTestimony.id!, 'approve')
                              setIsViewDialogOpen(false)
                            }}
                            disabled={isSubmitting}
                            className="flex-1"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                disabled={isSubmitting}
                                className="flex-1"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Testimony</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reject this testimony from {selectedTestimony.member_name}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    moderateTestimony(selectedTestimony.id!, 'reject')
                                    setIsViewDialogOpen(false)
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Reject Testimony
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Edit Testimony Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="w-[95vw] max-w-[500px] mx-auto p-4 sm:p-6 md:max-h-[85vh] lg:max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-3">
                      <Edit className="w-6 h-6 text-blue-600" />
                      Edit Testimony
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="edit-text" className="text-base font-semibold">Testimony Text *</Label>
                      <Textarea
                        id="edit-text"
                        value={editFormData.text}
                        onChange={(e) => setEditFormData({ ...editFormData, text: e.target.value })}
                        placeholder="Edit the testimony text..."
                        className="text-base min-h-[140px] resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-image" className="text-sm md:text-base font-medium">Image (optional)</Label>
                        <div className="relative">
                          <Input
                            id="edit-image"
                            type="file"
                            onChange={(e) => handleEditFileChange(e, 'image')}
                            accept="image/*"
                            disabled={!!editFormData.video}
                            className="text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <Image className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Upload a new image to replace current one
                            </p>
                          </div>
                          {editFormData.image && (
                            <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                              <div className="flex items-center gap-2">
                                <Image className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">{editFormData.image.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(editFormData.image.size)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-video" className="text-sm md:text-base font-medium">Video (optional)</Label>
                        <div className="relative">
                          <Input
                            id="edit-video"
                            type="file"
                            onChange={(e) => handleEditFileChange(e, 'video')}
                            accept="video/*"
                            disabled={!!editFormData.image}
                            className="text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <Video className="w-4 h-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Upload a new video to replace current one
                            </p>
                          </div>
                          {editFormData.video && (
                            <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">{editFormData.video.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(editFormData.video.size)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="edit-status" className="text-base font-semibold">Status</Label>
                      <select
                        id="edit-status"
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-base"
                      >
                        <option value="pending">⏳ Pending Review</option>
                        <option value="approved">✅ Approved</option>
                        <option value="rejected">❌ Rejected</option>
                      </select>
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
                              Update Testimony
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
      </Tabs>
    </div>
  )
}

// Testimony Creation Form Component
function TestimonyForm({
  onError,
  onSuccess,
  onSubmit
}: {
  onError: (error: string) => void
  onSuccess: (message: string) => void
  onSubmit: () => void
}) {
  const [formData, setFormData] = useState({
    text: "",
    image: null as File | null,
    video: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, [type]: file })
    // Clear the other file type when one is selected
    if (type === 'image' && file) {
      setFormData(prev => ({ ...prev, video: null }))
    } else if (type === 'video' && file) {
      setFormData(prev => ({ ...prev, image: null }))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const resetForm = () => {
    setFormData({
      text: "",
      image: null,
      video: null,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    onError("")

    try {
      // Validate required fields
      if (!formData.text || formData.text.trim() === '') {
        onError('Testimony text is required')
        setIsSubmitting(false)
        return
      }

      if (!formData.image && !formData.video) {
        onError('At least one media file (image or video) is required')
        setIsSubmitting(false)
        return
      }

      const token = localStorage.getItem('access_token')
      if (!token) {
        onError('Authentication required')
        return
      }

      const submitFormData = new FormData()
      submitFormData.append('text', formData.text)
      if (formData.image) submitFormData.append('image', formData.image)
      if (formData.video) submitFormData.append('video', formData.video)

      const response = await fetch('/api/contents/testimonies/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitFormData,
      })

      if (response.ok) {
        const newTestimony = await response.json()
        console.log('✅ Testimony created successfully:', newTestimony)
        onSuccess("Testimony submitted successfully! It will be reviewed by administrators.")
        resetForm()
        onSubmit() // Refresh the testimonies list
      } else {
        const errorData = await response.json()
        onError(errorData.error || `Failed to submit testimony (${response.status})`)
      }
    } catch (error) {
      console.error('Error submitting testimony:', error)
      onError('Network error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text" className="text-sm md:text-base font-medium">Testimony Text *</Label>
        <Textarea
          id="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Share your testimony here..."
          className="text-sm md:text-base min-h-[100px] md:min-h-[120px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="image" className="text-sm md:text-base font-medium">Image (optional)</Label>
          <div className="relative">
            <Input
              id="image"
              type="file"
              onChange={(e) => handleFileChange(e, 'image')}
              accept="image/*"
              disabled={!!formData.video}
              className="text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
            />
            <div className="mt-2 flex items-center gap-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Upload an image
              </p>
            </div>
            {formData.image && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{formData.image.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(formData.image.size)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="video" className="text-sm md:text-base font-medium">Video (optional)</Label>
          <div className="relative">
            <Input
              id="video"
              type="file"
              onChange={(e) => handleFileChange(e, 'video')}
              accept="video/*"
              disabled={!!formData.image}
              className="text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
            />
            <div className="mt-2 flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Upload a video
              </p>
            </div>
            {formData.video && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{formData.video.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(formData.video.size)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
            Clear Form
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Testimony
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
