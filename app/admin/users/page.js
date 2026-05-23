"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Users, Pencil, Trash2, Search,
    CheckCircle2, XCircle, Shield, User,
    ToggleLeft, ToggleRight, Loader2, X, MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterRole, setFilterRole] = useState('All')
    const [filterStatus, setFilterStatus] = useState('All')

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editUser, setEditUser] = useState(null)
    const [form, setForm] = useState({
        name: '',
        username: '',
        role: 'user',
        permissions: {
            liveScoreInternational: true,
            liveScoreLocal: true,
            teamModule: true,
            matchModule: true,
            tournamentModule: true,
            storeModule: true
        }
    })
    const [saving, setSaving] = useState(false)

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            if (!res.ok) throw new Error('Failed to load users')
            setUsers(await res.json())
        } catch (e) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    const visible = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase())
        const matchRole = filterRole === 'All' || u.role === filterRole
        const matchStatus = filterStatus === 'All' || (filterStatus === 'Active' ? u.isActive !== false : u.isActive === false)
        return matchSearch && matchRole && matchStatus
    })

    const openEdit = (u) => {
        setEditUser(u)
        setForm({
            name: u.name,
            username: u.username,
            role: u.role,
            permissions: u.permissions ?? {
                liveScoreInternational: true,
                liveScoreLocal: true,
                teamModule: true,
                matchModule: true,
                tournamentModule: true,
                storeModule: true
            }
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.username.trim()) {
            toast.error('Please fill in name and username')
            return
        }
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/users/${editUser._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error('Save failed')
            toast.success('User updated!')
            setDialogOpen(false)
            fetchUsers()
        } catch (e) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const toggleStatus = async (u) => {
        try {
            const res = await fetch(`/api/admin/users/${u._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !u.isActive }),
            })
            if (!res.ok) throw new Error('Action failed')
            toast.success(`User ${!u.isActive ? 'enabled' : 'disabled'}`)
            fetchUsers()
        } catch (e) {
            toast.error(e.message)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/users/${deleteTarget._id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            toast.success('User deleted')
            setDeleteTarget(null)
            fetchUsers()
        } catch (e) {
            toast.error(e.message)
        } finally {
            setDeleting(false)
        }
    }

    const totalAdmins = users.filter(u => u.role === 'admin').length
    const activeUsers = users.filter(u => u.isActive !== false).length

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                        <Users className="h-7 w-7 text-primary" />
                        User Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor website accounts</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
                    { label: 'Admins', value: totalAdmins, icon: Shield, color: 'text-purple-500' },
                    { label: 'Active', value: activeUsers, icon: CheckCircle2, color: 'text-green-500' },
                    { label: 'Inactive', value: users.length - activeUsers, icon: XCircle, color: 'text-red-400' },
                ].map(stat => (
                    <Card key={stat.label} className="border-border/50">
                        <CardContent className="p-4 flex items-center gap-3">
                            <stat.icon className={`h-8 w-8 ${stat.color} shrink-0`} />
                            <div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-xl font-black">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or username..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="bg-background border border-input rounded-md px-3 py-1 text-sm h-10 outline-hidden focus:ring-2 focus:ring-primary"
                    >
                        <option value="All">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-background border border-input rounded-md px-3 py-1 text-sm h-10 outline-hidden focus:ring-2 focus:ring-primary"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* User List */}
            <Card className="overflow-hidden border-border/50">
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading users...
                    </div>
                ) : visible.length === 0 ? (
                    <div className="text-center py-24 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-semibold">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                                <tr>
                                    <th className="px-6 py-4 font-bold">User</th>
                                    <th className="px-6 py-4 font-bold">Role</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Joined / Usage</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {visible.map(u => (
                                    <tr key={u._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{u.name}</p>
                                                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {u.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={u.isActive !== false ? 'success' : 'destructive'} className="gap-1">
                                                {u.isActive !== false ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {u.isActive !== false ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div>{new Date(u.createdAt).toLocaleDateString()}</div>
                                            <div className="text-xs font-semibold text-primary mt-1">
                                                Using Since: {Math.max(0, Math.floor((new Date() - new Date(u.createdAt)) / (1000 * 60 * 60 * 24)))} Days
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => openEdit(u)} className="h-8 w-8">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => toggleStatus(u)} className="h-8 w-8">
                                                    {u.isActive !== false ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(u)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user information and permissions.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Full Name</label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Username</label>
                            <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Role</label>
                            <select
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        
                        {/* Custom Dynamic Permissions Section */}
                        <div className="space-y-3 border-t border-border/60 pt-4">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Module Permissions</h3>
                                <p className="text-[11px] text-muted-foreground">Manage which features are visible and accessible to this user.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                                {[
                                    { key: 'liveScoreInternational', label: 'Live Score International', desc: 'Allow viewing international scores' },
                                    { key: 'liveScoreLocal', label: 'Live Score Local Matches', desc: 'Allow viewing local matches' },
                                    { key: 'teamModule', label: 'Team Module', desc: 'Access /teams pages' },
                                    { key: 'matchModule', label: 'Match Module', desc: 'Access /matches pages' },
                                    { key: 'tournamentModule', label: 'Tournament Module', desc: 'Access /tournaments pages' },
                                    { key: 'storeModule', label: 'Store Module', desc: 'Access /store pages' },
                                ].map((item) => {
                                    const checked = form.permissions?.[item.key] ?? true;
                                    return (
                                        <div
                                            key={item.key}
                                            onClick={() => {
                                                setForm({
                                                    ...form,
                                                    permissions: {
                                                        ...(form.permissions ?? {}),
                                                        [item.key]: !checked
                                                    }
                                                });
                                            }}
                                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 select-none hover:bg-muted/30 ${
                                                checked
                                                    ? 'border-primary/50 bg-primary/5 shadow-xs shadow-primary/5'
                                                    : 'border-border bg-card'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                readOnly
                                                className="mt-0.5 h-3.5 w-3.5 rounded-sm border-input text-primary focus:ring-primary/20 cursor-pointer"
                                            />
                                            <div className="flex flex-col leading-none">
                                                <span className={`text-[12px] font-bold ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                                                <span className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Delete User Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong> (@{deleteTarget?.username})?
                            This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
