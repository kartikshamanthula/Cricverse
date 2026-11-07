"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    motion,
    useScroll,
    useTransform,
    useMotionValueEvent,
    animate,
    useInView,
    AnimatePresence
} from "framer-motion";
import {
    Trophy,
    Activity,
    ArrowRight,
    Sparkles,
    ShoppingBag,
    MapPin,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Sun,
    Moon,
    Menu,
    X,
    Tv
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

// ─── Number Counter Component ──────────────────────────────────────────────
function AnimatedCounter({ value, duration = 2 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isInView) {
            const controls = animate(0, value, {
                duration,
                onUpdate: (v) => setCount(Math.floor(v)),
                ease: "easeOut",
            });
            return controls.stop;
        }
    }, [isInView, value, duration]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ─── Main Landing Page Component ───────────────────────────────────────────
export function LandingHero() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFeatureTab, setActiveFeatureTab] = useState("scoring");
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (idx) => {
        setOpenFaq(openFaq === idx ? null : idx);
    };

    // Features tab content
    const featureTabs = [
        {
            id: "scoring",
            label: "Live Scoring & TTS",
            icon: Activity,
            title: "Pro Ball-by-Ball Cricket Engine",
            desc: "Designed for speed and precision. Score legal deliveries, wides, no-balls, leg-byes, and wickets in a single tap with full bowler and batsman strike rotation.",
            bullets: [
                "Real-Time Text-to-Speech audio commentary broadcast",
                "Wagon wheel, worm graphs, and run-rate progression charts",
                "Automatic bowler over quota & maiden calculation",
                "Downloadable official PDF match scorecards with 1-click"
            ],
            badge: "Core Engine",
            gradient: "from-green-600/15 to-green-600/5"
        },
        {
            id: "spectate",
            label: "Spectator Magic Link",
            icon: Tv,
            title: "Share Matches Live with Zero Login",
            desc: "Every match receives a unique magic share code (e.g. CV-A9X2K). Anyone can open the spectator link on their smartphone without downloading an app or creating an account.",
            bullets: [
                "Instant live polling updates ball-by-ball",
                "Live emoji reaction bursts (Clap, Fire, Shock, Celebrate)",
                "Full view of live partnership & scorecard tables",
                "Completely mobile responsive for fans on the go"
            ],
            badge: "Fan Engagement",
            gradient: "from-blue-600/15 to-blue-600/5"
        },
        {
            id: "tournaments",
            label: "Leagues & Tournaments",
            icon: Trophy,
            title: "Complete Tournament Management OS",
            desc: "Organize neighborhood cups, corporate box cricket tournaments, and competitive regional leagues with fully automated brackets and points tables.",
            bullets: [
                "Knockout, League, and Round-Robin tournament formats",
                "Automated Net Run Rate (NRR) computation & standings",
                "Roster registration & captain assignment per team",
                "Tournament match scheduling with stage tracking"
            ],
            badge: "Organizer Hub",
            gradient: "from-orange-600/15 to-orange-600/5"
        },
        {
            id: "turf",
            label: "Turf & Ground Booking",
            icon: MapPin,
            title: "Box Cricket & Turf Booking in Surat",
            desc: "Discover and reserve top turf grounds across Surat neighborhoods like Vesu, Adajan, Varachha, VIP Road, and Piplod with verified time slots and transparent hourly rates.",
            bullets: [
                "Detailed amenities list: floodlights, turf matting, parking, nets",
                "Peak & non-peak dynamic pricing with instant cart add",
                "Interactive location map & manager direct contact",
                "Box cricket and full match ground categorizations"
            ],
            badge: "Surat Venues",
            gradient: "from-green-600/15 to-green-600/5"
        },
        {
            id: "store",
            label: "Official Equipment Store",
            icon: ShoppingBag,
            title: "Premium Cricket Gear & Apparel",
            desc: "Direct access to top-grade English and Kashmir willow bats, leather match balls, batting pads, wicket-keeping gloves, and breathable team kits.",
            bullets: [
                "Curated equipment categories with real-time stock levels",
                "Integrated shopping bag with instant checkout modal",
                "Order status tracker (Processing, Shipped, Delivered)",
                "Quality tested for box turf and leather tournament play"
            ],
            badge: "Cricket Shop",
            gradient: "from-purple-600/15 to-purple-600/5"
        }
    ];

    const faqs = [
        {
            q: "Is CricVerse free for local matches and friendly gully games?",
            a: "Yes! CricVerse lets you organize teams, schedule matches, and score complete ball-by-ball games for free. You can start scoring immediately without any paid subscription."
        },
        {
            q: "Do spectators or viewers need an account to watch live scores?",
            a: "No. Each match generates an instant spectator link with a code (e.g. CV-A9X2K). Fans and friends can open the spectator link on any mobile phone to watch live scores and react with emojis with zero sign-in required."
        },
        {
            q: "How does the Text-to-Speech (TTS) commentary work?",
            a: "When enabled on the match details or scoring console, CricVerse utilizes browser speech synthesis to announce boundaries, wickets, and milestones out loud—giving you the feel of an authentic stadium announcer!"
        },
        {
            q: "How does CricVerse calculate Tournament Points & Net Run Rate (NRR)?",
            a: "Whenever a tournament match is completed, CricVerse's points engine instantly updates total runs scored, overs faced, runs conceded, and overs bowled for both sides, calculating exact Net Run Rate down to 3 decimal places."
        },
        {
            q: "Can I book Box Cricket turfs directly in Surat?",
            a: "Yes! The Grounds module features prime box cricket arenas and practice nets across Surat (Vesu, Adajan, Varachha, Piplod, VIP Road, etc.) with slot availability, pricing, and 1-click cart reservation."
        }
    ];

    const currentTab = featureTabs.find(t => t.id === activeFeatureTab) || featureTabs[0];

    return (
        <div className="min-h-screen w-full bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
            {/* Top Glowing Mesh Glow Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-green-700/8 rounded-full blur-[160px]" />
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-green-600/6 rounded-full blur-[160px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-green-800/5 rounded-full blur-[180px]" />
            </div>

            {/* ─── Modern Floating Navbar ────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-border/40 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-11 w-11 rounded-xl bg-green-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                            <div className="h-full w-full bg-background rounded-[10px] flex items-center justify-center">
                                <svg viewBox="0 0 100 100" className="w-6 h-6 text-green-600">
                                    <path d="M70,25 C60,15 40,15 30,25 C15,40 15,60 30,75 C40,85 60,85 70,75" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                                    <circle cx="45" cy="50" r="18" fill="currentColor" />
                                    <path d="M50,60 L65,75 L90,40" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
                            CricVerse
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
                        <Link href="/grounds" className="hover:text-primary transition-colors flex items-center gap-1">
                            Turf Grounds <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">Surat</span>
                        </Link>
                        <Link href="/store" className="hover:text-primary transition-colors">Store</Link>
                        <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
                    </nav>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        {user ? (
                            <Link href="/dashboard">
                                <Button className="font-bold shadow-md bg-green-600 hover:bg-green-700 text-white rounded-xl">
                                    Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" replace className="hidden sm:inline-flex">
                                    <Button variant="ghost" className="font-bold text-sm rounded-xl">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register" replace>
                                    <Button className="font-bold text-sm shadow-md bg-green-600 hover:bg-green-700 text-white rounded-xl">
                                        Get Started Free
                                    </Button>
                                </Link>
                            </>
                        )}

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 lg:hidden rounded-xl border border-border/50 text-foreground"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-b border-border/60 bg-background/95 backdrop-blur-2xl px-6 py-5 space-y-4"
                    >
                        <nav className="flex flex-col gap-3 font-semibold text-base">
                            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary">Features</a>
                            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary">How It Works</a>
                            <Link href="/grounds" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary flex items-center justify-between">
                                Turf Booking (Surat) <Badge className="bg-primary/20 text-primary">New</Badge>
                            </Link>
                            <Link href="/store" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary">Cricket Store</Link>
                            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary">FAQ</a>
                        </nav>
                        {!user && (
                            <div className="pt-4 border-t border-border flex flex-col gap-2.5">
                                <Link href="/login" replace onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full font-bold">Sign In</Button>
                                </Link>
                                <Link href="/register" replace onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full font-bold bg-green-600 hover:bg-green-700 text-white">Get Started Free</Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </header>

            {/* ─── Hero Section ─────────────────────────────────────────────────── */}
            <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
                <div className="text-center max-w-4xl mx-auto space-y-6">
                    {/* Release Pill Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md shadow-sm"
                    >
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <span className="text-xs sm:text-sm font-bold text-foreground">
                            CricVerse 2.0 • Live Commentary • Box Turf Booking • Magic Links
                        </span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]"
                    >
                        The Operating System for <br className="hidden sm:inline" />
                        <span className="text-green-600 drop-shadow-sm">
                            Modern Cricket.
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-base sm:text-xl text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed"
                    >
                        From box turf gully matches to full 20-over championship leagues. Real-time ball-by-ball scoring, live voice commentary, spectator magic links, and local ground bookings.
                    </motion.p>

                    {/* CTA Button Group */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        {user ? (
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:scale-105 transition-all">
                                    Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/register" replace className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:scale-105 transition-all">
                                    Start Scoring Free <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                        <Link href="/grounds" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-2xl border-2 border-green-600 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 dark:text-green-500 dark:border-green-600 transition-all">
                                <MapPin className="mr-2 h-5 w-5" /> Book Turf Grounds
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ─── Social Proof & Statistics ────────────────────────────────────── */}
            <section className="border-y border-border/50 bg-muted/20 py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                                <AnimatedCounter value={54200} />+
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Deliveries Scored
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                                <AnimatedCounter value={1420} />+
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Teams & Rosters
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                                <AnimatedCounter value={380} />+
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Leagues & Tourneys
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                                <AnimatedCounter value={42} />
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Surat Turfs Verified
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Feature Showcase Section (Tabs) ──────────────────────────────── */}
            <section id="features" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-bold px-3 py-1">
                        Powerhouse Features
                    </Badge>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        Everything You Need to Run Cricket Like a Pro.
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg">
                        Built from the ground up for grassroots players, turf tournament organizers, and avid cricket fans.
                    </p>
                </div>

                {/* Tab Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                    {featureTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeFeatureTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFeatureTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                                        : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Display */}
                <motion.div
                    key={currentTab.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-3xl border border-border/60 bg-gradient-to-br ${currentTab.gradient} p-8 sm:p-12 shadow-2xl relative overflow-hidden`}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <Badge className="bg-primary/20 text-primary font-bold uppercase tracking-wider text-xs">
                                {currentTab.badge}
                            </Badge>
                            <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                                {currentTab.title}
                            </h3>
                            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                                {currentTab.desc}
                            </p>

                            <ul className="space-y-3 pt-2">
                                {currentTab.bullets.map((b, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm sm:text-base font-semibold text-foreground/90">
                                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-4 flex flex-wrap gap-4">
                                {currentTab.id === "turf" ? (
                                    <Link href="/grounds">
                                        <Button className="font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white">
                                            Explore Surat Turfs <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </Link>
                                ) : currentTab.id === "store" ? (
                                    <Link href="/store">
                                        <Button className="font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white">
                                            Visit Equipment Store <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/register" replace>
                                        <Button className="font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white">
                                            Try This Feature Free <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Interactive Visual Preview Box */}
                        <div className="lg:col-span-5 bg-card/90 rounded-2xl border border-border/80 p-6 shadow-xl">
                            <div className="flex items-center justify-between pb-4 border-b border-border/40">
                                <span className="text-xs font-bold font-mono text-primary uppercase">CricVerse Preview</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                                </div>
                            </div>

                            <div className="py-6 space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                                    <span className="font-bold text-sm">Match Status</span>
                                    <Badge className="bg-green-600 text-white font-bold">LIVE SCORING</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                                    <span className="font-bold text-sm">Audio Commentary</span>
                                    <span className="text-xs font-mono text-primary font-bold">TTS Enabled</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                                    <span className="font-bold text-sm">Magic Code</span>
                                    <span className="text-xs font-mono font-bold bg-background px-2 py-1 rounded border">CV-A9X2K</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                                    <span className="font-bold text-sm">Export Format</span>
                                    <span className="text-xs font-mono text-muted-foreground font-semibold">Official PDF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ─── How CricVerse Works (4 Simple Steps) ─────────────────────────── */}
            <section id="how-it-works" className="py-20 bg-muted/20 border-y border-border/50 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-bold px-3 py-1">
                            Workflow
                        </Badge>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                            From Toss to Championship in 4 Steps
                        </h2>
                        <p className="text-muted-foreground text-base sm:text-lg">
                            Simple enough for a 10-minute street match, powerful enough for a state-level championship.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="rounded-3xl bg-card border border-border/60 p-6 space-y-4 hover:border-green-600/50 transition-all hover:-translate-y-1">
                            <div className="h-12 w-12 rounded-2xl bg-green-600/10 text-green-600 flex items-center justify-center font-black text-xl border border-green-600/20">
                                01
                            </div>
                            <h3 className="text-xl font-bold">Build Your Squad</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Create your team, assign captain, add player profiles with photos, roles, and batting/bowling styles.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-card border border-border/60 p-6 space-y-4 hover:border-green-600/50 transition-all hover:-translate-y-1">
                            <div className="h-12 w-12 rounded-2xl bg-green-600/10 text-green-600 flex items-center justify-center font-black text-xl border border-green-600/20">
                                02
                            </div>
                            <h3 className="text-xl font-bold">Pick Venue & Toss</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Book a box cricket turf or select a ground, set overs and match rules, and conduct the digital toss.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-card border border-border/60 p-6 space-y-4 hover:border-green-600/50 transition-all hover:-translate-y-1">
                            <div className="h-12 w-12 rounded-2xl bg-green-600/10 text-green-600 flex items-center justify-center font-black text-xl border border-green-600/20">
                                03
                            </div>
                            <h3 className="text-xl font-bold">Score Ball-by-Ball</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Tap 1, 4, 6 or Wicket. Voice commentary speaks aloud, and spectators follow live via your magic link.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-card border border-border/60 p-6 space-y-4 hover:border-green-600/50 transition-all hover:-translate-y-1">
                            <div className="h-12 w-12 rounded-2xl bg-green-600/10 text-green-600 flex items-center justify-center font-black text-xl border border-green-600/20">
                                04
                            </div>
                            <h3 className="text-xl font-bold">Standings & PDF</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Tournament points & Net Run Rate update automatically. Export match scorecards to PDF with 1-click.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Frequently Asked Questions (Accordion) ────────────────────────── */}
            <section id="faq" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 relative">
                <div className="text-center mb-16 space-y-4">
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-bold px-3 py-1">
                        Got Questions?
                    </Badge>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div
                                key={idx}
                                className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="px-6 pb-6 text-muted-foreground text-sm sm:text-base leading-relaxed border-t border-border/40 pt-4"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── High-Converting Pre-Footer CTA Banner ──────────────────────────── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative mb-12">
                <div className="rounded-3xl bg-green-700 p-8 sm:p-16 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
                    {/* Decorative overlay */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        Ready to Elevate Your Cricket Empire?
                    </h2>
                    <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
                        Join teams and tournament organizers across the country. Start tracking live scores and booking turfs today.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/register" replace className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base font-black rounded-2xl bg-white text-green-800 hover:bg-green-50 shadow-xl hover:scale-105 transition-all">
                                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-base font-bold rounded-2xl border-2 border-white/50 bg-white/10 hover:bg-white/20 text-white transition-all">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Footer ────────────────────────────────────────────────────────── */}
            <footer className="border-t border-border/40 bg-muted/10 py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-border/40">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
                                CV
                            </div>
                            <span className="text-xl font-bold tracking-tight">CricVerse</span>
                        </Link>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            The modern cricket management operating system. Live scoring, audio commentary, league management, and venue booking.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4">Core Modules</h4>
                        <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
                            <li><Link href="/matches" className="hover:text-primary transition-colors">Live Matches & Scoring</Link></li>
                            <li><Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments & Leagues</Link></li>
                            <li><Link href="/teams" className="hover:text-primary transition-colors">Teams & Roster Manager</Link></li>
                            <li><Link href="/grounds" className="hover:text-primary transition-colors">Turf Ground Booking</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4">Features</h4>
                        <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
                            <li><span className="text-foreground">TTS Voice Commentary</span></li>
                            <li><span className="text-foreground">Spectator Magic Link (CV-Code)</span></li>
                            <li><span className="text-foreground">Official PDF Match Reports</span></li>
                            <li><Link href="/store" className="hover:text-primary transition-colors">CricVerse Store</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm mb-4">Get Started</h4>
                        <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
                            <li><Link href="/login" replace className="hover:text-primary transition-colors">Sign In</Link></li>
                            <li><Link href="/register" replace className="hover:text-primary transition-colors">Create Account</Link></li>
                            <li><a href="#faq" className="hover:text-primary transition-colors">Help & FAQ</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
                    <p>© {new Date().getFullYear()} CricVerse Inc. All rights reserved.</p>
                    <p className="font-mono text-[11px]">Crafted for cricket lovers worldwide 🏏</p>
                </div>
            </footer>
        </div>
    );
}
