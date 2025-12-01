"use client"

import { Card } from "@/components/ui/card"
import { Trash2, Edit, Plus, CheckCircle, Clock } from "lucide-react"
import { useState } from "react"

const testimonies = [
  {
    id: 1,
    title: "My Healing Journey",
    author: "Chioma Okafor",
    type: "Text",
    status: "Pending",
    submitted: "2025-01-18",
  },
  { id: 2, title: "God's Provision", author: "John Eze", type: "Video", status: "Approved", submitted: "2025-01-15" },
  {
    id: 3,
    title: "Life Changed",
    author: "Blessing Nwankwo",
    type: "Image",
    status: "Pending",
    submitted: "2025-01-16",
  },
]

export default function TestimoniesManagement() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Testimonies</h1>
          <p className="text-muted-foreground">Manage written, photo, and video testimonies with moderation workflow</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Testimony
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Pending Review</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">2</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Approved</p>
          <p className="text-3xl font-display font-bold text-primary mt-2">18</p>
        </Card>
        <Card className="p-4 glass-card border-2 border-primary/20">
          <p className="text-muted-foreground text-sm">Total Testimonies</p>
          <p className="text-3xl font-display font-bold text-foreground mt-2">20</p>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 glass-card border-2 border-primary/20">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">Add New Testimony</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Testimony title"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Author Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type</label>
              <select className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Text</option>
                <option>Photo</option>
                <option>Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Content</label>
              <textarea
                placeholder="Share the testimony..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-32"
              />
            </div>
            <div className="flex gap-3">
              <button className="btn-primary">Save Testimony</button>
              <button onClick={() => setShowForm(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Testimonies List */}
      <Card className="p-6 glass-card border-2 border-primary/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Author</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Submitted</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonies.map((testimony) => (
                <tr key={testimony.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4 text-sm text-foreground font-medium">{testimony.title}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{testimony.author}</td>
                  <td className="px-4 py-4 text-sm text-foreground">{testimony.type}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {testimony.status === "Approved" ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-accent" />
                      )}
                      <span>{testimony.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{testimony.submitted}</td>
                  <td className="px-4 py-4 flex items-center justify-center gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-primary" />
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
      </Card>
    </div>
  )
}
