"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useMotionValueEvent, animate, useInView } from "framer-motion";
import { LogIn, UserPlus, ChevronDown, Trophy, Activity, Users, Star, ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

// Helper component for animated numbers
function AnimatedCounter({ value, duration = 2 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isInView) {
            const controls = animate(0, value, {
                duration: duration,
                onUpdate: (v) => setCount(Math.floor(v)),
                ease: "easeOut",
            });
            return controls.stop;
        }
    }, [isInView, value, duration]);

    return <span ref={ref}>{count}</span>;
}

// Highly optimized, photorealistic, interactive 3D Cricket Ball Canvas Component
function SpinningCricketBall3D() {
    const canvasRef = useRef(null);
    const vxRef = useRef(0.005);
    const vyRef = useRef(0.015);
    const angleXRef = useRef(0.3);
    const angleYRef = useRef(-0.5);
    const isHoveredRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let time = 0;

        const R = 75; // Ball Radius
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        const drawBall = () => {
            ctx.clearRect(0, 0, width, height);

            time += 16;
            // Float oscillation (breathing effect)
            const floatOffset = Math.sin(time * 0.002) * 6;
            const ballCenterY = centerY + floatOffset;

            // 1. Draw Drop Shadow on canvas (squashed ellipse below the ball)
            const shadowScale = 1 - (floatOffset / 6) * 0.12;
            const shadowAlpha = 0.35 + (floatOffset / 6) * 0.08;

            ctx.save();
            ctx.scale(1, 0.25);
            const shadowGrad = ctx.createRadialGradient(
                centerX, (centerY + R * 0.95) / 0.25, 0,
                centerX, (centerY + R * 0.95) / 0.25, R * 0.85
            );
            shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
            shadowGrad.addColorStop(0.5, `rgba(0, 0, 0, ${shadowAlpha * 0.4})`);
            shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.beginPath();
            ctx.arc(centerX, (centerY + R * 0.95) / 0.25, R * 0.85 * shadowScale, 0, 2 * Math.PI);
            ctx.fillStyle = shadowGrad;
            ctx.fill();
            ctx.restore();

            // 2. Spherical Ball Base
            // Light source comes from top-left (-R*0.35, -R*0.35)
            const baseGrad = ctx.createRadialGradient(
                centerX - R * 0.35,
                ballCenterY - R * 0.35,
                R * 0.05,
                centerX - R * 0.1,
                ballCenterY - R * 0.1,
                R * 1.05
            );
            baseGrad.addColorStop(0, "#ff4444"); // bright crimson
            baseGrad.addColorStop(0.3, "#d31212"); // rich leather red
            baseGrad.addColorStop(0.7, "#880000"); // dark burgundy shadow
            baseGrad.addColorStop(0.95, "#4c0000"); // deep dark red
            baseGrad.addColorStop(1, "#260000"); // edge shadow border

            ctx.beginPath();
            ctx.arc(centerX, ballCenterY, R, 0, 2 * Math.PI);
            ctx.fillStyle = baseGrad;
            ctx.fill();

            // 3. Draw Seams
            // Rotate the seam angles based on velocities
            angleXRef.current += vxRef.current;
            angleYRef.current += vyRef.current;

            // Apply friction to spin velocity, returning to baseline speeds
            const baseVx = 0.005;
            const baseVy = 0.015;
            vxRef.current += (baseVx - vxRef.current) * 0.04;
            vyRef.current += (baseVy - vyRef.current) * 0.04;

            const angleX = angleXRef.current;
            const angleY = angleYRef.current;

            // Draw three parallel stitch lines: Central seam (0), Left seam (-2px), Right seam (+2px)
            const tracks = [
                { offset: 0, opacityMult: 1.0, color: "rgba(255, 255, 255, 0.95)" },
                { offset: -2.2, opacityMult: 0.7, color: "rgba(255, 255, 255, 0.8)" },
                { offset: 2.2, opacityMult: 0.7, color: "rgba(255, 255, 255, 0.8)" }
            ];

            const phi = 20 * Math.PI / 180; // Seam tilt X (20 degrees)
            const psi = 12 * Math.PI / 180; // Seam tilt Z (12 degrees)

            tracks.forEach(track => {
                // We draw 75 stitch increments around the circle circumference
                for (let i = 0; i < 75; i++) {
                    const theta = (i / 75) * 2 * Math.PI;

                    // Local coordinate of stitch in ball's coordinate system
                    const x_p = R * Math.cos(theta);
                    const y_p = track.offset;
                    const z_p = R * Math.sin(theta);

                    // 1. Tilt seam around X-axis
                    const x1 = x_p;
                    const y1 = y_p * Math.cos(phi) - z_p * Math.sin(phi);
                    const z1 = y_p * Math.sin(phi) + z_p * Math.cos(phi);

                    // 2. Tilt seam around Z-axis
                    const x2 = x1 * Math.cos(psi) - y1 * Math.sin(psi);
                    const y2 = x1 * Math.sin(psi) + y1 * Math.cos(psi);
                    const z2 = z1;

                    // 3. Apply rolling rotation (Rotate Y then X)
                    // Y Rotation
                    const xRotY = x2 * Math.cos(angleY) - z2 * Math.sin(angleY);
                    const zRotY = x2 * Math.sin(angleY) + z2 * Math.cos(angleY);
                    const yRotY = y2;

                    // X Rotation
                    const xFinal = xRotY;
                    const yFinal = yRotY * Math.cos(angleX) - zRotY * Math.sin(angleX);
                    const zFinal = yRotY * Math.sin(angleX) + zRotY * Math.cos(angleX);

                    // If zFinal > 0, the stitch is on the visible front hemisphere
                    if (zFinal > 0.05) {
                        const px = centerX + xFinal;
                        const py = ballCenterY + yFinal;

                        // Shading based on spherical depth zFinal
                        const depthRatio = zFinal / R; // 0 to 1
                        const alpha = (0.35 + depthRatio * 0.65) * track.opacityMult;

                        // Draw stitch shadow first for 3D extrusion effect
                        ctx.beginPath();
                        ctx.arc(px + 1, py + 1.2, 1.4, 0, 2 * Math.PI);
                        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.45})`;
                        ctx.fill();

                        // Draw stitch thread
                        ctx.beginPath();
                        ctx.arc(px, py, 1.4, 0, 2 * Math.PI);
                        ctx.fillStyle = track.color.replace("0.", `${alpha * 0.95}`);
                        ctx.fill();
                    }
                }
            });

            // 4. Glossy Specular Highlight (Reflection of light)
            const specGrad = ctx.createRadialGradient(
                centerX - R * 0.35, ballCenterY - R * 0.35, 0,
                centerX - R * 0.35, ballCenterY - R * 0.35, R * 0.45
            );
            specGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
            specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.beginPath();
            ctx.arc(centerX, ballCenterY, R, 0, 2 * Math.PI);
            ctx.fillStyle = specGrad;
            ctx.fill();

            // 5. Sleek Rim Glow (Gives an elegant 3D contrast edge)
            const rimGrad = ctx.createLinearGradient(
                centerX - R, ballCenterY - R,
                centerX + R, ballCenterY + R
            );
            rimGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
            rimGrad.addColorStop(0.7, "rgba(255, 255, 255, 0)");
            rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.2)");

            ctx.beginPath();
            ctx.arc(centerX, ballCenterY, R, 0, 2 * Math.PI);
            ctx.strokeStyle = rimGrad;
            ctx.lineWidth = 3.5;
            ctx.stroke();

            // Loop
            animationFrameId = requestAnimationFrame(drawBall);
        };

        drawBall();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleMouseMove = (e) => {
        // Accelerate rotation on mouse movement
        const dx = e.nativeEvent.movementX || 0;
        const dy = e.nativeEvent.movementY || 0;
        vxRef.current += dy * 0.0018;
        vyRef.current += dx * 0.0018;
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => { isHoveredRef.current = true; }}
            onMouseLeave={() => { isHoveredRef.current = false; }}
            className="cursor-grab active:cursor-grabbing hover:scale-110 transition-all duration-300 relative w-[220px] h-[220px]"
        >
            <canvas
                ref={canvasRef}
                width={220}
                height={220}
                className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            />
        </div>
    );
}

// 3D Stumps Set helper component
function WicketSet() {
    return (
        <div className="flex items-end justify-center h-16 w-8 relative" style={{ transformStyle: "preserve-3d" }}>
            {/* Three wooden stumps standing upright */}
            <div className="w-[3px] h-14 bg-amber-700 border-r border-amber-800/40 rounded-full shadow-[2px_0_4px_rgba(0,0,0,0.2)]" />
            <div className="w-[3px] h-14 bg-amber-700 border-r border-amber-800/40 rounded-full mx-[3px] shadow-[2px_0_4px_rgba(0,0,0,0.2)]" />
            <div className="w-[3px] h-14 bg-amber-700 border-r border-amber-800/40 rounded-full shadow-[2px_0_4px_rgba(0,0,0,0.2)]" />

            {/* Horizontal Bail rested on top */}
            <div className="absolute top-2 w-[22px] h-[2px] bg-amber-600 border-b border-amber-700/60 rounded-full shadow-[0_1.5px_2px_rgba(0,0,0,0.4)]" />
        </div>
    );
}

// 3D Floodlight Tower with volumetric light beam
function LightTower3D({ direction, color }) {
    // Spotlight tilt depending on quadrant to focus on stadium center
    const spotlightStyles = {
        "bottom-right": { transform: "translateY(-110px) rotateX(25deg) rotateY(15deg) origin-top" },
        "bottom-left": { transform: "translateY(-110px) rotateX(25deg) rotateY(-15deg) origin-top" },
        "top-right": { transform: "translateY(-110px) rotateX(25deg) rotateY(15deg) origin-top" },
        "top-left": { transform: "translateY(-110px) rotateX(25deg) rotateY(-15deg) origin-top" }
    };

    return (
        <div className="flex flex-col items-center h-36 relative" style={{ transformStyle: "preserve-3d" }}>
            {/* Glowing LED Floodlight Board */}
            <div
                style={{ transform: "translateZ(0px)" }}
                className="w-10 h-7 bg-slate-800 rounded-sm p-[3px] border border-slate-600 flex flex-wrap gap-[3px] justify-center items-center relative shadow-lg z-10"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#fff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#fff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#fff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#fff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#fff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_15px_#fff]" />
            </div>

            {/* Industrial Steel Lattice Pole */}
            <div className="w-1.5 h-28 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-800 border-r border-slate-900/30 rounded-t-sm shadow-md" />

            {/* Heavy Base Footing */}
            <div className="w-4 h-2 bg-slate-700 rounded-sm border border-slate-800" />

            {/* Volumetric Spotlight Beam casting down */}
            <div
                style={{
                    ...spotlightStyles[direction],
                    clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)",
                    background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.45) 0%, ${color} 40%, transparent 100%)`
                }}
                className="absolute w-36 h-48 pointer-events-none mix-blend-screen opacity-60 animate-pulse"
            />
        </div>
    );
}

