"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useState, useEffect, useRef } from "react"
import { Plus, Mic, Loader2, CheckCircle, AlertCircle, Edit, Trash2, Play, Pause, Upload, SkipForward, Info } from "lucide-react"


interface Sermon {
    id: number;
    title: string;
    preacher?: string;
    audio?: string; // URL to audio file
    description?: string;
    created_at: string;
}

export default function SermonsManagement() {
    const [sermons, setSermons] = useState<Sermon[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [submitSuccess, setSubmitSuccess] = useState("")
    const [editFormData, setEditFormData] = useState({
        title: "",
        preacher: "",
        description: "",
        audio: ""
    })
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [playingSermonId, setPlayingSermonId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        preacher: "",
        description: "",
        audio: null as File | null,
    })

    useEffect(() => {
        console.log('🎵 Sermons component mounted, fetching sermons...')
        fetchSermons()
    }, [])

    const fetchSermons = async () => {
        console.log('🚀 Starting sermons fetch...')
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('❌ No access token found')
                return
            }
            console.log('✅ Access token found')

            const apiUrl = '/api/contents/sermons/'
            console.log('🌐 Fetching sermons from:', apiUrl)

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            console.log('📊 Sermons fetch response status:', response.status, response.statusText)

            if (response.ok) {
                const data = await response.json()

                // Check if data is the array or if it's inside a 'results' property
                const sermonsArray = Array.isArray(data) ? data : (data.results || [])

                console.log('✅ Sermons fetched successfully:', sermonsArray.length)
                setSermons(sermonsArray) // Ensure we only ever set an array
            }

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Sermons fetched successfully:', data.length, 'sermons')
                console.log('📋 Sermon data example:', data[0])

                // Transform the API response to match our interface
                // API returns 'audios' array, we need 'audio' string
                const transformedSermons = data.map((sermon: any) => ({
                    id: sermon.id,
                    title: sermon.title,
                    preacher: sermon.preacher,
                    description: sermon.description,
                    created_at: sermon.created_at,
                    audio: sermon.audios && sermon.audios.length > 0 ? sermon.audios[0].audio : null
                }))

                setSermons(transformedSermons)
            } else {
                if (response.status === 401) {
                    console.log('🔐 Token expired, redirecting to login')
                    // Token expired or invalid, redirect to login
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }
                const errorData = await response.json()
                console.error('❌ Sermons fetch failed:', errorData)
                setSubmitError(errorData.error || `Failed to fetch sermons (${response.status})`)
            }
        } catch (error) {
            console.error('💥 Error fetching sermons:', error)
            setSubmitError('Network error occurred')
        } finally {
            console.log('🏁 Sermons fetch completed, setting loading to false')
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

            if (!formData.audio) {
                setSubmitError('Please select an audio file')
                setIsSubmitting(false)
                return
            }

            const submitFormData = new FormData()
            submitFormData.append('title', formData.title)
            submitFormData.append('preacher', formData.preacher)
            submitFormData.append('description', formData.description)
            submitFormData.append('audio', formData.audio)

            const response = await fetch('/api/contents/sermons/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: submitFormData,
            })

            if (response.ok) {
                const newSermon = await response.json()
                setSermons([...sermons, newSermon])
                setFormData({
                    title: "",
                    preacher: "",
                    description: "",
                    audio: null,
                })
                setIsDialogOpen(false)
                setSubmitSuccess("Sermon created successfully!")
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
                setSubmitError(errorData.error || `Failed to create sermon (${response.status})`)
            }
        } catch (error) {
            console.error('Error creating sermon:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            preacher: "",
            description: "",
            audio: null,
        })
        setSubmitError("")
        setSubmitSuccess("")
        setIsDialogOpen(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setFormData({ ...formData, audio: file })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleViewSermon = (sermon: Sermon) => {
        setSelectedSermon(sermon)
        setIsViewDialogOpen(true)
    }

    const handleEditSermon = (sermon: Sermon) => {
        setSelectedSermon(sermon)
        setEditFormData({
            title: sermon.title,
            preacher: sermon.preacher || "",
            description: sermon.description || "",
            audio: sermon.audio || ""
        })
        setIsEditDialogOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSermon) return

        setIsSubmitting(true)
        setSubmitError("")

        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            const updateData = {
                title: editFormData.title,
                preacher: editFormData.preacher || undefined,
                audio: editFormData.audio || undefined,
                description: editFormData.description || undefined
            }

            const response = await fetch(`/api/contents/sermons/${selectedSermon.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            })

            if (response.ok) {
                const updatedSermon = await response.json()
                console.log('✅ Sermon updated successfully:', updatedSermon)

                // Update local state
                setSermons(prevSermons =>
                    prevSermons.map(sermon =>
                        sermon.id === selectedSermon.id
                            ? { ...sermon, ...updateData, created_at: sermon.created_at }
                            : sermon
                    )
                )

                setSubmitSuccess("Sermon updated successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
                setIsEditDialogOpen(false)
            } else {
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to update sermon (${response.status})`)
            }
        } catch (error) {
            console.error('Error updating sermon:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteSermon = async (sermonId: number) => {
        try {
            setIsDeleting(true)
            setSubmitError("")

            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            const response = await fetch(`/api/contents/sermons/${sermonId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Remove the sermon from the local state
                setSermons(sermons.filter(sermon => sermon.id !== sermonId))
                setSubmitSuccess("Sermon deleted successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                    return
                }
                const errorData = await response.json()
                setSubmitError(errorData.error || `Failed to delete sermon (${response.status})`)
            }
        } catch (error) {
            console.error('Error deleting sermon:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsDeleting(false)
        }
    }



    const playNextSermon = (currentSermonId: number, autoStop: boolean = false) => {
        console.log('⏭️ Play Next button clicked for sermon ID:', currentSermonId)
        console.log('📊 Total sermons:', sermons.length)

        if (sermons.length === 0) {
            console.log('🚫 No sermons available, returning')
            return
        }

        // Find the current sermon by ID
        const currentIndex = sermons.findIndex(sermon => sermon.id === currentSermonId)

        console.log('� Current sermon index in array:', currentIndex)

        if (currentIndex === -1) {
            console.log('❌ Sermon not found in array, cannot find next')
            return
        }

        const nextIndex = (currentIndex + 1) % sermons.length
        console.log('🎯 Next index:', nextIndex, '(after:', currentIndex, ', wraps to:', (currentIndex + 1) % sermons.length, ')')

        const nextSermon = sermons[nextIndex]
        console.log('🎵 Next sermon:', nextSermon.title, `(ID: ${nextSermon.id})`)

        if (nextSermon.audio) {
            // Check if it's actually an audio file (not image like .jpeg, .png)
            const isValidAudio = !nextSermon.audio.includes('.jpeg') &&
                !nextSermon.audio.includes('.jpg') &&
                !nextSermon.audio.includes('.png');

            if (isValidAudio) {
                console.log('✅ Next sermon has valid audio, playing...')

                // If autoStop is true, we want to immediately stop any current playback
                // before starting the next one to avoid the AbortError
                if (autoStop && audioRef.current) {
                    console.log('⏸️ Stopping current audio before playing next')
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                    audioRef.current.src = '' // Clear the source
                }

                togglePlay(nextSermon.id!, nextSermon.audio!)
            } else {
                console.log('⚠️ Next sermon has invalid audio (image file), skipping:', nextSermon.audio)
                // Skip this sermon, continue to next one via timeout to avoid infinite loops
                setTimeout(() => playNextSermon(nextSermon.id!, false), 100)
            }
        } else {
            console.log('❌ Next sermon has no audio, skipping')
        }
    }

    const togglePlay = async (sermonId: number, audioUrl: string) => {
        console.log('🎶 Toggle play called for sermon ID:', sermonId, 'with audio URL:', audioUrl)

        if (playingSermonId === sermonId) {
            console.log('⏸️ Same sermon already playing, pausing...')
            // Stop current audio completely
            if (audioRef.current) {
                console.log('🎵 Stopping current audio')
                audioRef.current.pause()
                audioRef.current.currentTime = 0
                audioRef.current.src = '' // Clear source
                // Reset all event listeners
                audioRef.current.onended = null
                audioRef.current.onerror = null
            }
            setPlayingSermonId(null)
            console.log('� Set playing sermon ID to null')
        } else {
            console.log('▶️ Playing new sermon...')

            // Always create a fresh Audio element to avoid AbortError
            // Existing audio elements can retain pending play requests
            console.log('🆕 Creating fresh audio element for:', sermonId)
            const newAudio = new Audio(audioUrl)
            console.log('🎵 Created new Audio object with src:', audioUrl)

            // Set up event handlers BEFORE playing
            newAudio.onended = () => {
                console.log('🏁 Audio finished playing for ID:', sermonId)
                console.log('♻️ Auto-playing next sermon in loop')
                setTimeout(() => {
                    console.log('⏯️ Starting auto-play for sermon that just finished:', sermonId)
                    playNextSermon(sermonId, false)
                }, 1000) // 1 second delay before next
            }

            newAudio.onerror = () => {
                console.error('💥 Error loading audio')
                setPlayingSermonId(null)
                setSubmitError('Error loading audio')
            }

            // Clean up old audio element
            if (audioRef.current) {
                console.log('🗑️ Cleaning up old audio element')
                audioRef.current.pause()
                audioRef.current.src = ''
                audioRef.current = null
            }

            // Set the new audio as current
            audioRef.current = newAudio

            // Now play the audio
            newAudio.play()
                .then(() => {
                    console.log('🎉 New audio started successfully')
                    setPlayingSermonId(sermonId)
                    console.log('🏷️ Set playing sermon ID to:', sermonId)
                })
                .catch(e => {
                    console.error('💥 Error playing new audio:', e)
                    setSubmitError('Error playing audio')
                })
        }
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
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">Sermons</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Upload and manage sermon recordings for the congregation</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary flex items-center gap-2 w-full sm:w-auto">
                            <Upload className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Upload Sermon</span>
                            <span className="sm:hidden">Upload</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">Upload New Sermon</DialogTitle>
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
                                    placeholder="Enter sermon title"
                                    required
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preacher" className="text-sm md:text-base font-medium">Preacher</Label>
                                <Input
                                    id="preacher"
                                    value={formData.preacher}
                                    onChange={(e) => setFormData({ ...formData, preacher: e.target.value })}
                                    placeholder="Enter preacher's name"
                                    className="text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm md:text-base font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the sermon..."
                                    className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="audio" className="text-sm md:text-base font-medium">Audio File *</Label>
                                <div className="relative">
                                    <Input
                                        id="audio"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="audio/*"
                                        required
                                        className="text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            Select an audio file (mp3, wav, m4a, etc.)
                                        </p>
                                    </div>
                                    {formData.audio && (
                                        <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                                            <div className="flex items-center gap-2">
                                                <Mic className="w-4 h-4 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">{formData.audio.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(formData.audio.size)}
                                                    </p>
                                                </div>
                                            </div>
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
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-4 h-4 mr-2 cursor-pointer" />
                                            Upload Sermon
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
                    <p className="text-muted-foreground text-sm">Total Sermons</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-2">{sermons.length}</p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">This Week</p>
                    <p className="text-3xl font-display font-bold text-primary mt-2">
                        {sermons.filter(sermon => {
                            const sermonDate = new Date(sermon.created_at || 0)
                            const weekAgo = new Date()
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            return sermonDate >= weekAgo
                        }).length}
                    </p>
                </Card>
                <Card className="p-4 glass-card border-2 border-primary/20">
                    <p className="text-muted-foreground text-sm">This Month</p>
                    <p className="text-3xl font-display font-bold text-accent mt-2">
                        {sermons.filter(sermon => {
                            const sermonDate = new Date(sermon.created_at || 0)
                            const monthAgo = new Date()
                            monthAgo.setMonth(monthAgo.getMonth() - 1)
                            return sermonDate >= monthAgo
                        }).length}
                    </p>
                </Card>
            </div>

            {/* Sermons List - Responsive */}
            <Card className="p-4 md:p-6 glass-card border-2 border-primary/20">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading sermons...</span>
                    </div>
                ) : sermons.length === 0 ? (
                    <div className="text-center py-12">
                        <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No sermons yet</h3>
                        <p className="text-muted-foreground">Upload your first sermon to share with the congregation.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Preacher</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Uploaded</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sermons.map((sermon, index) => (
                                        <tr key={sermon.id || index} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Mic className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">{sermon.title}</p>
                                                        {sermon.description && (
                                                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                                {sermon.description.substring(0, 60)}...
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {sermon.preacher || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {sermon.created_at ? new Date(sermon.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 flex items-center justify-center gap-2">
                                                {sermon.audio && (
                                                    <>
                                                        <button
                                                            onClick={() => togglePlay(sermon.id!, sermon.audio!)}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                            title={playingSermonId === sermon.id ? "Pause" : "Play"}
                                                        >
                                                            {playingSermonId === sermon.id ? (
                                                                <Pause className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <Play className="w-4 h-4 text-primary" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => playNextSermon(sermon.id!, true)}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                            title="Play Next"
                                                        >
                                                            <SkipForward className="w-4 h-4 text-primary" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleViewSermon(sermon)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                    title="View details"
                                                >
                                                    <Info className="w-4 h-4 text-primary" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSermon(sermon)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit sermon"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            disabled={isDeleting}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Delete sermon"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Sermon</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{sermon.title}"? This action cannot be undone and will permanently remove the sermon from the system.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteSermon(sermon.id!)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? "Deleting..." : "Delete Sermon"}
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
                            {sermons.map((sermon, index) => (
                                <Card key={sermon.id || index} className="p-4 glass-card border-2 border-primary/20">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <Mic className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-foreground truncate">{sermon.title}</h3>
                                                    {sermon.preacher && (
                                                        <p className="text-sm text-muted-foreground">by {sermon.preacher}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {sermon.audio && (
                                                    <>
                                                        <button
                                                            onClick={() => togglePlay(sermon.id!, sermon.audio!)}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                            title={playingSermonId === sermon.id ? "Pause" : "Play"}
                                                        >
                                                            {playingSermonId === sermon.id ? (
                                                                <Pause className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <Play className="w-4 h-4 text-primary" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => playNextSermon(sermon.id!, true)}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                            title="Play Next"
                                                        >
                                                            <SkipForward className="w-4 h-4 text-primary" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleViewSermon(sermon)}
                                                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <Info className="w-4 h-4 text-primary" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSermon(sermon)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit sermon"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            disabled={isDeleting}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete sermon"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Sermon</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{sermon.title}"? This action cannot be undone and will permanently remove the sermon from the system.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteSermon(sermon.id!)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? "Deleting..." : "Delete Sermon"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        {sermon.description && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {sermon.description.substring(0, 100)}...
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground">
                                                Uploaded: {sermon.created_at ? new Date(sermon.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* sermon Details Dialog */}
                        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                            <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-lg md:text-xl flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Mic className="w-5 h-5 text-primary" />
                                        </div>
                                        Sermon Details
                                    </DialogTitle>
                                </DialogHeader>

                                {selectedSermon && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-primary">Title</Label>
                                            <p className="text-base md:text-lg font-semibold text-foreground">{selectedSermon.title}</p>
                                        </div>

                                        {selectedSermon.preacher && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-primary">Preacher</Label>
                                                <p className="text-base text-foreground">{selectedSermon.preacher}</p>
                                            </div>
                                        )}

                                        {selectedSermon.description && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-primary">Description</Label>
                                                <p className="text-base text-foreground leading-relaxed">{selectedSermon.description}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-primary">Upload Date</Label>
                                                <p className="text-base text-foreground">
                                                    {selectedSermon.created_at ? new Date(selectedSermon.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-primary">Audio File</Label>
                                                <p className="text-base text-foreground">
                                                    {selectedSermon.audio ? 'Available' : 'Not available'}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedSermon.audio && (
                                            <div className="pt-4 border-t border-border">
                                                <Button
                                                    onClick={() => {
                                                        togglePlay(selectedSermon!.id, selectedSermon!.audio!)
                                                        setIsViewDialogOpen(false)
                                                    }}
                                                    className="w-full sm:w-auto"
                                                >
                                                    {playingSermonId === selectedSermon!.id ? "Pause Sermon" : "Play Sermon"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Edit Sermon Dialog */}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="w-[95vw] max-w-[500px] mx-auto p-4 sm:p-6 md:max-h-[85vh] lg:max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl flex items-center gap-3">
                                        <Mic className="w-6 h-6 text-blue-600" />
                                        Edit Sermon
                                    </DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleEditSubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="edit-title" className="text-base font-semibold">Title *</Label>
                                        <Input
                                            id="edit-title"
                                            value={editFormData.title}
                                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            placeholder="Edit sermon title..."
                                            className="text-base"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <Label htmlFor="edit-preacher" className="text-base font-medium">Preacher (optional)</Label>
                                            <Input
                                                id="edit-preacher"
                                                value={editFormData.preacher}
                                                onChange={(e) => setEditFormData({ ...editFormData, preacher: e.target.value })}
                                                placeholder="Enter preacher name..."
                                                className="text-base"
                                            />
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Leave empty if unknown
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="edit-audio" className="text-base font-medium">Audio URL (optional)</Label>
                                            <Input
                                                id="edit-audio"
                                                type="url"
                                                value={editFormData.audio}
                                                onChange={(e) => setEditFormData({ ...editFormData, audio: e.target.value })}
                                                placeholder="https://example.com/audio.mp3"
                                                className="text-base"
                                            />
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Leave empty to keep current audio
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="edit-description" className="text-base font-semibold">Description (optional)</Label>
                                        <Textarea
                                            id="edit-description"
                                            value={editFormData.description}
                                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                            placeholder="Brief description of the sermon..."
                                            className="text-base min-h-[120px] resize-none"
                                        />
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
                                                        Update Sermon
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
