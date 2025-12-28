"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Loader2, CheckCircle, AlertCircle, Edit, Trash2, Search, SortAsc, SortDesc, Grid, List, Calendar, Image, Video, Info } from "lucide-react"


interface MediaObject {
    id: number;
    image?: string;
    video?: string;
}

interface Event {
    id: number;
    title: string;
    description?: string;
    event_date: string;
    images: MediaObject[];
    videos: MediaObject[];
    created_at: string;
}

export default function EventsManagement() {
    const searchParams = useSearchParams()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [submitSuccess, setSubmitSuccess] = useState("")
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        event_date: "",
        images: [] as File[],
        videos: [] as File[],
    })
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        event_date: "",
        images: [] as File[],
        videos: [] as File[],
    })
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [filterText, setFilterText] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [isDeletingImage, setIsDeletingImage] = useState<number | null>(null)
    const [isDeletingVideo, setIsDeletingVideo] = useState<number | null>(null)

    useEffect(() => {
        fetchEvents()
    }, [])

    // Check for URL parameters to auto-open dialogs
    useEffect(() => {
        const action = searchParams.get('action')

        if (action === 'create') {
            setIsDialogOpen(true)
            // Clean up the URL
            window.history.replaceState({}, '', '/admin/events')
        }
    }, [searchParams])

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('❌ No access token found')
                return
            }

            const apiUrl = '/api/contents/events/'

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })


            if (response.ok) {
                const data = await response.json()

                // Check if data is the array or if it's inside a 'results' property
                const eventsArray = Array.isArray(data) ? data : (data.results || [])
                setEvents(eventsArray) // Ensure we only ever set an array
            } else {
                if (response.status === 401) {
                    // Token expired or invalid, redirect to login
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }
                const errorData = await response.json()
                console.error('❌ Events fetch failed:', errorData)
                setSubmitError(errorData.error || `Failed to fetch events (${response.status})`)
            }
        } catch (error) {
            console.error('💥 Error fetching events:', error)
            setSubmitError('Network error occurred')
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

            if (formData.images.length === 0 && formData.videos.length === 0) {
                setSubmitError('Please select at least one image or video file')
                setIsSubmitting(false)
                return
            }

            const submitFormData = new FormData()
            submitFormData.append('title', formData.title)
            submitFormData.append('description', formData.description || '')
            submitFormData.append('event_date', formData.event_date)

            // Append all image files
            formData.images.forEach((file, index) => {
                submitFormData.append('images', file)
            })

            // Append all video files
            formData.videos.forEach((file, index) => {
                submitFormData.append('videos', file)
            })

            // Debug logging
            for (let [key, value] of submitFormData.entries()) {
                if (value instanceof File) {
                } else {
                }
            }

            const response = await fetch('/api/contents/events/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: submitFormData,
            })

            if (response.ok) {
                const newEvent = await response.json()
                setEvents([...events, newEvent])
                setFormData({
                    title: "",
                    description: "",
                    event_date: "",
                    images: [],
                    videos: [],
                })
                setIsDialogOpen(false)
                setSubmitSuccess("Event created successfully!")
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
                setSubmitError(errorData.error || `Failed to create event (${response.status})`)
            }
        } catch (error) {
            console.error('Error creating event:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            event_date: "",
            images: [],
            videos: [],
        })
        setSubmitError("")
        setSubmitSuccess("")
        setIsDialogOpen(false)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (files.length > 0) {
            // Validate each file type
            const validImageTypes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                'image/webp', 'image/svg+xml', 'image/bmp'
            ]

            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']

            const invalidFiles = files.filter(file => {
                const fileName = file.name.toLowerCase()
                const isValidType = validImageTypes.includes(file.type) ||
                                  validExtensions.some(ext => fileName.endsWith(ext))
                return !isValidType
            })

            if (invalidFiles.length > 0) {
                setSubmitError(`Invalid image file types detected: ${invalidFiles.map(f => f.name).join(', ')}. Please select only valid image files (JPG, PNG, GIF, WebP, SVG, BMP)`)
                // Clear the file input
                e.target.value = ''
                return
            }
        }

        setFormData({ ...formData, images: files })
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (files.length > 0) {
            // Validate each file type
            const validVideoTypes = [
                'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
                'video/flv', 'video/webm', 'video/mkv', 'video/3gp'
            ]

            const validExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.3gp']

            const invalidFiles = files.filter(file => {
                const fileName = file.name.toLowerCase()
                const isValidType = validVideoTypes.includes(file.type) ||
                                  validExtensions.some(ext => fileName.endsWith(ext))
                return !isValidType
            })

            if (invalidFiles.length > 0) {
                setSubmitError(`Invalid video file types detected: ${invalidFiles.map(f => f.name).join(', ')}. Please select only valid video files (MP4, AVI, MOV, WMV, FLV, WebM, MKV, 3GP)`)
                // Clear the file input
                e.target.value = ''
                return
            }
        }

        setFormData({ ...formData, videos: files })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getMediaFilename = (mediaUrl: string) => {
        try {
            const url = new URL(mediaUrl)
            const pathname = url.pathname
            const filename = pathname.split('/').pop() || 'media-file'
            return decodeURIComponent(filename)
        } catch {
            // Fallback for relative URLs or malformed URLs
            const parts = mediaUrl.split('/')
            return parts[parts.length - 1] || 'media-file'
        }
    }

    const handleViewEvent = (event: Event) => {
        setSelectedEvent(event)
        setIsViewDialogOpen(true)
    }

    const handleEditEvent = (event: Event) => {
        setSelectedEvent(event)
        setEditFormData({
            title: event.title,
            description: event.description || "",
            event_date: event.event_date,
            images: [],
            videos: []
        })
        setIsEditDialogOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedEvent) return

        setIsSubmitting(true)
        setSubmitError("")

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            // Check if we have new media files to upload
            const hasNewFiles = editFormData.images.length > 0 || editFormData.videos.length > 0

            let response

            if (hasNewFiles) {
                // Use PATCH with FormData to add new media files
                const formData = new FormData()
                formData.append('title', editFormData.title)
                formData.append('description', editFormData.description || '')
                formData.append('event_date', editFormData.event_date)

                // Append all new image files
                editFormData.images.forEach((file, index) => {
                    formData.append('images', file)
                })

                // Append all new video files
                editFormData.videos.forEach((file, index) => {
                    formData.append('videos', file)
                })

                response = await fetch(`/api/contents/events/${selectedEvent.id}/`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                })
            } else {
                // Use PUT for text-only updates (no new files)
                const updateData = {
                    title: editFormData.title,
                    description: editFormData.description || undefined,
                    event_date: editFormData.event_date
                }

                response = await fetch(`/api/contents/events/${selectedEvent.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(updateData),
                })
            }

            if (response.ok) {
                const updatedEvent = await response.json()

                // Update local state
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.id === selectedEvent.id ? updatedEvent : event
                    )
                )

                setEditFormData({
                    title: "",
                    description: "",
                    event_date: "",
                    images: [],
                    videos: []
                })

                setSubmitSuccess("Event updated successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
                setIsEditDialogOpen(false)
            } else {
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to update event (${response.status})`)
            }
        } catch (error) {
            console.error('Error updating event:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteEvent = async (eventId: number) => {
        try {
            setIsDeleting(true)
            setSubmitError("")

            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            const response = await fetch(`/api/contents/events/${eventId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Remove the event from the local state
                setEvents(events.filter(event => event.id !== eventId))
                setSubmitSuccess("Event deleted successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to delete event (${response.status})`)
            }
        } catch (error) {
            console.error('Error deleting event:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteImageFile = async (eventId: number, imageId: number) => {
        try {
            setIsDeletingImage(imageId)
            setSubmitError("")

            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            // Send FormData as per API documentation
            const formData = new FormData()
            formData.append('delete_image_ids', imageId.toString())

            const response = await fetch(`/api/contents/events/${eventId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                const updatedEvent = await response.json()

                // Update local state
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.id === eventId ? updatedEvent : event
                    )
                )

                setSubmitSuccess("Image file deleted successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                // Log the error details for debugging
                console.error('❌ Delete image file failed:', response.status, response.statusText)
                try {
                    const errorData = await response.json()
                    console.error('Error data:', errorData)
                    setSubmitError(errorData.error || `Failed to delete image file (${response.status})`)
                } catch (parseError) {
                    console.error('Could not parse error response:', parseError)
                    setSubmitError(`Failed to delete image file (${response.status})`)
                }
            }
        } catch (error) {
            console.error('Error deleting image file:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsDeletingImage(null)
        }
    }

    const handleDeleteVideoFile = async (eventId: number, videoId: number) => {
        try {
            setIsDeletingVideo(videoId)
            setSubmitError("")

            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            // Send FormData as per API documentation
            const formData = new FormData()
            formData.append('delete_video_ids', videoId.toString())

            const response = await fetch(`/api/contents/events/${eventId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                const updatedEvent = await response.json()

                // Update local state
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.id === eventId ? updatedEvent : event
                    )
                )

                setSubmitSuccess("Video file deleted successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                // Log the error details for debugging
                console.error('❌ Delete video file failed:', response.status, response.statusText)
                try {
                    const errorData = await response.json()
                    console.error('Error data:', errorData)
                    setSubmitError(errorData.error || `Failed to delete video file (${response.status})`)
                } catch (parseError) {
                    console.error('Could not parse error response:', parseError)
                    setSubmitError(`Failed to delete video file (${response.status})`)
                }
            }
        } catch (error) {
            console.error('Error deleting video file:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsDeletingVideo(null)
        }
    }

    // Filter and sort events
    const filteredAndSortedEvents = events
        .filter(event => {
            if (!filterText) return true
            const searchLower = filterText.toLowerCase()
            return (
                event.title.toLowerCase().includes(searchLower) ||
                (event.description && event.description.toLowerCase().includes(searchLower))
            )
        })
        .sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
                    break
                case 'title':
                    comparison = a.title.localeCompare(b.title)
                    break
            }

            return sortOrder === 'asc' ? comparison : -comparison
        })

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
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">Events</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Upload and manage church events with media</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary flex items-center gap-2 w-full sm:w-auto">
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Create Event</span>
                            <span className="sm:hidden">Create</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">Create New Event</DialogTitle>
                        </DialogHeader>

                        {submitError && (
                            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-sm">{submitError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm md:text-base font-medium">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter event title"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="event_date" className="text-sm md:text-base font-medium">Event Date *</Label>
                                <Input
                                    id="event_date"
                                    type="date"
                                    value={formData.event_date}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm md:text-base font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the event..."
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="images" className="text-sm md:text-base font-medium">Images</Label>
                                <div className="relative">
                                    <Input
                                        id="images"
                                        type="file"
                                        onChange={handleImageChange}
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
                                        multiple
                                        className="text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                        <Image className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            Select multiple image files (JPG, PNG, GIF, WebP, SVG, BMP)
                                        </p>
                                    </div>
                                    {formData.images.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {formData.images.map((file, index) => (
                                                <div key={index} className="p-3 bg-muted/50 rounded-lg border">
                                                    <div className="flex items-center gap-2">
                                                        <Image className="w-4 h-4 text-primary" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({
                                                                    ...formData,
                                                                    images: formData.images.filter((_, i) => i !== index)
                                                                })
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Remove image"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="videos" className="text-sm md:text-base font-medium">Videos</Label>
                                <div className="relative">
                                    <Input
                                        id="videos"
                                        type="file"
                                        onChange={handleVideoChange}
                                        accept="video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm,video/mkv,video/3gp"
                                        multiple
                                        className="text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                        <Video className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            Select multiple video files (MP4, AVI, MOV, WMV, FLV, WebM, MKV, 3GP)
                                        </p>
                                    </div>
                                    {formData.videos.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {formData.videos.map((file, index) => (
                                                <div key={index} className="p-3 bg-muted/50 rounded-lg border">
                                                    <div className="flex items-center gap-2">
                                                        <Video className="w-4 h-4 text-primary" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({
                                                                    ...formData,
                                                                    videos: formData.videos.filter((_, i) => i !== index)
                                                                })
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Remove video"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
                                            Create Event
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Total Events</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">{filteredAndSortedEvents.length}</p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Upcoming Events</p>
                    <p className="text-3xl font-display font-bold text-primary mt-2">
                        {events.filter(event => {
                            const eventDate = new Date(event.event_date)
                            const today = new Date()
                            return eventDate >= today
                        }).length}
                    </p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">Past Events</p>
                    <p className="text-3xl font-display font-bold text-accent mt-2">
                        {events.filter(event => {
                            const eventDate = new Date(event.event_date)
                            const today = new Date()
                            return eventDate < today
                        }).length}
                    </p>
                </Card>
            </div>

            {/* Events List - Responsive */}
            <Card className="p-4 md:p-6 glass-card border-2 border-primary/20">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading events...</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No events yet</h3>
                        <p className="text-muted-foreground">Create your first church event to share with the congregation.</p>
                    </div>
                ) : (
                    <>
                        {/* Search, Sort, and Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/20 rounded-lg border">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search events..."
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                                    className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                                >
                                    <option value="date">Sort by Date</option>
                                    <option value="title">Sort by Title</option>
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
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Event Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Media</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedEvents.map((event, index) => (
                                        <tr key={event.id || index} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">{event.title}</p>
                                                        {event.description && (
                                                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                                {event.description.substring(0, 60)}...
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {event.images.length > 0 && `${event.images.length} image${event.images.length > 1 ? 's' : ''}`}
                                                {event.images.length > 0 && event.videos.length > 0 && ', '}
                                                {event.videos.length > 0 && `${event.videos.length} video${event.videos.length > 1 ? 's' : ''}`}
                                                {event.images.length === 0 && event.videos.length === 0 && 'No media'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-3">
                                                    {/* Event Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewEvent(event)}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                            title="View details"
                                                        >
                                                            <Info className="w-4 h-4 text-primary" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditEvent(event)}
                                                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit event"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <button
                                                                    disabled={isDeleting}
                                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                                    title="Delete event"
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
                                                                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{event.title}"? This action cannot be undone and will permanently remove the event from the system.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                {isDeleting && (
                                                                    <div className="py-4">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                            <p className="text-sm font-medium">Deleting event...</p>
                                                                        </div>
                                                                        <Progress value={75} className="w-full" />
                                                                        <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the event and all associated files from the server.</p>
                                                                    </div>
                                                                )}
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteEvent(event.id!)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                        disabled={isDeleting}
                                                                    >
                                                                        {isDeleting ? (
                                                                            <>
                                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                                Deleting...
                                                                            </>
                                                                        ) : (
                                                                            "Delete Event"
                                                                        )}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>

                                                    {/* Individual Media Files */}
                                                    {(event.images.length > 0 || event.videos.length > 0) && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Media Files</p>
                                                            <div className="space-y-1 max-w-xs">
                                                                {event.images.map((imageObj, index) => (
                                                                    <div key={`image-${imageObj.id || index}`} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border">
                                                                        <Image className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-foreground truncate">
                                                                                {getMediaFilename(imageObj.image!)}
                                                                            </p>
                                                                        </div>
                                                                        <a
                                                                            href={imageObj.image}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-muted-foreground hover:text-primary p-1 rounded transition-colors flex-shrink-0"
                                                                            title="View Image"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                        </a>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <button
                                                                                    disabled={isDeletingImage === imageObj.id}
                                                                                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors flex-shrink-0"
                                                                                    title="Delete image"
                                                                                >
                                                                                    {isDeletingImage === imageObj.id ? (
                                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                                    ) : (
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    )}
                                                                                </button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Delete Image File</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Are you sure you want to delete this image file "{getMediaFilename(imageObj.image!)}"? This action cannot be undone.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                {isDeletingImage === imageObj.id && (
                                                                                    <div className="py-4">
                                                                                        <div className="flex items-center gap-3 mb-2">
                                                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                                            <p className="text-sm font-medium">Deleting image file...</p>
                                                                                        </div>
                                                                                        <Progress value={75} className="w-full" />
                                                                                        <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the file from the server.</p>
                                                                                    </div>
                                                                                )}
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel disabled={isDeletingImage === imageObj.id}>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() => handleDeleteImageFile(event.id!, imageObj.id)}
                                                                                        className="bg-red-600 hover:bg-red-700"
                                                                                        disabled={isDeletingImage === imageObj.id}
                                                                                    >
                                                                                        {isDeletingImage === imageObj.id ? (
                                                                                            <>
                                                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                                                Deleting...
                                                                                            </>
                                                                                        ) : (
                                                                                            "Delete File"
                                                                                        )}
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                ))}
                                                                {event.videos.map((videoObj, index) => (
                                                                    <div key={`video-${videoObj.id || index}`} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border">
                                                                        <Video className="w-3 h-3 text-red-500 flex-shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-foreground truncate">
                                                                                {getMediaFilename(videoObj.video!)}
                                                                            </p>
                                                                        </div>
                                                                        <a
                                                                            href={videoObj.video}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-muted-foreground hover:text-primary p-1 rounded transition-colors flex-shrink-0"
                                                                            title="View Video"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        </a>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <button
                                                                                    disabled={isDeletingVideo === videoObj.id}
                                                                                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors flex-shrink-0"
                                                                                    title="Delete video"
                                                                                >
                                                                                    {isDeletingVideo === videoObj.id ? (
                                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                                    ) : (
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    )}
                                                                                </button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Delete Video File</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Are you sure you want to delete this video file "{getMediaFilename(videoObj.video!)}"? This action cannot be undone.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                {isDeletingVideo === videoObj.id && (
                                                                                    <div className="py-4">
                                                                                        <div className="flex items-center gap-3 mb-2">
                                                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                                            <p className="text-sm font-medium">Deleting video file...</p>
                                                                                        </div>
                                                                                        <Progress value={75} className="w-full" />
                                                                                        <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the file from the server.</p>
                                                                                    </div>
                                                                                )}
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel disabled={isDeletingVideo === videoObj.id}>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() => handleDeleteVideoFile(event.id!, videoObj.id)}
                                                                                        className="bg-red-600 hover:bg-red-700"
                                                                                        disabled={isDeletingVideo === videoObj.id}
                                                                                    >
                                                                                        {isDeletingVideo === videoObj.id ? (
                                                                                            <>
                                                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                                                Deleting...
                                                                                            </>
                                                                                        ) : (
                                                                                            "Delete File"
                                                                                        )}
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredAndSortedEvents.map((event, index) => (
                                <Card key={event.id || index} className="p-4 glass-card border-2 border-primary/20">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-foreground truncate">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleViewEvent(event)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <Info className="w-4 h-4 text-primary" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditEvent(event)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit event"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            disabled={isDeleting}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete event"
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
                                                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{event.title}"? This action cannot be undone and will permanently remove the event from the system.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        {isDeleting && (
                                                            <div className="py-4">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                    <p className="text-sm font-medium">Deleting event...</p>
                                                                </div>
                                                                <Progress value={75} className="w-full" />
                                                                <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the event and all associated files from the server.</p>
                                                            </div>
                                                        )}
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteEvent(event.id!)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        Deleting...
                                                                    </>
                                                                ) : (
                                                                    "Delete Event"
                                                                )}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        {event.description && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {event.description.substring(0, 100)}...
                                                </p>
                                            </div>
                                        )}

                                        {/* Media Files Section */}
                                        {(event.images.length > 0 || event.videos.length > 0) && (
                                            <div className="pt-2 border-t border-border space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Media Files</p>
                                                <div className="space-y-2">
                                                    {event.images.map((imageObj, index) => (
                                                        <div key={`image-${imageObj.id || index}`} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border">
                                                            <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {getMediaFilename(imageObj.image!)}
                                                                </p>
                                                            </div>
                                                            <a
                                                                href={imageObj.image}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-muted-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors flex-shrink-0"
                                                                title="View Image"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </a>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <button
                                                                        disabled={isDeletingImage === imageObj.id}
                                                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                                                                        title="Delete image"
                                                                    >
                                                                        {isDeletingImage === imageObj.id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Image File</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete this image file "{getMediaFilename(imageObj.image!)}"? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    {isDeletingImage === imageObj.id && (
                                                                        <div className="py-4">
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                                <p className="text-sm font-medium">Deleting image file...</p>
                                                                            </div>
                                                                            <Progress value={75} className="w-full" />
                                                                            <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the file from the server.</p>
                                                                        </div>
                                                                    )}
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel disabled={isDeletingImage === imageObj.id}>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteImageFile(event.id!, imageObj.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                            disabled={isDeletingImage === imageObj.id}
                                                                        >
                                                                            {isDeletingImage === imageObj.id ? (
                                                                                <>
                                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                                    Deleting...
                                                                                </>
                                                                            ) : (
                                                                                "Delete File"
                                                                            )}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    ))}
                                                    {event.videos.map((videoObj, index) => (
                                                        <div key={`video-${videoObj.id || index}`} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border">
                                                            <Video className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {getMediaFilename(videoObj.video!)}
                                                                </p>
                                                            </div>
                                                            <a
                                                                href={videoObj.video}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-muted-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors flex-shrink-0"
                                                                title="View Video"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </a>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <button
                                                                        disabled={isDeletingVideo === videoObj.id}
                                                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                                                                        title="Delete video"
                                                                    >
                                                                        {isDeletingVideo === videoObj.id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Video File</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete this video file "{getMediaFilename(videoObj.video!)}"? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    {isDeletingVideo === videoObj.id && (
                                                                        <div className="py-4">
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                                <p className="text-sm font-medium">Deleting video file...</p>
                                                                            </div>
                                                                            <Progress value={75} className="w-full" />
                                                                            <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the file from the server.</p>
                                                                        </div>
                                                                    )}
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel disabled={isDeletingVideo === videoObj.id}>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteVideoFile(event.id!, videoObj.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                            disabled={isDeletingVideo === videoObj.id}
                                                                        >
                                                                            {isDeletingVideo === videoObj.id ? (
                                                                                <>
                                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                                    Deleting...
                                                                                </>
                                                                            ) : (
                                                                                "Delete File"
                                                                            )}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground">
                                                Created: {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Event Details Dialog */}
                        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                            <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-lg md:text-xl flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        Event Details
                                    </DialogTitle>
                                </DialogHeader>

                                {selectedEvent && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-primary">Title</Label>
                                            <p className="text-base md:text-lg font-semibold text-foreground">{selectedEvent.title}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-primary">Event Date</Label>
                                            <p className="text-base text-foreground">
                                                {selectedEvent.event_date ? new Date(selectedEvent.event_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </p>
                                        </div>

                                        {selectedEvent.description && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-primary">Description</Label>
                                                <p className="text-base text-foreground leading-relaxed">{selectedEvent.description}</p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-primary">Created</Label>
                                            <p className="text-base text-foreground">
                                                {selectedEvent.created_at ? new Date(selectedEvent.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </p>
                                        </div>

                                        {(selectedEvent.images.length > 0 || selectedEvent.videos.length > 0) && (
                                            <div className="space-y-4">
                                                <Label className="text-sm font-semibold text-primary">
                                                    Media Files ({selectedEvent.images.length + selectedEvent.videos.length})
                                                </Label>
                                                <div className="space-y-3">
                                                    {selectedEvent.images.map((imageObj, index) => (
                                                        <div key={`image-${imageObj.id || index}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                                                            <Image className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {getMediaFilename(imageObj.image!)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">Image File {index + 1}</p>
                                                            </div>
                                                            <a
                                                                href={imageObj.image}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:text-primary/80 p-2 rounded-full hover:bg-primary/10 transition-colors"
                                                                title="View Image"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    ))}
                                                    {selectedEvent.videos.map((videoObj, index) => (
                                                        <div key={`video-${videoObj.id || index}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                                                            <Video className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {getMediaFilename(videoObj.video!)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">Video File {index + 1}</p>
                                                            </div>
                                                            <a
                                                                href={videoObj.video}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:text-primary/80 p-2 rounded-full hover:bg-primary/10 transition-colors"
                                                                title="View Video"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Edit Event Dialog */}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="w-[95vw] max-w-[500px] mx-auto p-4 sm:p-6 md:max-h-[85vh] lg:max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl flex items-center gap-3">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                        Edit Event
                                    </DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleEditSubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="edit-title" className="text-base font-semibold">Title *</Label>
                                        <Input
                                            id="edit-title"
                                            value={editFormData.title}
                                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            placeholder="Edit event title..."
                                            className="text-base"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="edit-event_date" className="text-base font-semibold">Event Date *</Label>
                                        <Input
                                            id="edit-event_date"
                                            type="date"
                                            value={editFormData.event_date}
                                            onChange={(e) => setEditFormData({ ...editFormData, event_date: e.target.value })}
                                            className="text-base"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="edit-description" className="text-base font-semibold">Description</Label>
                                        <Textarea
                                            id="edit-description"
                                            value={editFormData.description}
                                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                            placeholder="Edit event description..."
                                            className="text-base min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Add New Media Files</Label>
                                        <p className="text-sm text-muted-foreground">Upload additional images or videos to this event</p>

                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor="edit-images" className="text-sm font-medium">Add Images</Label>
                                                <div className="mt-1">
                                                    <Input
                                                        id="edit-images"
                                                        type="file"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files || [])
                                                            setEditFormData({ ...editFormData, images: files })
                                                        }}
                                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
                                                        multiple
                                                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                                                    />
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Image className="w-4 h-4 text-muted-foreground" />
                                                        <p className="text-xs text-muted-foreground">
                                                            Select additional image files (JPG, PNG, GIF, WebP, SVG, BMP)
                                                        </p>
                                                    </div>
                                                </div>
                                                {editFormData.images.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        {editFormData.images.map((file, index) => (
                                                            <div key={`new-image-${index}`} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <Image className="w-4 h-4 text-green-600" />
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-green-800">{file.name}</p>
                                                                        <p className="text-xs text-green-600">
                                                                            {formatFileSize(file.size)} - New file to upload
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditFormData({
                                                                                ...editFormData,
                                                                                images: editFormData.images.filter((_, i) => i !== index)
                                                                            })
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 p-1"
                                                                        title="Remove image"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="edit-videos" className="text-sm font-medium">Add Videos</Label>
                                                <div className="mt-1">
                                                    <Input
                                                        id="edit-videos"
                                                        type="file"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files || [])
                                                            setEditFormData({ ...editFormData, videos: files })
                                                        }}
                                                        accept="video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm,video/mkv,video/3gp"
                                                        multiple
                                                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                                                    />
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Video className="w-4 h-4 text-muted-foreground" />
                                                        <p className="text-xs text-muted-foreground">
                                                            Select additional video files (MP4, AVI, MOV, WMV, FLV, WebM, MKV, 3GP)
                                                        </p>
                                                    </div>
                                                </div>
                                                {editFormData.videos.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        {editFormData.videos.map((file, index) => (
                                                            <div key={`new-video-${index}`} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <Video className="w-4 h-4 text-blue-600" />
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-blue-800">{file.name}</p>
                                                                        <p className="text-xs text-blue-600">
                                                                            {formatFileSize(file.size)} - New file to upload
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditFormData({
                                                                                ...editFormData,
                                                                                videos: editFormData.videos.filter((_, i) => i !== index)
                                                                            })
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 p-1"
                                                                        title="Remove video"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <div className="flex flex-col-reverse xs:flex-row xs:justify-end gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditDialogOpen(false)
                                                    setEditFormData({
                                                        title: "",
                                                        description: "",
                                                        event_date: "",
                                                        images: [],
                                                        videos: []
                                                    })
                                                }}
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
                                                        Update Event
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