// 3D Stadium Terrain Component
function Stadium3D({ mouseCoords }) {
    // Map mouse normalized coordinates to slight 3D rotation angles
    const rotX = mouseCoords.y * 14;
    const rotY = -mouseCoords.x * 14;

    return (
        <div className="relative w-full h-[400px] flex items-center justify-center [perspective:1200px]">
            {/* Dynamic 3D Tilt Wrapper */}
            <motion.div
                animate={{
                    rotateX: 42 + rotX, // Baseline tilt view + mouse rotation
                    rotateY: rotY
                }}
                style={{
                    transformStyle: "preserve-3d"
                }}
                transition={{ type: "spring", stiffness: 90, damping: 22 }}
                className="relative w-[340px] h-[340px]"
            >
                {/* 1. Dynamic Drop Shadow on Ground */}
                <div className="absolute inset-0 bg-black/45 blur-2xl rounded-full translate-z-[-20px] scale-95" />

                {/* 2. Grass Field Circle */}
                <div
                    style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-green-700 border-4 border-emerald-400/30 overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.75)] flex items-center justify-center"
                >
                    {/* Lawn mower stripe rings */}
                    <div className="absolute w-[85%] h-[85%] rounded-full border border-emerald-500/15" />
                    <div className="absolute w-[70%] h-[70%] rounded-full border border-emerald-500/10" />
                    <div className="absolute w-[52%] h-[52%] rounded-full border border-emerald-500/15" />
                    <div className="absolute w-[32%] h-[32%] rounded-full border border-emerald-500/10" />

                    {/* Glowing Emerald Boundary Rope */}
                    <div className="absolute inset-2 rounded-full border-2 border-emerald-400/80 animate-pulse shadow-[0_0_18px_rgba(52,211,153,0.65),inset_0_0_18px_rgba(52,211,153,0.65)]" />

                    {/* Dirt/Straw Match Pitch */}
                    <div className="absolute w-12 h-40 bg-amber-100/90 rounded-sm border-x border-amber-900/25 shadow-md flex flex-col justify-between py-2 overflow-hidden">
                        {/* Realistic grass/soil textures */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />

                        {/* White Chalk Creases */}
                        <div className="w-full h-[1.5px] bg-white/80" />
                        <div className="w-full h-[1.5px] bg-white/80" />
                    </div>
                </div>

                {/* 3. Vertical Wicket Sets at Pitch Ends */}
                {/* Wicket Set 1 (Top End) */}
                <div
                    style={{ transform: "translateX(-50%) translateY(-75px) translateZ(0px) rotateX(-90deg)", transformStyle: "preserve-3d" }}
                    className="absolute left-1/2 top-1/2 origin-bottom flex gap-[5px]"
                >
                    <WicketSet />
                </div>

                {/* Wicket Set 2 (Bottom End) */}
                <div
                    style={{ transform: "translateX(-50%) translateY(75px) translateZ(0px) rotateX(-90deg)", transformStyle: "preserve-3d" }}
                    className="absolute left-1/2 top-1/2 origin-bottom flex gap-[5px]"
                >
                    <WicketSet />
                </div>

                {/* 4. Industrial Stadium Light Towers (Stood straight up perpendicular to field plane) */}
                {/* Light Tower 1 (Top-Left Corner) */}
                <div
                    style={{ transform: "translateX(-135px) translateY(-135px) translateZ(0px) rotateX(-90deg)", transformStyle: "preserve-3d" }}
                    className="absolute left-1/2 top-1/2 origin-bottom"
                >
                    <LightTower3D direction="bottom-right" color="rgba(59, 130, 246, 0.35)" /> {/* Cyber blue beam */}
                </div>

                {/* Light Tower 2 (Top-Right Corner) */}
                <div
                    style={{ transform: "translateX(115px) translateY(-135px) translateZ(0px) rotateX(-90deg)", transformStyle: "preserve-3d" }}
                    className="absolute left-1/2 top-1/2 origin-bottom"
                >
                    <LightTower3D direction="bottom-left" color="rgba(16, 185, 129, 0.35)" /> {/* Stadium green beam */}
                </div>

                {/* Light Tower 3 (Bottom-Left Corner) */}
                <div
                    style={{ transform: "translateX(-135px) translateY(115px) translateZ(0px) rotateX(-90deg)", transformStyle: "preserve-3d" }}
                    className="absolute left-1/2 top-1/2 origin-bottom"
                >
                    <LightTower3D direction="top-right" color="rgba(16, 185, 129, 0.35)" /> {/* Stadium green beam */}
                </div>

                {/* Light Tower 4 (Bottom-Right Corner) */}
                <div
                    style={{ transform: "translateX(115px) translateY(115px) translateZ(0px) rotateX(-90deg)", transformStyle: "preserve-3d" }}
                    className="absolute left-1/2 top-1/2 origin-bottom"
                >
                    <LightTower3D direction="top-left" color="rgba(59, 130, 246, 0.35)" /> {/* Cyber blue beam */}
                </div>
            </motion.div>
        </div>
    );
}

