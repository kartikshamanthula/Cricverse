"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Plus, Pencil, Trash2, ChevronLeft, Package, Search,
    CheckCircle2, XCircle, AlertCircle, LayoutGrid, List,
    ImageOff, ToggleLeft, ToggleRight, Loader2, Upload, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Image from "next/image"

const CATEGORIES = ['Bats', 'Balls', 'Leg Guard', 'Gloves', 'T-shirt', 'Footwear', 'Accessories']

const CATEGORY_IMAGES = {
    Bats: '/images/cricket_bat_product.png',
    Balls: '/images/cricket_ball_product.png',
    LegGuard: '/images/cricket_gloves_product.png',
    Gloves: '/images/cricket_gloves_product.png',
    Clothing: '/images/cricket_jersey_product.png',
    Footwear: '/images/cricket_shoes_product.png',
    Accessories: '/images/cricket_pads_product.png',
}

const EMPTY_FORM = {
    name: '', description: '', price: '', category: 'Bats',
    rating: '4.0', stock: '0', image: '', isActive: true,
}

export default function AdminProductsPage() {
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('All')
    const [view, setView] = useState('grid') // 'grid' | 'list'

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editProduct, setEditProduct] = useState(null)    // null = create
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [imageFile, setImageFile] = useState(null)         // selected File object
    const [imagePreview, setImagePreview] = useState('')     // local object URL
    const [imageUploading, setImageUploading] = useState(false)

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    // ── fetch ────────────────────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/products')
            if (!res.ok) throw new Error('Failed to load products')
            setProducts(await res.json())
        } catch (e) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    // ── filtered list ─────────────────────────────────────────────────────────
    const visible = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase())
        const matchCat = filterCat === 'All' || p.category === filterCat
        return matchSearch && matchCat
    })

    // ── dialog helpers ────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditProduct(null)
        setForm(EMPTY_FORM)
        setImageFile(null)
        setImagePreview('')
        setDialogOpen(true)
    }

    const openEdit = (p) => {
        setEditProduct(p)
        setForm({
            name: p.name, description: p.description,
            price: String(p.price), category: p.category,
            rating: String(p.rating ?? 4.0), stock: String(p.stock ?? 0),
            image: p.image ?? '', isActive: p.isActive ?? true,
        })
        setImageFile(null)
        setImagePreview('')
        setDialogOpen(true)
    }

    const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleImageFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview('')
        handleFormChange('image', '')
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.description.trim() || !form.price || !form.category) {
            toast.error('Please fill in all required fields')
            return
        }
        setSaving(true)
        try {
            let imageUrl = form.image || null

            // Upload new file if selected
            if (imageFile) {
                setImageUploading(true)
                const fd = new FormData()
                fd.append('file', imageFile)
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
                if (!uploadRes.ok) throw new Error((await uploadRes.json()).error || 'Image upload failed')
                const { url: uploadedUrl } = await uploadRes.json()
                imageUrl = uploadedUrl
                setImageUploading(false)
            }

            const payload = {
                ...form,
                price: Number(form.price),
                rating: Number(form.rating),
                stock: Number(form.stock),
                image: imageUrl,
            }
            const url = editProduct ? `/api/products/${editProduct._id}` : '/api/products'
            const method = editProduct ? 'PATCH' : 'POST'
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
            toast.success(editProduct ? 'Product updated!' : 'Product created!')
            setDialogOpen(false)
            fetchProducts()
        } catch (e) {
            toast.error(e.message)
            setImageUploading(false)
        } finally {
            setSaving(false)
        }
    }

    // ── delete ────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/products/${deleteTarget._id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            toast.success(`"${deleteTarget.name}" deleted`)
            setDeleteTarget(null)
            fetchProducts()
        } catch (e) {
            toast.error(e.message)
        } finally {
            setDeleting(false)
        }
    }

    // ── toggle active ─────────────────────────────────────────────────────────
    const handleToggleActive = async (p) => {
        try {
            const res = await fetch(`/api/products/${p._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !p.isActive }),
            })
            if (!res.ok) throw new Error('Toggle failed')
            toast.success(`"${p.name}" ${!p.isActive ? 'activated' : 'deactivated'}`)
            fetchProducts()
        } catch (e) {
            toast.error(e.message)
        }
    }

    // ── stats ─────────────────────────────────────────────────────────────────
    const totalActive = products.filter(p => p.isActive).length
    const totalValue = products.reduce((s, p) => s + (p.price * (p.stock || 0)), 0)

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                            <Package className="h-7 w-7 text-primary" />
                            Product Management
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Add, edit, and manage store products</p>
                    </div>
                </div>
                <Button onClick={openCreate} className="gap-2 shadow-lg shadow-primary/20 shrink-0">
                    <Plus className="h-4 w-4" /> Add Product
                </Button>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-500' },
                    { label: 'Active', value: totalActive, icon: CheckCircle2, color: 'text-green-500' },
                    { label: 'Inactive', value: products.length - totalActive, icon: XCircle, color: 'text-red-400' },
                    { label: 'Inventory Value', value: `₹${totalValue.toLocaleString()}`, icon: AlertCircle, color: 'text-amber-500' },
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

            {/* ── Filters bar ── */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {['All', ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterCat === cat
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                    <div className="flex items-center gap-1 ml-1 border rounded-lg overflow-hidden">
                        <button onClick={() => setView('grid')} className={`p-1.5 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button onClick={() => setView('list')} className={`p-1.5 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Product Grid ── */}
            {loading ? (
                <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading products...
                </div>
            ) : visible.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-semibold">No products found</p>
                    <Button variant="link" onClick={() => { setSearch(''); setFilterCat('All') }}>Clear filters</Button>
                </div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {visible.map(p => (
                        <Card key={p._id} className={`group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${!p.isActive ? 'opacity-50' : ''}`}>
                            <div className="h-40 relative bg-muted/30 flex items-center justify-center overflow-hidden">
                                {p.image ? (
                                    <Image src={p.image} alt={p.name} width={300} height={300} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <ImageOff className="h-12 w-12 text-muted-foreground/30" />
                                )}
                                <div className="absolute top-2 left-2 flex gap-1">
                                    <Badge variant={p.isActive ? 'default' : 'secondary'} className="text-[10px]">
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur">
                                        ⭐ {p.rating}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{p.category}</p>
                                <h3 className="font-bold text-sm leading-snug line-clamp-1 mt-0.5">{p.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-base font-black">₹{p.price.toLocaleString()}</span>
                                    <span className="text-xs text-muted-foreground">Stock: {p.stock ?? 0}</span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => openEdit(p)}>
                                        <Pencil className="h-3 w-3" /> Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" className="px-2" onClick={() => handleToggleActive(p)}
                                        title={p.isActive ? 'Deactivate' : 'Activate'}>
                                        {p.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-red-500" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="px-2 hover:bg-red-500/10 hover:text-red-500" onClick={() => setDeleteTarget(p)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* ── List view ── */
                <Card>
                    <div className="divide-y divide-border">
                        {visible.map(p => (
                            <div key={p._id} className={`flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                                <div className="w-14 h-14 rounded-lg bg-muted/40 overflow-hidden shrink-0">
                                    {p.image ? <Image src={p.image} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                                        : <ImageOff className="h-6 w-6 m-auto mt-4 text-muted-foreground/30" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-sm truncate">{p.name}</p>
                                        <Badge variant="outline" className="text-[10px] shrink-0">{p.category}</Badge>
                                        <Badge variant={p.isActive ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                                            {p.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-black text-base">₹{p.price.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Stock: {p.stock ?? 0}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8 p-0">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleToggleActive(p)} className="h-8 w-8 p-0">
                                        {p.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-red-500" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(p)}
                                        className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* ═══════════════════════════════════════════════
                ADD / EDIT DIALOG
            ═══════════════════════════════════════════════ */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            {editProduct ? 'Edit Product' : 'New Product'}
                        </DialogTitle>
                        <DialogDescription>
                            {editProduct ? 'Update the product details below.' : 'Fill in the details to add a new product to the store.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Name */}
                        <div>
                            <label className="text-sm font-semibold mb-1.5 block">Product Name <span className="text-red-500">*</span></label>
                            <Input placeholder="e.g. English Willow Grade 1 Bat" value={form.name}
                                onChange={e => handleFormChange('name', e.target.value)} />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-semibold mb-1.5 block">Description <span className="text-red-500">*</span></label>
                            <textarea
                                rows={3}
                                placeholder="Describe the product..."
                                value={form.description}
                                onChange={e => handleFormChange('description', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-sm font-semibold mb-1.5 block">Category <span className="text-red-500">*</span></label>
                            <select
                                value={form.category}
                                onChange={e => handleFormChange('category', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Price + Stock row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block">Price (₹) <span className="text-red-500">*</span></label>
                                <Input type="number" min="0" placeholder="1999" value={form.price}
                                    onChange={e => handleFormChange('price', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block">Stock (units)</label>
                                <Input type="number" min="0" placeholder="0" value={form.stock}
                                    onChange={e => handleFormChange('stock', e.target.value)} />
                            </div>
                        </div>

                        {/* Rating + Active row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block">Rating (0–5)</label>
                                <Input type="number" min="0" max="5" step="0.1" placeholder="4.0" value={form.rating}
                                    onChange={e => handleFormChange('rating', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-semibold mb-1.5 block">Status</label>
                                <button
                                    type="button"
                                    onClick={() => handleFormChange('isActive', !form.isActive)}
                                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-md border text-sm font-medium transition-colors ${form.isActive
                                        ? 'border-green-500 bg-green-500/10 text-green-600'
                                        : 'border-border bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {form.isActive
                                        ? <><ToggleRight className="h-4 w-4" /> Active</>
                                        : <><ToggleLeft className="h-4 w-4" /> Inactive</>}
                                </button>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-semibold mb-1.5 block">Product Image
                                <span className="text-muted-foreground font-normal ml-1">(leave blank to use category default)</span>
                            </label>

                            {/* Preview */}
                            {(imagePreview || form.image) && (
                                <div className="relative mb-3 w-24 h-24 rounded-xl overflow-hidden border-2 border-border shadow-sm group">
                                    <Image
                                        src={imagePreview || form.image}
                                        alt="Preview"
                                        width={96} height={96}
                                        className="object-cover w-full h-full"
                                        onError={() => { }}
                                    />
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {/* Upload button */}
                            <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 rounded-lg border-2 border-dashed border-border hover:border-primary/60 hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground">
                                <Upload className="h-4 w-4" />
                                {imageFile ? imageFile.name : 'Choose image file'}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                    className="hidden"
                                    onChange={handleImageFileChange}
                                />
                            </label>
                            <p className="text-[11px] text-muted-foreground mt-1.5">JPEG, PNG, WebP, GIF — max 5 MB</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[100px]">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editProduct ? 'Save Changes' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ═══════════════════════════════════════
                DELETE CONFIRM DIALOG
            ═══════════════════════════════════════ */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <Trash2 className="h-5 w-5" /> Delete Product
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete{' '}
                            <strong>&quot;{deleteTarget?.name}&quot;</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
                            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
