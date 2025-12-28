"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Mic, Loader2, CheckCircle, AlertCircle, Edit, Trash2, Play, Pause, Upload, SkipForward, Info, Search, SortAsc, SortDesc, Grid, List } from "lucide-react"


interface AudioObject {
    id: number;
    audio: string;
    filename?: string;
    duration?: number;
    size?: number;
}

interface Sermon {
    id: number;
    title: string;
    preacher?: string;
    description?: string;
    created_at: string;
    audios: AudioObject[]; // Array of audio objects from API
}

export default function SermonsManagement() {
    const searchParams = useSearchParams()
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
        audios: [] as File[],
    })
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [playingSermonId, setPlayingSermonId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        preacher: "",
        description: "",
        audios: [] as File[],
    })
    const [sortBy, setSortBy] = useState<'date' | 'title' | 'preacher'>('date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [filterText, setFilterText] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [isDeletingAudio, setIsDeletingAudio] = useState<number | null>(null)

    useEffect(() => {
        fetchSermons()
    }, [])

    // Check for URL parameters to auto-open dialogs
    useEffect(() => {
        const action = searchParams.get('action')

        if (action === 'create') {
            setIsDialogOpen(true)
            // Clean up the URL
            window.history.replaceState({}, '', '/admin/sermons')
        }
    }, [searchParams])

    const fetchSermons = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                console.error('❌ No access token found')
                return
            }

            const apiUrl = '/api/contents/sermons/'

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })


            if (response.ok) {
                const data = await response.json()

                // Check if data is the array or if it's inside a 'results' property
                const sermonsArray = Array.isArray(data) ? data : (data.results || [])
                setSermons(sermonsArray) // Ensure we only ever set an array
            } else {
                if (response.status === 401) {
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

            if (formData.audios.length === 0) {
                setSubmitError('Please select at least one audio file')
                setIsSubmitting(false)
                return
            }

            const submitFormData = new FormData()
            submitFormData.append('title', formData.title)
            submitFormData.append('preacher', formData.preacher || '')
            submitFormData.append('description', formData.description || '')

            // Append all audio files
            formData.audios.forEach((file, index) => {
                submitFormData.append('audios', file)
            })

            // Debug logging
            for (let [key, value] of submitFormData.entries()) {
                if (value instanceof File) {
                } else {
                }
            }

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
                    audios: [],
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
            audios: [],
        })
        setSubmitError("")
        setSubmitSuccess("")
        setIsDialogOpen(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (files.length > 0) {
            // Validate each file type
            const validAudioTypes = [
                'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
                'audio/ogg', 'audio/oga', 'audio/mp4', 'audio/m4a',
                'audio/aac', 'audio/flac', 'audio/webm'
            ]

            const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm']

            const invalidFiles = files.filter(file => {
                const fileName = file.name.toLowerCase()
                const isValidType = validAudioTypes.includes(file.type) ||
                                  validExtensions.some(ext => fileName.endsWith(ext))
                return !isValidType
            })

            if (invalidFiles.length > 0) {
                setSubmitError(`Invalid file types detected: ${invalidFiles.map(f => f.name).join(', ')}. Please select only valid audio files (MP3, WAV, OGG, M4A, AAC, FLAC, or WebM)`)
                // Clear the file input
                e.target.value = ''
                return
            }
        }

        setFormData({ ...formData, audios: files })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getAudioFilename = (audioUrl: string) => {
        try {
            const url = new URL(audioUrl)
            const pathname = url.pathname
            const filename = pathname.split('/').pop() || 'audio-file'
            return decodeURIComponent(filename)
        } catch {
            // Fallback for relative URLs or malformed URLs
            const parts = audioUrl.split('/')
            return parts[parts.length - 1] || 'audio-file'
        }
    }

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds === 0) return ''
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
            audios: []
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

            // Check if we have new audio files to upload
            const hasNewFiles = editFormData.audios.length > 0

            let response

            if (hasNewFiles) {
                // Use PATCH with FormData to add new audio files
                const formData = new FormData()
                formData.append('title', editFormData.title)
                formData.append('preacher', editFormData.preacher || '')
                formData.append('description', editFormData.description || '')

                // Append all new audio files
                editFormData.audios.forEach((file, index) => {
                    formData.append('audios', file)
                })

                response = await fetch(`/api/contents/sermons/${selectedSermon.id}/`, {
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
                    preacher: editFormData.preacher || undefined,
                    description: editFormData.description || undefined
                }

                response = await fetch(`/api/contents/sermons/${selectedSermon.id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(updateData),
                })
            }

            if (response.ok) {
                const updatedSermon = await response.json()

                // Update local state
                setSermons(prevSermons =>
                    prevSermons.map(sermon =>
                        sermon.id === selectedSermon.id ? updatedSermon : sermon
                    )
                )

                setEditFormData({
                    title: "",
                    preacher: "",
                    description: "",
                    audios: []
                })

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

    const handleDeleteAudioFile = async (sermonId: number, audioId: number) => {
        try {
            setIsDeletingAudio(audioId)
            setSubmitError("")

            const token = localStorage.getItem('access_token')
            if (!token) {
                setSubmitError('Authentication required')
                return
            }

            // Send FormData as per API documentation
            const formData = new FormData()
            formData.append('delete_audio_ids', audioId.toString())

            const response = await fetch(`/api/contents/sermons/${sermonId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                const updatedSermon = await response.json()

                // Update local state
                setSermons(prevSermons =>
                    prevSermons.map(s =>
                        s.id === sermonId ? updatedSermon : s
                    )
                )

                setSubmitSuccess("Audio file deleted successfully!")
                setTimeout(() => setSubmitSuccess(""), 3000)
            } else {
                // Log the error details for debugging
                console.error('❌ Delete audio file failed:', response.status, response.statusText)
                try {
                    const errorData = await response.json()
                    console.error('Error data:', errorData)
                    setSubmitError(errorData.error || `Failed to delete audio file (${response.status})`)
                } catch (parseError) {
                    console.error('Could not parse error response:', parseError)
                    setSubmitError(`Failed to delete audio file (${response.status})`)
                }
            }
        } catch (error) {
            console.error('Error deleting audio file:', error)
            setSubmitError('Network error occurred')
        } finally {
            setIsDeletingAudio(null)
        }
    }



    const playNextSermon = (currentSermonId: number, autoStop: boolean = false) => {

        if (sermons.length === 0) {
            return
        }

        // Find the current sermon by ID
        const currentIndex = sermons.findIndex(sermon => sermon.id === currentSermonId)


        if (currentIndex === -1) {
            return
        }

        const nextIndex = (currentIndex + 1) % sermons.length

        const nextSermon = sermons[nextIndex]

        if (nextSermon.audios && nextSermon.audios.length > 0) {
            const audioUrl = nextSermon.audios[0].audio
            // Check if it's actually an audio file (not image like .jpeg, .png)
            const isValidAudio = !audioUrl.includes('.jpeg') &&
                !audioUrl.includes('.jpg') &&
                !audioUrl.includes('.png');

            if (isValidAudio) {

                // If autoStop is true, we want to immediately stop any current playback
                // before starting the next one to avoid the AbortError
                if (autoStop && audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                    audioRef.current.src = '' // Clear the source
                }

                togglePlay(nextSermon.id!, audioUrl)
            } else {
                // Skip this sermon, continue to next one via timeout to avoid infinite loops
                setTimeout(() => playNextSermon(nextSermon.id!, false), 100)
            }
        } else {
        }
    }

    const togglePlay = async (sermonId: number, audioUrl: string) => {

        if (playingSermonId === sermonId) {
            // Stop current audio completely
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
                audioRef.current.src = '' // Clear source
                // Reset all event listeners
                audioRef.current.onended = null
                audioRef.current.onerror = null
            }
            setPlayingSermonId(null)
        } else {

            // Always create a fresh Audio element to avoid AbortError
            // Existing audio elements can retain pending play requests
            const newAudio = new Audio(audioUrl)

            // Set up event handlers BEFORE playing
            newAudio.onended = () => {
                setTimeout(() => {
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
                audioRef.current.pause()
                audioRef.current.src = ''
                audioRef.current = null
            }

            // Set the new audio as current
            audioRef.current = newAudio

            // Now play the audio
            newAudio.play()
                .then(() => {
                    setPlayingSermonId(sermonId)
                })
                .catch(e => {
                    console.error('💥 Error playing new audio:', e)
                    setSubmitError('Error playing audio')
                })
        }
    }

    // Filter and sort sermons
    const filteredAndSortedSermons = sermons
        .filter(sermon => {
            if (!filterText) return true
            const searchLower = filterText.toLowerCase()
            return (
                sermon.title.toLowerCase().includes(searchLower) ||
                (sermon.preacher && sermon.preacher.toLowerCase().includes(searchLower)) ||
                (sermon.description && sermon.description.toLowerCase().includes(searchLower))
            )
        })
        .sort((a, b) => {
            let comparison = 0

            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    break
                case 'title':
                    comparison = a.title.localeCompare(b.title)
                    break
                case 'preacher':
                    const aPreacher = a.preacher || ''
                    const bPreacher = b.preacher || ''
                    comparison = aPreacher.localeCompare(bPreacher)
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
                                <Label htmlFor="audio" className="text-sm md:text-base font-medium">Audio Files *</Label>
                                <div className="relative">
                                    <Input
                                        id="audio"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,.webm,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/m4a,audio/aac,audio/ogg,audio/webm,audio/flac"
                                        multiple
                                        required
                                        className="text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            Select one or more audio files (MP3, WAV, M4A, AAC, OGG, FLAC, WebM)
                                        </p>
                                    </div>
                                    {formData.audios.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {formData.audios.map((file, index) => (
                                                <div key={index} className="p-3 bg-muted/50 rounded-lg border">
                                                    <div className="flex items-center gap-2">
                                                        <Mic className="w-4 h-4 text-primary" />
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
                                                                    audios: formData.audios.filter((_, i) => i !== index)
                                                                })
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Remove file"
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
                    <p className="text-3xl font-display font-bold text-foreground mt-2">{filteredAndSortedSermons.length}</p>
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
                        {/* Search, Sort, and Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/20 rounded-lg border">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search sermons..."
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'preacher')}
                                    className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                                >
                                    <option value="date">Sort by Date</option>
                                    <option value="title">Sort by Title</option>
                                    <option value="preacher">Sort by Preacher</option>
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
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Preacher</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Uploaded</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedSermons.map((sermon, index) => (
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
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-3">
                                                    {/* Sermon Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => playNextSermon(sermon.id!, true)}
                                                            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                                            title="Play Next"
                                                        >
                                                            <SkipForward className="w-4 h-4 text-primary" />
                                                        </button>
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
                                                                    {isDeleting ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                                    ) : (
                                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                                    )}
                                                                </button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Sermon</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{sermon.title}"? This action cannot be undone and will permanently remove the sermon from the system.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                {isDeleting && (
                                                                    <div className="py-4">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                            <p className="text-sm font-medium">Deleting sermon...</p>
                                                                        </div>
                                                                        <Progress value={75} className="w-full" />
                                                                        <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the sermon and all associated files from the server.</p>
                                                                    </div>
                                                                )}
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteSermon(sermon.id!)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                        disabled={isDeleting}
                                                                    >
                                                                        {isDeleting ? (
                                                                            <>
                                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                                Deleting...
                                                                            </>
                                                                        ) : (
                                                                            "Delete Sermon"
                                                                        )}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>

                                                    {/* Individual Audio Files */}
                                                    {sermon.audios && sermon.audios.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audio Files</p>
                                                            <div className="space-y-1 max-w-xs">
                                                                {sermon.audios.map((audioObj, index) => (
                                                                    <div key={audioObj.id || index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border">
                                                                        <button
                                                                            onClick={() => togglePlay(sermon.id!, audioObj.audio)}
                                                                            className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                                                                                playingSermonId === sermon.id
                                                                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                                                    : 'hover:bg-primary/10 text-primary'
                                                                            }`}
                                                                            title={playingSermonId === sermon.id ? "Pause" : `Play ${getAudioFilename(audioObj.audio)}`}
                                                                        >
                                                                            {playingSermonId === sermon.id ? (
                                                                                <Pause className="w-3 h-3" />
                                                                            ) : (
                                                                                <Play className="w-3 h-3" />
                                                                            )}
                                                                        </button>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-foreground truncate">
                                                                                {getAudioFilename(audioObj.audio)}
                                                                            </p>
                                                                        </div>
                                                                        <a
                                                                            href={audioObj.audio}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-muted-foreground hover:text-primary p-1 rounded transition-colors flex-shrink-0"
                                                                            title="Download/Open"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-3 6V4a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                                                                            </svg>
                                                                        </a>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <button
                                                                                    disabled={isDeletingAudio === audioObj.id}
                                                                                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors flex-shrink-0"
                                                                                    title="Delete audio file"
                                                                                >
                                                                                    {isDeletingAudio === audioObj.id ? (
                                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                                    ) : (
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    )}
                                                                                </button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Delete Audio File</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Are you sure you want to delete this audio file "{getAudioFilename(audioObj.audio)}"? This action cannot be undone.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                {isDeletingAudio === audioObj.id && (
                                                                                    <div className="py-4">
                                                                                        <div className="flex items-center gap-3 mb-2">
                                                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                                            <p className="text-sm font-medium">Deleting audio file...</p>
                                                                                        </div>
                                                                                        <Progress value={75} className="w-full" />
                                                                                        <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the file from the server.</p>
                                                                                    </div>
                                                                                )}
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel disabled={isDeletingAudio === audioObj.id}>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() => handleDeleteAudioFile(sermon.id!, audioObj.id)}
                                                                                        className="bg-red-600 hover:bg-red-700"
                                                                                        disabled={isDeletingAudio === audioObj.id}
                                                                                    >
                                                                                        {isDeletingAudio === audioObj.id ? (
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
                            {filteredAndSortedSermons.map((sermon, index) => (
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
                                                {sermon.audios && sermon.audios.length > 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => togglePlay(sermon.id!, sermon.audios[0].audio)}
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
                                                            {isDeleting ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            )}
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Sermon</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{sermon.title}"? This action cannot be undone and will permanently remove the sermon from the system.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        {isDeleting && (
                                                            <div className="py-4">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                    <p className="text-sm font-medium">Deleting sermon...</p>
                                                                </div>
                                                                <Progress value={75} className="w-full" />
                                                                <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the sermon and all associated files from the server.</p>
                                                            </div>
                                                        )}
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteSermon(sermon.id!)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        Deleting...
                                                                    </>
                                                                ) : (
                                                                    "Delete Sermon"
                                                                )}
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

                                        {/* Audio Files Section */}
                                        {sermon.audios && sermon.audios.length > 0 && (
                                            <div className="pt-2 border-t border-border space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audio Files</p>
                                                <div className="space-y-2">
                                                    {sermon.audios.map((audioObj, index) => (
                                                        <div key={audioObj.id || index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border">
                                                            <button
                                                                onClick={() => togglePlay(sermon.id!, audioObj.audio)}
                                                                className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                                                                    playingSermonId === sermon.id
                                                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                                        : 'hover:bg-primary/10 text-primary'
                                                                }`}
                                                                title={playingSermonId === sermon.id ? "Pause" : `Play ${getAudioFilename(audioObj.audio)}`}
                                                            >
                                                                {playingSermonId === sermon.id ? (
                                                                    <Pause className="w-4 h-4" />
                                                                ) : (
                                                                    <Play className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {getAudioFilename(audioObj.audio)}
                                                                </p>
                                                            </div>
                                                            <a
                                                                href={audioObj.audio}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-muted-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors flex-shrink-0"
                                                                title="Download/Open"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-3 6V4a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                                                                </svg>
                                                            </a>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <button
                                                                        disabled={isDeletingAudio === audioObj.id}
                                                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                                                                        title="Delete audio file"
                                                                    >
                                                                        {isDeletingAudio === audioObj.id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Audio File</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete this audio file "{getAudioFilename(audioObj.audio)}"? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    {isDeletingAudio === audioObj.id && (
                                                                        <div className="py-4">
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                                                <p className="text-sm font-medium">Deleting audio file...</p>
                                                                            </div>
                                                                            <Progress value={75} className="w-full" />
                                                                            <p className="text-xs text-muted-foreground mt-2">Please wait while we remove the file from the server.</p>
                                                                        </div>
                                                                    )}
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel disabled={isDeletingAudio === audioObj.id}>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteAudioFile(sermon.id!, audioObj.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                            disabled={isDeletingAudio === audioObj.id}
                                                                        >
                                                                            {isDeletingAudio === audioObj.id ? (
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

                                        {selectedSermon.audios && selectedSermon.audios.length > 0 && (
                                            <div className="space-y-4">
                                                <Label className="text-sm font-semibold text-primary">
                                                    Audio Files ({selectedSermon.audios.length})
                                                </Label>
                                                <div className="space-y-3">
                                                    {selectedSermon.audios.map((audioObj, index) => (
                                                        <div key={audioObj.id || index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                                                            <div className="flex-shrink-0">
                                                                <button
                                                                    onClick={() => togglePlay(selectedSermon!.id, audioObj.audio)}
                                                                    className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                                                                    title={playingSermonId === selectedSermon!.id ? "Pause" : "Play"}
                                                                >
                                                                    {playingSermonId === selectedSermon!.id ? (
                                                                        <Pause className="w-5 h-5 text-primary" />
                                                                    ) : (
                                                                        <Play className="w-5 h-5 text-primary" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {getAudioFilename(audioObj.audio)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Audio File {index + 1}
                                                                </p>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <a
                                                                    href={audioObj.audio}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:text-primary/80 p-2 rounded-full hover:bg-primary/10 transition-colors"
                                                                    title="Download/Open in new tab"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2v6m0-6l-2-2m2 2l2-2m0 6V4a2 2 0 012-2h4a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                                                                    </svg>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedSermon.audios && selectedSermon.audios.length === 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-primary">Audio Files</Label>
                                                <p className="text-base text-muted-foreground">No audio files available</p>
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

                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Add New Audio Files</Label>
                                        <p className="text-sm text-muted-foreground">Upload additional audio files to this sermon</p>

                                        <div>
                                            <Label htmlFor="edit-audios" className="text-sm font-medium">Add Audio Files</Label>
                                            <div className="mt-1">
                                                <Input
                                                    id="edit-audios"
                                                    type="file"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || [])
                                                        setEditFormData({ ...editFormData, audios: files })
                                                    }}
                                                    accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,.webm,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/m4a,audio/aac,audio/ogg,audio/webm,audio/flac"
                                                    multiple
                                                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:cursor-pointer file:transition-colors"
                                                />
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Mic className="w-4 h-4 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">
                                                        Select additional audio files (MP3, WAV, M4A, AAC, OGG, FLAC, WebM)
                                                    </p>
                                                </div>
                                            </div>
                                            {editFormData.audios.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    {editFormData.audios.map((file, index) => (
                                                        <div key={`new-audio-${index}`} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <Mic className="w-4 h-4 text-green-600" />
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
                                                                            audios: editFormData.audios.filter((_, i) => i !== index)
                                                                        })
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 p-1"
                                                                    title="Remove audio"
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
