"use client"

import { Card } from "@/components/ui/card"
import { Trash2, Edit, Plus } from "lucide-react"
import { useState } from "react"

const contentPages = [
  { id: 1, title: "About Pastor Uche", status: "Published", lastUpdated: "2025-01-15" },
  { id: 2, title: "Our Vision", status: "Published", lastUpdated: "2025-01-10" },
  { id: 3, title: "Statement of Faith", status: "Draft", lastUpdated: "2025-01-18" },
  { id: 4, title: "Ministry History", status: "Published", lastUpdated: "2025-01-05" },
]

export default function ContentManagement() {
  const [showForm, setShowForm] = useState(false)
  const [pages, setPages] = useState(contentPages)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Content Pages</h1>
          <p className="text-muted-foreground">Manage About, Vision, Faith, and other content pages</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Page
        </button>
      </div>

      {/* Content Form */}
      {showForm && (
        <Card className="p-6 glass-card border-2 border-primary/20">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">Create New Content Page</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Page Title</label>
              <input
                type="text"
                placeholder="Enter page title"
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Content</label>
              <textarea
                placeholder="Enter content (supports rich text)"
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button className="btn-primary">Save Page</button>
              <button onClick={() => setShowForm(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Content List */}
      <Card className="p-6 glass-card border-2 border-primary/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Last Updated</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4 text-sm text-foreground font-medium">{page.title}</td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${page.status === "Published" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{page.lastUpdated}</td>
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
