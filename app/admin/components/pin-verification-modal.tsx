'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface PinVerificationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function PinVerificationModal({ isOpen, onClose, onSuccess }: PinVerificationModalProps) {
    const [pin, setPin] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/admin/verify-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pin }),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success('PIN verified successfully!')
                localStorage.setItem('admin_authorized', 'true')
                localStorage.setItem('admin_auth_time', Date.now().toString())
                onSuccess()
            } else {
                toast.error(result.error || 'Invalid PIN')
                setPin('')
            }
        } catch (error) {
            toast.error('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center">Admin Access Required</DialogTitle>
                    <DialogDescription className="text-center">
                        Please enter the admin PIN to continue
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Enter PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={6}
                            className="text-center text-lg font-mono"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isLoading || !pin.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify PIN'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