export function LandingHero() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    // Mouse Tracking State for 3D tilts and animations
    const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const heroRef = useRef(null);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    // Slow circular drift autoplay when user is not hovering, ensuring responsive animation on all platforms
    useEffect(() => {
        if (isHovered) return;

        let frameId;
        let time = 0;
        const updateAutoplay = () => {
            time += 0.012;
            setMouseCoords({
                x: Math.sin(time) * 0.16,
                y: Math.cos(time * 0.8) * 0.16
            });
            frameId = requestAnimationFrame(updateAutoplay);
        };

        frameId = requestAnimationFrame(updateAutoplay);
        return () => cancelAnimationFrame(frameId);
    }, [isHovered]);

    const handleHeroMouseMove = (e) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        // Normalize mouse coordinates to [-1, 1] range
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setMouseCoords({ x, y });
    };

    // Premium Parallax Scroll Effects
    const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
    const heroY = useTransform(scrollY, [0, 600], [0, 180]);
    const heroScale = useTransform(scrollY, [0, 600], [1, 0.88]);
    const bgY = useTransform(scrollY, [0, 1000], [0, 300]);
    const bgScale = useTransform(scrollY, [0, 1000], [1, 1.15]);

    // Live Matches Mock Ticker
    const liveMatches = [
        { id: 1, team1: "IND", team2: "AUS", score1: "245/4", score2: "240/10", status: "IND won by 6 wkts", overs: "19.2/20" },
        { id: 2, team1: "MI", team2: "CSK", score1: "180/2", score2: "179/8", status: "Innings Break", overs: "20.0/20" },
        { id: 3, team1: "ENG", team2: "NZ", score1: "310/6", score2: "145/2", status: "NZ need 166 runs", overs: "25.4/50" },
        { id: 4, team1: "RCB", team2: "KKR", score1: "212/3", score2: "215/6", status: "KKR won by 4 wkts", overs: "19.5/20" },
        { id: 5, team1: "SA", team2: "PAK", score1: "150/9", score2: "85/4", status: "Live - Over 12.3", overs: "12.3/20" },
    ];

    return (
        <div
            ref={heroRef}
            onMouseMove={handleHeroMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setMouseCoords({ x: 0, y: 0 });
            }}
            className="min-h-screen w-full flex flex-col relative bg-background overflow-hidden"
        >
            {/* Navbar for Landing Page */}
            <nav className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm" : "bg-transparent border-b border-transparent"}`}>
                <div className="flex items-center gap-3">
                    <motion.div
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-12 h-12"
                    >
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                            <path d="M70,25 C60,15 40,15 30,25 C15,40 15,60 30,75 C40,85 60,85 70,75" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" />
                            <circle cx="45" cy="50" r="18" fill="#3b82f6" />
                            <path d="M50,60 L65,75 L90,40" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>
                    <motion.span
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-3xl font-black tracking-tight text-primary drop-shadow-sm"
                    >
                        CricVerse
                    </motion.span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground mr-8">
                    <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="#impact" className="hover:text-primary transition-colors">Statistics</Link>
                    <Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <Link href="/dashboard">
                            <Button className="font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-500">
                                Go to Dashboard <ArrowRight className="mr-2 h-4 w-4 hidden sm:block" />
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" replace>
                                <Button variant="ghost" className="hidden sm:flex font-semibold hover:bg-primary/10">
                                    <LogIn className="mr-2 h-4 w-4" /> Login
                                </Button>
                            </Link>
                            <Link href="/register" replace>
                                <Button className="font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-500">
                                    <UserPlus className="mr-2 h-4 w-4 hidden sm:block" /> Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Split Dual-Pane Main Hero Section */}
            <div className="flex-1 flex flex-col justify-center px-4 md:px-8 z-10 pt-32 lg:pt-36 pb-12 w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">

                    {/* Left Column: Premium Interactive Typography */}
                    <motion.div
                        suppressHydrationWarning
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, delay: 0.1, type: "spring" }}
                        style={{
                            opacity: heroOpacity,
                            y: heroY,
                            scale: heroScale,
                            transformStyle: "preserve-3d",
                            perspective: 1000
                        }}
                        className="col-span-1 lg:col-span-7 flex flex-col items-start text-left space-y-7 z-10"
                    >
                        {/* Live Update Ticker Badge */}
                        <motion.div
                            style={{ translateZ: "40px" }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide border border-primary/20 backdrop-blur-sm shadow-lg shadow-primary/5 select-none"
                        >
                            <span className="relative flex h-2.5 w-2.5 mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                            </span>
                            Live Scoring & 3D Interactive Pitches
                        </motion.div>

                        {/* Title Float Depth */}
                        <motion.h1
                            style={{ translateZ: "60px" }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] text-foreground drop-shadow-xl"
                        >
                            Your Ultimate <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-emerald-400 animate-gradient bg-[length:200%_auto]">
                                Cricket Empire
                            </span>
                        </motion.h1>

                        {/* Description Paragraph */}
                        <motion.p
                            style={{ translateZ: "30px" }}
                            className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl leading-relaxed"
                        >
                            Manage teams, organize tournaments, track live matches, and connect with fans globally on the world's most premium 3D-integrated cricket ecosystem.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            style={{ translateZ: "45px" }}
                            className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto"
                        >
                            {user ? (
                                <Link href="/dashboard" className="w-full sm:w-auto">
                                    <Button size="lg" className="relative group h-14 px-10 text-lg font-bold shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] overflow-hidden rounded-full w-full sm:w-auto transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(34,197,94,0.7)] bg-primary border-none">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <span className="relative z-10 flex items-center justify-center">Go to Dashboard <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/register" replace className="w-full sm:w-auto">
                                        <Button size="lg" className="relative group h-14 px-10 text-lg font-bold shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] overflow-hidden rounded-full w-full sm:w-auto transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(34,197,94,0.7)] bg-primary border-none">
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <span className="relative z-10 flex items-center justify-center">Get Started for Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                                        </Button>
                                    </Link>
                                    <Link href="/login" replace className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold hover:scale-105 transition-transform w-full sm:w-auto rounded-full border-2 bg-background/50 backdrop-blur-sm">
                                            Sign In
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Unified 3D Stadium & Floating Leather Ball Showpiece */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
                        style={{
                            opacity: heroOpacity,
                            y: heroY,
                            scale: heroScale
                        }}
                        className="col-span-1 lg:col-span-5 flex items-center justify-center relative w-full h-[450px]"
                    >
                        {/* Glowing backdrop spotlight */}
                        <div className="absolute w-[360px] h-[360px] bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" />

                        {/* 3D Stadium Element */}
                        <Stadium3D mouseCoords={mouseCoords} />

                        {/* Photorealistic 3D Spinning Leather Ball suspended above the pitch */}
                        <motion.div
                            style={{
                                transformStyle: "preserve-3d",
                                // Parallax separation: Ball tilts and offsets slightly deeper/closer than stadium based on mouse
                                transform: `translateY(-55px) translateZ(80px)`
                            }}
                            className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
                        >
                            <SpinningCricketBall3D />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Simulated Live Matches Ticker */}
                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="w-full overflow-hidden mt-16 relative z-10 before:absolute before:left-0 before:top-0 before:w-16 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:w-16 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent after:z-10"
                >
                    <motion.div
                        className="flex gap-4 whitespace-nowrap"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ ease: "linear", duration: 25, repeat: Infinity }}
                    >
                        {/* Double array for seamless infinite looping */}
                        {[...liveMatches, ...liveMatches].map((match, idx) => (
                            <div key={`${match.id}-${idx}`} className="flex-none bg-background/40 backdrop-blur-md border border-border/40 rounded-xl p-3 flex items-center gap-4 min-w-[300px] shadow-sm hover:bg-background/80 transition-colors cursor-default">
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span>{match.team1}</span>
                                        <span className="text-primary">{match.score1}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                                        <span>{match.team2}</span>
                                        <span>{match.score2}</span>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-border/50 mx-2" />
                                <div className="flex flex-col items-end flex-1 min-w-[90px]">
                                    <span className="text-[10px] uppercase font-bold text-primary/80 tracking-wider">Updates</span>
                                    <span className="text-xs font-medium text-right mt-0.5 max-w-[120px] truncate">{match.status}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Premium Animated Background Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div suppressHydrationWarning style={{ y: bgY, scale: bgScale }} className="absolute inset-0 w-full h-full">
                    {/* Rich gradient neon aura spheres */}
                    <div className="absolute top-[12%] left-[5%] w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[130px] mix-blend-screen opacity-40 animate-pulse" />
                    <div className="absolute bottom-[12%] right-[5%] w-[40rem] h-[40rem] bg-cyan-500/10 rounded-full blur-[130px] mix-blend-screen opacity-40 animate-pulse" style={{ animationDelay: '2.5s' }} />
                    <div className="absolute top-[35%] left-[38%] w-[35rem] h-[35rem] bg-blue-500/5 rounded-full blur-[110px] mix-blend-screen opacity-25 animate-pulse" style={{ animationDelay: '4.5s' }} />

                    {/* Floating trophies and actions */}
                    <motion.div
                        animate={{ y: [0, -25, 0], rotate: [0, 6, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[28%] right-[12%] w-20 h-20 opacity-[0.08]"
                    >
                        <Trophy className="w-full h-full text-primary" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 25, 0], rotate: [0, -8, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-[25%] left-[8%] w-28 h-28 opacity-[0.05]"
                    >
                        <Activity className="w-full h-full text-blue-500" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 bg-accent/20 z-10 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Capabilities</h2>
                        <h3 className="text-4xl md:text-5xl font-black mb-6">Everything You Need</h3>
                        <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
                            Stop using pen and paper. CricVerse provides enterprise-grade tools tailored for local clubs, schools, and professional leagues.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="relative bg-background/50 backdrop-blur-2xl p-10 rounded-3xl border border-border/50 hover:shadow-2xl transition-all hover:bg-background/80 hover:border-primary/50 group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:bg-primary/10" />
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-8 border border-primary/20">
                                <Users className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Team Management</h3>
                            <p className="text-muted-foreground text-base leading-relaxed mb-6">
                                Create teams, manage expansive rosters with detailed player profiles, assign roles, and track individual career statistics flawlessly over multiple seasons.
                            </p>
                            <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Player Profiles</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Career Analytics</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Roster Building</li>
                            </ul>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="relative bg-background/50 backdrop-blur-2xl p-10 rounded-3xl border border-border/50 hover:shadow-2xl transition-all hover:bg-background/80 hover:border-blue-500/50 group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:bg-blue-500/10" />
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                                <Activity className="w-7 h-7 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Live Scoring System</h3>
                            <p className="text-muted-foreground text-base leading-relaxed mb-6">
                                Broadcast matches live to your fans anywhere. Our intuitive ball-by-ball scorer interface makes capturing complex game states incredibly simple.
                            </p>
                            <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Ball-by-Ball Logging</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Real-time Fan View</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Wagon Wheels</li>
                            </ul>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="relative bg-background/50 backdrop-blur-2xl p-10 rounded-3xl border border-border/50 hover:shadow-2xl transition-all hover:bg-background/80 hover:border-emerald-500/50 group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:bg-emerald-500/10" />
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-emerald-500"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Pro Store Access</h3>
                            <p className="text-muted-foreground text-base leading-relaxed mb-6">
                                Equip your league with the best. Access our integrated marketplace for official merchandise, professional bats, pads, and league-certified balls.
                            </p>
                            <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Premium Bats</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Custom Jerseys</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Safe Checkout</li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Dynamic Stats / Impact Section */}
            <section id="impact" className="py-24 px-6 bg-background z-10 relative border-y border-border/50 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 space-y-8"
                    >
                        <h2 className="text-4xl md:text-5xl font-black leading-tight">Trusted by The Global<br />Cricket Community</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Numbers speak louder than words. We've built the most reliable, high-performance platform to ensure your matches are recorded and preserved forever.
                        </p>
                        <div className="pt-6">
                            <Button size="lg" className="h-12 px-8 font-bold rounded-full">
                                View Leaderboards
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 grid grid-cols-2 gap-6 w-full"
                    >
                        <div className="bg-muted/30 backdrop-blur-lg p-8 rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center">
                            <div className="text-5xl font-black text-primary mb-3">
                                <AnimatedCounter value={5420} />+
                            </div>
                            <div className="font-semibold text-foreground/80">Matches Scored</div>
                        </div>
                        <div className="bg-muted/30 backdrop-blur-lg p-8 rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center lg:translate-y-12">
                            <div className="text-5xl font-black text-blue-500 mb-3">
                                <AnimatedCounter value={120} />k+
                            </div>
                            <div className="font-semibold text-foreground/80">Active Players</div>
                        </div>
                        <div className="bg-muted/30 backdrop-blur-lg p-8 rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center">
                            <div className="text-5xl font-black text-emerald-500 mb-3">
                                <AnimatedCounter value={850} />+
                            </div>
                            <div className="font-semibold text-foreground/80">Tournaments Hosted</div>
                        </div>
                        <div className="bg-muted/30 backdrop-blur-lg p-8 rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center lg:translate-y-12">
                            <div className="text-5xl font-black text-purple-500 mb-3">
                                <AnimatedCounter value={99} />.<AnimatedCounter value={9} duration={3} />%
                            </div>
                            <div className="font-semibold text-foreground/80">Platform Uptime</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-32 px-6 bg-accent/10 z-10 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-black mb-4">Don't just take our word for it</h2>
                        <p className="text-muted-foreground text-xl">See what organizers are saying about CricVerse.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Rahul Sharma", role: "Manager, Delhi Strikers", text: "We moved our entire local league to CricVerse last year. The live scoring is so intuitive that anyone can pick it up in 5 minutes. Highly recommended!" },
                            { name: "David Warner", role: "Tournament Admin", text: "The team management features are exactly what we needed. Managing a 16-team tournament used to be a nightmare, now it's a breeze." },
                            { name: "Sarah Collins", role: "Club Captain", text: "Finding good quality gear was always tough. The built-in premium store means our team is always geared up with the finest willows." }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.15 }}
                                className="bg-background/80 backdrop-blur-md p-8 rounded-2xl border border-border shadow-sm flex flex-col"
                            >
                                <div className="flex gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-yellow-500 text-yellow-500" />)}
                                </div>
                                <p className="text-foreground/90 leading-relaxed mb-6 flex-1 text-base">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary border border-primary/30">
                                        {t.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="font-bold">{t.name}</div>
                                        <div className="text-xs text-muted-foreground">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 z-10 relative bg-gradient-to-b from-background to-primary/5 border-t border-border/50 overflow-hidden text-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2605&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                    className="max-w-4xl mx-auto space-y-8 relative z-10"
                >
                    <h2 className="text-5xl md:text-7xl font-black text-foreground drop-shadow-md">Ready to Take the Pitch?</h2>
                    <p className="text-2xl text-muted-foreground px-4">
                        Join thousands of players and teams already managing their cricket journey on CricVerse.
                    </p>
                    <div className="pt-8 max-w-sm mx-auto">
                        {user ? (
                            <Link href="/dashboard">
                                <Button size="lg" className="w-full h-16 text-xl font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform rounded-full bg-gradient-to-r from-primary to-blue-600 border-none select-none">
                                    Go to Dashboard <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/register" replace>
                                <Button size="lg" className="w-full h-16 text-xl font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform rounded-full bg-gradient-to-r from-primary to-blue-600 border-none select-none">
                                    Create Free Account <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* Comprehensive Premium Footer */}
            <footer className="bg-black text-white/80 py-16 px-6 border-t border-white/10 z-10 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/50">
                                <svg viewBox="0 0 100 100" className="w-6 h-6 text-white">
                                    <path d="M70,25 C60,15 40,15 30,25 C15,40 15,60 30,75 C40,85 60,85 70,75" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                                    <circle cx="45" cy="50" r="18" fill="currentColor" />
                                    <path d="M50,60 L65,75 L90,40" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white">CricVerse</span>
                        </div>
                        <p className="text-white/60 max-w-sm">
                            The world's most advanced digital platform for cricket leagues, teams, and fans. Managing the game logic so you can focus on playing.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white mb-6">Platform</h4>
                        <ul className="space-y-3">
                            <li><Link href="#" className="hover:text-primary transition-colors">Live Scores</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Tournaments</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Leaderboards</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Premium Store</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-3">
                            <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
                    <p>© {new Date().getFullYear()} CricVerse Technologies Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}