"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { 
    Search, MapPin, Calendar, Clock, Star, Sparkles, Navigation, Phone, 
    ExternalLink, AlertCircle, X, Info, Flame, Building2, CheckCircle2, ChevronRight, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useCart } from "@/contexts/CartContext"

// SURAT CITY SPECIFIC AREAS (ALL NEIGHBORHOODS)
const SURAT_AREAS = [
    "All", 
    "Vesu", 
    "Adajan", 
    "Varachha", 
    "Dindoli",
    "Godadara",
    "Puna Gam",
    "Parvat Patia",
    "Pandesara",
    "Amroli",
    "Palanpur", 
    "VIP Road", 
    "Althan", 
    "Piplod", 
    "Katargam", 
    "Bhatar",
    "City Light",
    "Sarthana",
    "Dumas Road",
    "Rander",
    "Jahangirpura",
    "Kamrej"
]

const VENUE_TYPES = [
    { id: "All", label: "All Venues" },
    { id: "Box Cricket Turf", label: "Box Cricket Turf" },
    { id: "Full Ground", label: "Full Match Ground" },
    { id: "Practice Nets", label: "Practice Nets" },
    { id: "Indoor Arena", label: "Indoor AC Arena" }
]

export default function GroundsPage() {
    const { addToCart, setIsCartOpen } = useCart()

    const [grounds, setGrounds] = useState([])
    const [loading, setLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedArea, setSelectedArea] = useState("All")
    const [selectedType, setSelectedType] = useState("All")

    // Booking Modal State
    const [selectedGround, setSelectedGround] = useState(null)
    const [activeTab, setActiveTab] = useState("slots") // 'slots' | 'details' | 'map'
    const [bookingDate, setBookingDate] = useState(() => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    })
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [bookingLoading, setBookingLoading] = useState(false)

    useEffect(() => {
        fetchGrounds()
    }, [selectedArea, selectedType])

    const fetchGrounds = async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams()
            if (selectedArea !== 'All') queryParams.append('area', selectedArea)
            if (selectedType !== 'All') queryParams.append('type', selectedType)
            if (searchQuery) queryParams.append('search', searchQuery)

            const res = await fetch(`/api/grounds?${queryParams.toString()}`)
            const data = await res.json()

            if (data.success) {
                setGrounds(data.grounds || [])
            }
        } catch (err) {
            console.error("Failed to load Surat grounds:", err)
            toast.error("Failed to load Surat grounds")
        } finally {
            setLoading(false)
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        fetchGrounds()
    }

    const openBookingModal = (ground) => {
        setSelectedGround(ground)
        setSelectedSlot(null)
        setActiveTab("slots")
    }

    const handleConfirmBooking = async () => {
        if (!selectedSlot) {
            toast.error("Please select a time slot first!")
            return
        }

        try {
            setBookingLoading(true)
            const res = await fetch('/api/grounds/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groundId: selectedGround._id,
                    slotId: selectedSlot.id,
                    bookingDate: bookingDate
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to book slot')
            }

            // Add as custom ground booking product into Cart
            const groundCartProduct = {
                _id: `ground-booking-${Date.now()}`,
                name: `${selectedGround.name} (${selectedSlot.label})`,
                category: "Surat Turf Booking",
                price: selectedSlot.price,
                quantity: 1,
                isCustom: true,
                customSpecs: {
                    venueType: selectedGround.type,
                    address: selectedGround.location.address,
                    area: selectedGround.location.area || "Surat",
                    city: "Surat",
                    bookingDate: bookingDate,
                    slotTime: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
                    managerPhone: selectedGround.contactPhone
                }
            }

            addToCart(groundCartProduct)

            toast.success("Surat Turf Slot Reserved!", {
                description: `${selectedGround.name} reserved for ${bookingDate} (${selectedSlot.startTime} - ${selectedSlot.endTime}).`
            })

            setSelectedGround(null)
            setIsCartOpen(true)
            fetchGrounds() // refresh slot status

        } catch (err) {
            console.error("Booking error:", err)
            toast.error(err.message || "Failed to complete booking")
        } finally {
            setBookingLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-16 overflow-x-hidden">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                
                {/* RESPONSIVE PAGE TITLE & SEARCH HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-6">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-bold text-xs uppercase tracking-wider">
                                <MapPin className="w-3.5 h-3.5 mr-1" /> Surat Turf Network
                            </Badge>
                            <Badge variant="secondary" className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                25+ Live Venues
                            </Badge>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">Cricket Turfs</h1>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Book local box cricket turfs, nets, and grounds across Surat with instant slot confirmation.
                        </p>
                    </div>

                    {/* SEARCH INPUT */}
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Turf Name, Area (Vesu, Dindoli), or Landmark..."
                                className="pl-9 h-10 text-xs sm:text-sm rounded-xl"
                            />
                        </div>
                        <Button type="submit" size="default" className="font-bold rounded-xl shrink-0">
                            Search
                        </Button>
                    </form>
                </div>

                {/* SURAT AREA FILTER HORIZONTAL SCROLLBAR */}
                <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" /> Filter by Surat Neighborhood Area:
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
                        {SURAT_AREAS.map((area) => (
                            <button
                                key={area}
                                onClick={() => setSelectedArea(area)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${selectedArea === area ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"}`}
                            >
                                {area}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CATEGORY TABS SELECTOR */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                    <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full sm:w-auto overflow-x-auto">
                        <TabsList className="bg-muted p-1 rounded-xl flex w-max sm:w-auto">
                            {VENUE_TYPES.map((t) => (
                                <TabsTrigger key={t.id} value={t.id} className="text-xs font-bold px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap">
                                    {t.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="text-xs text-muted-foreground font-medium">
                        Showing <span className="font-bold text-foreground">{grounds.length}</span> active venues in <span className="text-primary font-bold">{selectedArea === 'All' ? 'Surat City' : selectedArea}</span>
                    </div>
                </div>

                {/* RESPONSIVE LOADING SKELETON */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-96 bg-muted/40 rounded-2xl animate-pulse border border-border" />
                        ))}
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && grounds.length === 0 && (
                    <div className="py-12 sm:py-16 text-center space-y-4 border border-dashed border-border rounded-2xl bg-card p-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold">No Turfs Found in {selectedArea === 'All' ? 'Surat' : selectedArea}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                            No active venues match your current filter selection. Try resetting search filters.
                        </p>
                        <Button variant="outline" onClick={() => { setSelectedArea('All'); setSelectedType('All'); setSearchQuery(''); }}>
                            Reset All Filters
                        </Button>
                    </div>
                )}

                {/* TURF CARDS RESPONSIVE GRID (1 COL MOBILE, 2 COLS TABLET, 3 COLS LAPTOP/DESKTOP) */}
                {!loading && grounds.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {grounds.map((ground) => (
                            <Card key={ground._id} className="group overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between rounded-2xl">
                                <CardContent className="p-0 flex flex-col justify-between h-full">
                                    <div>
                                        {/* Responsive Aspect Ratio Image Banner */}
                                        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-muted">
                                            <Image
                                                src={ground.images?.[0] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"}
                                                alt={ground.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            
                                            {/* Top Tags */}
                                            <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
                                                <Badge className="bg-black/80 backdrop-blur-md border border-white/20 text-white font-bold text-[11px] px-2.5 py-0.5">
                                                    {ground.type}
                                                </Badge>
                                                <Badge className="bg-primary text-primary-foreground font-bold text-[11px] px-2.5 py-0.5">
                                                    {ground.location.area || "Surat"}
                                                </Badge>
                                            </div>

                                            {/* Rating Badge */}
                                            <div className="absolute top-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1 border border-white/20">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                {ground.rating} <span className="text-slate-400 font-normal">({ground.reviewsCount})</span>
                                            </div>

                                            {/* Price Tag */}
                                            <div className="absolute bottom-2.5 left-2.5 z-10 text-white">
                                                <span className="text-xl sm:text-2xl font-black">₹{ground.pricePerHour}</span>
                                                <span className="text-xs text-slate-300 font-medium"> / hour</span>
                                            </div>
                                        </div>

                                        {/* Card Info */}
                                        <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                                            <div>
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-primary mb-1 uppercase tracking-wider">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    <span>{ground.location.area || "Surat"} Box Turf</span>
                                                </div>
                                                <h3 className="text-base sm:text-xl font-extrabold line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                                                    {ground.name}
                                                </h3>
                                                <div className="flex items-start text-xs text-muted-foreground mt-1.5 gap-1">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                                                    <span className="line-clamp-2 font-medium">{ground.location.address}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {ground.description}
                                            </p>

                                            {/* Amenities Badges */}
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {ground.amenities?.slice(0, 4).map((amenity) => (
                                                    <Badge key={amenity} variant="secondary" className="text-[10px] font-semibold bg-muted/70 text-muted-foreground border-0">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                                {ground.amenities?.length > 4 && (
                                                    <Badge variant="secondary" className="text-[10px] font-semibold">
                                                        +{ground.amenities.length - 4} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Responsive Footer Buttons */}
                                    <div className="p-4 sm:p-5 pt-0 flex gap-2">
                                        <a
                                            href={`tel:${ground.contactPhone}`}
                                            className="p-2.5 sm:p-3 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors flex items-center justify-center shrink-0"
                                            title="Call Manager"
                                        >
                                            <Phone className="w-4 h-4 text-primary" />
                                        </a>
                                        <Button
                                            onClick={() => openBookingModal(ground)}
                                            className="flex-1 font-bold rounded-xl text-xs sm:text-sm h-10 sm:h-11"
                                        >
                                            <Calendar className="w-4 h-4 mr-2" /> Book Time Slot
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* RESPONSIVE BOOKING DRAWER MODAL (MOBILE, TABLET, LAPTOP) */}
            {selectedGround && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        
                        {/* Drawer Header */}
                        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="bg-primary text-primary-foreground font-bold text-xs">
                                        {selectedGround.location.area}, Surat
                                    </Badge>
                                    <Badge variant="outline" className="text-xs font-bold border-primary/50 text-primary">
                                        {selectedGround.type}
                                    </Badge>
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold line-clamp-1">{selectedGround.name}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedGround(null)}
                                className="p-2 rounded-full bg-muted/60 hover:bg-muted text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="px-4 sm:px-5 border-b border-border bg-card flex items-center gap-3 sm:gap-6 text-xs font-bold text-muted-foreground overflow-x-auto">
                            <button
                                onClick={() => setActiveTab("slots")}
                                className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === "slots" ? "border-primary text-primary font-extrabold" : "border-transparent hover:text-foreground"}`}
                            >
                                <Clock className="w-4 h-4" /> 1. Select Time Slot
                            </button>
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === "details" ? "border-primary text-primary font-extrabold" : "border-transparent hover:text-foreground"}`}
                            >
                                <Info className="w-4 h-4" /> 2. Specs & Amenities
                            </button>
                            <button
                                onClick={() => setActiveTab("map")}
                                className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === "map" ? "border-primary text-primary font-extrabold" : "border-transparent hover:text-foreground"}`}
                            >
                                <Navigation className="w-4 h-4" /> 3. Live Google Map
                            </button>
                        </div>

                        {/* TAB 1: SLOTS */}
                        {activeTab === "slots" && (
                            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
                                
                                {/* Date Picker */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-primary" /> Select Booking Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-10 text-xs sm:text-sm font-bold max-w-xs"
                                    />
                                </div>

                                {/* Slot Matrix */}
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Slots ({selectedGround.timeSlots?.length || 0})</span>
                                        <span className="text-primary font-mono text-xs font-bold">Base Rate: ₹{selectedGround.pricePerHour}/hr</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                        {selectedGround.timeSlots?.map((slot) => (
                                            <button
                                                key={slot.id}
                                                disabled={slot.isBooked}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`p-3.5 sm:p-4 rounded-xl text-left border transition-all flex items-center justify-between ${slot.isBooked ? "bg-muted/40 border-border opacity-50 cursor-not-allowed" : selectedSlot?.id === slot.id ? "bg-primary/10 border-primary text-primary ring-2 ring-primary shadow-sm" : "bg-card border-border hover:border-primary/50 hover:bg-muted/30"}`}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-xs sm:text-sm text-foreground">{slot.startTime} - {slot.endTime}</span>
                                                        {slot.isPeak && (
                                                            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold px-1.5 py-0">
                                                                <Flame className="w-3 h-3 mr-0.5 fill-amber-500" /> PEAK
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{slot.label}</div>
                                                </div>

                                                <div className="text-right">
                                                    {slot.isBooked ? (
                                                        <Badge variant="outline" className="text-destructive border-destructive/40 text-[10px] font-bold">
                                                            BOOKED
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm sm:text-base font-black text-primary">₹{slot.price}</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: SPECS */}
                        {activeTab === "details" && (
                            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About Turf Arena</h4>
                                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{selectedGround.description}</p>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-border">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Included Amenities</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {selectedGround.amenities?.map((amenity) => (
                                            <div key={amenity} className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-muted/40 text-xs font-semibold">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span className="truncate">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3.5 sm:p-4 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                                    <div>
                                        <div className="text-[11px] text-muted-foreground font-semibold">Venue Manager</div>
                                        <div className="text-xs sm:text-sm font-bold text-foreground">{selectedGround.managerName}</div>
                                    </div>
                                    <div className="text-right text-xs font-bold text-primary flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" /> {selectedGround.contactPhone}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: MAP */}
                        {activeTab === "map" && (
                            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h4 className="text-sm sm:text-base font-bold">{selectedGround.location.address}</h4>
                                        <p className="text-xs text-muted-foreground">{selectedGround.location.area}, Surat, Gujarat</p>
                                    </div>
                                    <a
                                        href={selectedGround.location.googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center text-xs font-bold text-primary hover:underline gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/30 w-full sm:w-auto"
                                    >
                                        <Navigation className="w-3.5 h-3.5" /> Get Directions <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>

                                <div className="w-full h-56 sm:h-80 rounded-xl overflow-hidden border border-border shadow-inner relative bg-muted">
                                    {selectedGround.location.iframeSrc ? (
                                        <iframe
                                            src={selectedGround.location.iframeSrc}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 text-muted-foreground">
                                            <MapPin className="w-8 h-8 text-primary" />
                                            <div className="text-sm font-bold text-foreground">{selectedGround.location.address}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Responsive Modal Footer */}
                        <div className="p-4 sm:p-5 border-t border-border bg-muted/30 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-[11px] text-muted-foreground font-semibold">Total Price</div>
                                <div className="text-xl sm:text-2xl font-black text-primary">
                                    ₹{selectedSlot ? selectedSlot.price : selectedGround.pricePerHour}
                                </div>
                            </div>

                            <Button
                                onClick={handleConfirmBooking}
                                disabled={!selectedSlot || bookingLoading}
                                size="default"
                                className="font-bold rounded-xl px-6 sm:px-8 h-10 sm:h-11"
                            >
                                {bookingLoading ? "Reserving Slot..." : "Confirm & Reserve Slot"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
