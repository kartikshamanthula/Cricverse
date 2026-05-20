"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { z } from "zod"
import Link from "next/link"
import { ChevronLeft, Calendar as CalendarIcon, MapPin, Trophy, Swords, Plus, Edit } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { EditTeamDialog } from "@/components/teams/EditTeamDialog"
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog"

const formSchema = z.object({
    teamA: z.string({ required_error: "Please select Team A." }),
    teamB: z.string({ required_error: "Please select Team B." }),
    venue: z.string().min(2, "Venue is required."),
    overs: z.coerce.number().min(1, "At least 1 over is required").default(20),
    oversPerBowler: z.coerce.number().min(1, "At least 1 over is required").default(4),
    date: z.date({
        required_error: "A date of match is required.",
    }),
    matchType: z.string().default("Box/Turf Cricket"),
    ballType: z.string().default("Tennis"),
    pitchType: z.string().default("Concrete"),
    tossWinner: z.string().optional(),
    tossDecision: z.string().optional(),
}).refine((data) => data.oversPerBowler <= data.overs, {
    message: "Overs per bowler cannot be greater than total overs.",
    path: ["oversPerBowler"],
})

export default function CreateMatchPage() {
    const [step, setStep] = useState(1);
    const [coinFlipping, setCoinFlipping] = useState(false);
    const [coinResult, setCoinResult] = useState(null); // 'Heads' or 'Tails'
    const [teams, setTeams] = useState([]);
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [creatingForTeam, setCreatingForTeam] = useState(null); // 'A' or 'B'

    const fetchTeams = async () => {
        try {
            const res = await fetch('/api/teams');
            const data = await res.json();
            if (data.success) {
                setTeams(data.data.map(team => ({
                    ...team,
                    id: team._id // Ensure ID mapping
                })));
            } else {
                toast.error("Failed to load teams");
            }
        } catch (error) {
            console.error("Error loading teams:", error);
            toast.error("Failed to load teams");
        }
    };

    // Load teams from API
    useEffect(() => {
        fetchTeams();
    }, []);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamA: "",
            teamB: "",
            venue: "",
            overs: "20",
            oversPerBowler: "4",
            matchType: "Box/Turf Cricket",
            ballType: "Tennis",
            pitchType: "Concrete",
            tossWinner: "",
            tossDecision: "",
        }
    })

    const { watch, setValue, trigger } = form
    const teamA = watch('teamA')
    const teamB = watch('teamB')
    const overs = watch('overs')
    const tossWinner = watch('tossWinner')
    const tossDecision = watch('tossDecision')

    useEffect(() => {
        const oversNum = parseInt(overs)
        if (!isNaN(oversNum) && oversNum > 0) {
            const calculatedLimit = Math.ceil(oversNum / 5)
            if (calculatedLimit >= 1) {
                setValue("oversPerBowler", calculatedLimit.toString())
            }
        }
    }, [overs, setValue])

    const handleNext = async () => {
        const isValid = await trigger(['teamA', 'teamB', 'venue', 'overs', 'oversPerBowler', 'date']);
        if (isValid) {
            setStep(2);
        }
    };

    const flipCoin = () => {
        if (coinFlipping) return;
        setCoinFlipping(true);
        setCoinResult(null);

        // Random result
        const result = Math.random() > 0.5 ? 'Heads' : 'Tails';

        setTimeout(() => {
            setCoinResult(result);
            setCoinFlipping(false);
        }, 3000); // 3 seconds flip
    };

    const handleSchedule = async () => {
        const isValid = await trigger(['teamA', 'teamB', 'venue', 'overs', 'oversPerBowler', 'date']);
        if (isValid) {
            const values = form.getValues();
            if (values.teamA === values.teamB) {
                toast.error("Teams must be different", { description: "You cannot schedule a match between the same team." });
                return;
            }

            try {
                const scheduleValues = { ...values, tossWinner: null, tossDecision: null };
                const response = await fetch('/api/matches', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(scheduleValues),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to create match');
                toast.success("Match Scheduled!", { description: `${values.teamA} vs ${values.teamB} scheduled successfully.` });
                setTimeout(() => {
                    window.location.href = `/matches`;
                }, 1000);
            } catch (error) {
                console.error('Error scheduling match:', error);
                toast.error("Failed to schedule match", { description: error.message || "Please try again later." });
            }
        }
    };

    async function onSubmit(values) {
        if (!values.tossWinner || !values.tossDecision) {
            toast.error("Toss details required", { description: "Please complete the toss to start the match." })
            return
        }

        if (values.teamA === values.teamB) {
            toast.error("Teams must be different", { description: "You cannot start a match between the same team." })
            return
        }

        try {
            // Find team IDs from names first? API handles it.
            // Just send values as is.
            const response = await fetch('/api/matches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create match');
            }

            toast.success("Match Created!", {
                description: `${values.teamA} vs ${values.teamB} - Toss won by ${values.tossWinner} (${values.tossDecision})`
            })

            // Navigate to player selection page
            // Use window.location.href or router.push? 
            // router.push is better but file uses window.location inside select trigger.
            // Let's stick to window.location for now or switch to router if I import it.
            // I'll stick to window.location to minimize changes, but router is better.
            // I'll use window.location as per existing pattern for minimal diff.
            // Actually, I'll use router if it's imported? No, it's not.
            // I'll add router import if needed, but window.location works.

            setTimeout(() => {
                window.location.href = `/matches/${data._id}/start-innings`
            }, 1000)

        } catch (error) {
            console.error('Error creating match:', error);
            toast.error("Failed to create match", {
                description: error.message || "Please try again later."
            });
        }
    }

    return (
        <div className="max-w-4xl mx-auto pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title={step === 1 ? "Start Match" : "Toss"}
                description={step === 1 ? "Set up a new fixture between two teams." : "Flip the coin to decide who bats first."}
                backHref={step === 1 ? "/matches" : undefined}
                onBack={step === 2 ? () => setStep(1) : undefined}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* STEP 1: CONFIGURATION */}
                    {step === 1 && (
                        <>
                            {/* Face Off Section */}
                            {/* Face Off Section */}
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-8 md:gap-6 items-stretch mt-16 sm:mt-24 md:mt-32 mb-12">
                                {/* Team A Selection */}
                                <div className="md:col-span-3 mb-24 md:mb-0">
                                    <FormField
                                        control={form.control}
                                        name="teamA"
                                        render={({ field }) => (
                                            <FormItem className="h-full">
                                                <Select
                                                    onValueChange={(value) => {
                                                        if (value === "create_new") {
                                                            setCreatingForTeam('A');
                                                            setIsCreatingTeam(true);
                                                        } else {
                                                            field.onChange(value);
                                                        }
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-auto w-full p-0 border-0 outline-none focus:outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none hover:bg-transparent [&>svg]:hidden bg-transparent">
                                                            <span className="flex flex-col items-center w-full gap-4 pt-8 sm:pt-10"> {/* Responsive padding top for icon space */}
                                                                {/* The Card Box - Icon is now effectively inside the flow or overlapping safely */}
                                                                <span className={cn(
                                                                    "relative w-full rounded-3xl border-2 p-6 sm:p-8 pt-12 sm:pt-16 pb-8 sm:pb-10 flex flex-col items-center justify-start gap-3 transition-all cursor-pointer overflow-visible",
                                                                    field.value
                                                                        ? "border-emerald-400 bg-emerald-50/50 shadow-xl shadow-emerald-100"
                                                                        : "border-dashed border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40"
                                                                )}>
                                                                    {/* Floating Icon */}
                                                                    <span className={cn(
                                                                        "absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center font-black text-3xl sm:text-4xl shadow-lg border-4 transition-all z-20 overflow-hidden",
                                                                        field.value ? "bg-white border-emerald-400 text-emerald-600 scale-105" : "bg-white border-emerald-200 text-emerald-300"
                                                                    )}>
                                                                        <span className="absolute inset-0 rounded-full bg-emerald-50/50 -z-10 blur-xl opacity-50" />
                                                                        {(() => {
                                                                            const selectedTeam = teams.find(t => t.name === field.value);
                                                                            if (selectedTeam?.logoUrl) {
                                                                                return <img src={selectedTeam.logoUrl} alt={field.value} className="h-full w-full object-cover" />;
                                                                            }
                                                                            return field.value ? field.value[0] : 'A';
                                                                        })()}
                                                                    </span>

                                                                    <span className="text-center w-full z-10 flex flex-col items-center">
                                                                        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-emerald-600/60 block">TEAM A</span>
                                                                    </span>
                                                                </span>

                                                                {/* Select Team Text (Outside Box) */}
                                                                <span className={cn(
                                                                    "text-xl sm:text-2xl font-bold transition-colors truncate block px-2 py-1 mt-2 sm:mt-3 mb-3 sm:mb-4",
                                                                    field.value ? "text-emerald-600" : "text-emerald-400"
                                                                )}>
                                                                    {field.value || "Select Team"}
                                                                </span>
                                                            </span>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                                                        <SelectItem value="create_new" className="font-semibold text-primary focus:text-primary cursor-pointer">
                                                            <div className="flex items-center">
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Create New Team
                                                            </div>
                                                        </SelectItem>
                                                        <div className="h-px bg-border w-full my-1" />
                                                        {teams.length > 0 ? (
                                                            teams.filter(team => team.name !== teamB).map((team) => (
                                                                <div key={team.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-sm group">
                                                                    <SelectItem value={team.name} className="flex-1 border-0 focus:bg-transparent">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-6 w-6 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border/50 shrink-0">
                                                                                {team.logoUrl ? (
                                                                                    <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover shadow-sm" />
                                                                                ) : (
                                                                                    <span className="text-[10px] font-bold opacity-40 uppercase">{team.name[0]}</span>
                                                                                )}
                                                                            </div>
                                                                            <span className="font-medium">{team.name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setEditingTeamId(team.id);
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all"
                                                                        title="Edit team"
                                                                    >
                                                                        <Edit className="h-3.5 w-3.5 text-primary" />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                                No teams found. Create one first!
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-center" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* VS Divider */}
                                <div className="hidden md:flex flex-col items-center justify-center text-muted-foreground/30 z-10">
                                    <div className="h-full w-px bg-linear-to-b from-transparent via-border to-transparent" />
                                    <div className="bg-background p-2 rounded-full border border-border/50 shadow-sm my-4">
                                        <Swords className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <span className="font-black text-3xl tracking-widest text-muted-foreground/30">VS</span>
                                    <div className="h-full w-px bg-linear-to-t from-transparent via-border to-transparent" />
                                </div>

                                {/* Team B Selection */}
                                <div className="md:col-span-3 mb-24 md:mb-0">
                                    <FormField
                                        control={form.control}
                                        name="teamB"
                                        render={({ field }) => (
                                            <FormItem className="h-full">
                                                <Select
                                                    onValueChange={(value) => {
                                                        if (value === "create_new") {
                                                            setCreatingForTeam('B');
                                                            setIsCreatingTeam(true);
                                                        } else {
                                                            field.onChange(value);
                                                        }
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-auto w-full p-0 border-0 outline-none focus:outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none hover:bg-transparent [&>svg]:hidden bg-transparent">
                                                            <span className="flex flex-col items-center w-full gap-4 pt-8 sm:pt-10"> {/* Responsive padding top for icon space */}
                                                                {/* The Card Box */}
                                                                <span className={cn(
                                                                    "relative w-full rounded-3xl border-2 p-6 sm:p-8 pt-12 sm:pt-16 pb-8 sm:pb-10 flex flex-col items-center justify-start gap-3 transition-all cursor-pointer overflow-visible",
                                                                    field.value
                                                                        ? "border-rose-400 bg-rose-50/50 shadow-xl shadow-rose-100"
                                                                        : "border-dashed border-rose-300 bg-rose-50/20 hover:bg-rose-50/40"
                                                                )}>
                                                                    {/* Floating Icon */}
                                                                    <span className={cn(
                                                                        "absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center font-black text-3xl sm:text-4xl shadow-lg border-4 transition-all z-20 overflow-hidden",
                                                                        field.value ? "bg-white border-rose-400 text-rose-600 scale-105" : "bg-white border-rose-200 text-rose-300"
                                                                    )}>
                                                                        <span className="absolute inset-0 rounded-full bg-rose-50/50 -z-10 blur-xl opacity-50" />
                                                                        {(() => {
                                                                            const selectedTeam = teams.find(t => t.name === field.value);
                                                                            if (selectedTeam?.logoUrl) {
                                                                                return <img src={selectedTeam.logoUrl} alt={field.value} className="h-full w-full object-cover" />;
                                                                            }
                                                                            return field.value ? field.value[0] : 'B';
                                                                        })()}
                                                                    </span>

                                                                    <span className="text-center w-full z-10 flex flex-col items-center">
                                                                        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-rose-600/60 block">TEAM B</span>
                                                                    </span>
                                                                </span>

                                                                {/* Select Team Text (Outside Box) */}
                                                                <span className={cn(
                                                                    "text-xl sm:text-2xl font-bold transition-colors truncate block px-2 py-1 mt-2 sm:mt-3 mb-3 sm:mb-4",
                                                                    field.value ? "text-rose-600" : "text-rose-400"
                                                                )}>
                                                                    {field.value || "Select Team"}
                                                                </span>
                                                            </span>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                                                        <SelectItem value="create_new" className="font-semibold text-primary focus:text-primary cursor-pointer">
                                                            <div className="flex items-center">
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Create New Team
                                                            </div>
                                                        </SelectItem>
                                                        <div className="h-px bg-border w-full my-1" />
                                                        {teams.length > 0 ? (
                                                            teams.filter(team => team.name !== teamA).map((team) => (
                                                                <div key={team.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-sm group">
                                                                    <SelectItem value={team.name} className="flex-1 border-0 focus:bg-transparent">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-6 w-6 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border/50 shrink-0">
                                                                                {team.logoUrl ? (
                                                                                    <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover shadow-sm" />
                                                                                ) : (
                                                                                    <span className="text-[10px] font-bold opacity-40 uppercase">{team.name[0]}</span>
                                                                                )}
                                                                            </div>
                                                                            <span className="font-medium">{team.name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setEditingTeamId(team.id);
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all"
                                                                        title="Edit team"
                                                                    >
                                                                        <Edit className="h-3.5 w-3.5 text-primary" />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                                No teams found. Create one first!
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-center" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Match Configuration Section */}
                            <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle>Match Configuration</CardTitle>
                                    <CardDescription>Customize the rules and playing conditions.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Match Type */}
                                    <FormField
                                        control={form.control}
                                        name="matchType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Match type<span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["Box/Turf Cricket", "Gully Cricket"].map((type) => (
                                                            <Button
                                                                key={type}
                                                                type="button"
                                                                variant={field.value === type ? "default" : "outline"}
                                                                className={cn(
                                                                    "rounded-full transition-all",
                                                                    field.value === type ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-transparent hover:bg-accent"
                                                                )}
                                                                onClick={() => field.onChange(type)}
                                                            >
                                                                {type}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Overs Configuration */}
                                    <div className="flex flex-col sm:flex-row gap-6 items-end">
                                        <FormField
                                            control={form.control}
                                            name="overs"
                                            render={({ field }) => (
                                                <FormItem className="flex-1 space-y-3">
                                                    <FormLabel>No. Of overs<span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type="number" {...field} className="border-0 border-b-2 border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-lg" placeholder="20" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="oversPerBowler"
                                            render={({ field }) => (
                                                <FormItem className="flex-1 space-y-3">
                                                    <FormLabel>Overs per bowler...</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input type="number" {...field} className="border-0 border-b-2 border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-lg" placeholder="4" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Ball Type */}
                                    <FormField
                                        control={form.control}
                                        name="ballType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Ball type<span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-6">
                                                        <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => field.onChange("Hard Tennis")}>
                                                            <div className={cn(
                                                                "h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all",
                                                                field.value === "Hard Tennis" ? "border-green-500 scale-110 shadow-lg shadow-green-500/20" : "border-border group-hover:border-green-500/50"
                                                            )}>
                                                                <div className="h-8 w-8 rounded-full bg-[#D1E231] border border-black/10 relative overflow-hidden">
                                                                    <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full stroke-white/40 stroke-2 fill-none">
                                                                        <path d="M-2,16 Q16,-2 34,16" />
                                                                        <path d="M-2,16 Q16,34 34,16" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <span className={cn("text-xs font-medium transition-colors", field.value === "Hard Tennis" ? "text-foreground" : "text-muted-foreground")}>Hard Tennis</span>
                                                        </div>
                                                        <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => field.onChange("Soft Tennis")}>
                                                            <div className={cn(
                                                                "h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all",
                                                                field.value === "Soft Tennis" ? "border-green-500 scale-110 shadow-lg shadow-green-500/20" : "border-border group-hover:border-green-500/50"
                                                            )}>
                                                                <div className="h-8 w-8 rounded-full bg-[#D1E231] border border-black/10 relative overflow-hidden">
                                                                    <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full stroke-white/40 stroke-2 fill-none">
                                                                        <path d="M-2,16 Q16,-2 34,16" />
                                                                        <path d="M-2,16 Q16,34 34,16" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <span className={cn("text-xs font-medium transition-colors", field.value === "Soft Tennis" ? "text-foreground" : "text-muted-foreground")}>Soft Tennis</span>
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Pitch Type */}
                                    <FormField
                                        control={form.control}
                                        name="pitchType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Pitch type</FormLabel>
                                                <FormControl>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["Cement", "Turf"].map((type) => (
                                                            <Button
                                                                key={type}
                                                                type="button"
                                                                variant="ghost"
                                                                className={cn(
                                                                    "rounded-full border hover:bg-accent transition-all",
                                                                    field.value === type ? "bg-accent/80 border-primary text-primary font-semibold shadow-sm" : "border-transparent bg-muted/30 text-muted-foreground"
                                                                )}
                                                                onClick={() => field.onChange(type)}
                                                            >
                                                                {type.toUpperCase()}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Logistics Section */}
                            <Card className="border-secondary/20 shadow-xl bg-card/50 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle>Match Logistics</CardTitle>
                                    <CardDescription>Where and when is this Match?</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="venue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Venue</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="e.g. Happy Box Cricket Ground" {...field} className="pl-9 bg-background/50" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Match Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal bg-background/50 border-input/50",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => {
                                                                const today = new Date()
                                                                today.setHours(0, 0, 0, 0)
                                                                return date < today || date < new Date("1900-01-01")
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-3 pt-4">
                                <Link href="/matches" className={cn(
                                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                    "border border-primary/20 hover:bg-primary/10 hover:text-primary h-10 px-8 py-2" // Variant="outline", size="lg" equivalent
                                )}>
                                    Cancel
                                </Link>
                                <Button type="button" variant="secondary" onClick={handleSchedule} size="lg" className="px-8 border border-secondary shadow-lg">Schedule Match</Button>
                                <Button type="button" onClick={handleNext} size="lg" className="font-bold shadow-lg shadow-primary/25 px-8">Next Toss</Button>
                            </div>
                        </>
                    )}

                    {/* STEP 2: TOSS INTERFACE */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Section 1: Who won the toss? */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-muted-foreground">Who won the toss?</h3>
                                <FormField
                                    control={form.control}
                                    name="tossWinner"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[teamA, teamB].filter(Boolean).map((team) => (
                                                    <div
                                                        key={team}
                                                        onClick={() => field.onChange(team)}
                                                        className={cn(
                                                            "cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-md hover:scale-[1.02]",
                                                            field.value === team
                                                                ? "border-primary bg-primary/5 shadow-primary/10 shadow-lg"
                                                                : "border-border bg-card hover:bg-accent"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "h-16 w-16 rounded-full flex items-center justify-center font-black text-2xl shadow-sm transition-colors overflow-hidden",
                                                            field.value === team ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {(() => {
                                                                const teamObj = teams.find(t => t.name === team);
                                                                if (teamObj?.logoUrl) {
                                                                    return <img src={teamObj.logoUrl} alt={team} className="h-full w-full object-cover" />;
                                                                }
                                                                return team[0];
                                                            })()}
                                                        </div>
                                                        <span className={cn("font-bold text-lg text-center leading-tight", field.value === team ? "text-foreground" : "text-muted-foreground")}>{team}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Section 2: Winner elected to? */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-muted-foreground">Winner of the toss elected to?</h3>
                                <FormField
                                    control={form.control}
                                    name="tossDecision"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['Bat', 'Bowl'].map((decision) => (
                                                    <div
                                                        key={decision}
                                                        onClick={() => field.onChange(decision)}
                                                        className={cn(
                                                            "cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-md hover:scale-[1.02]",
                                                            field.value === decision
                                                                ? (decision === 'Bat' ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-blue-500/10 shadow-lg" : "border-green-500 bg-green-50 dark:bg-green-500/10 shadow-green-500/10 shadow-lg")
                                                                : "border-border bg-card hover:bg-accent"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "h-16 w-16 rounded-full flex items-center justify-center text-white shadow-md",
                                                            decision === 'Bat' ? "bg-linear-to-br from-blue-400 to-blue-600" : "bg-linear-to-br from-green-400 to-green-600"
                                                        )}>
                                                            {decision === 'Bat' ? <Swords className="h-8 w-8" /> : <div className="h-8 w-8 rounded-full border-2 border-white/80 bg-white/20" />}
                                                        </div>
                                                        <span className={cn("font-bold text-lg", field.value === decision ? "text-foreground" : "text-muted-foreground")}>{decision}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Section 3: Professional 3D Coin Flip */}
                            <div className="space-y-6 text-center py-8">
                                <h3 className="text-lg sm:text-xl font-bold text-muted-foreground">Tap the coin to flip</h3>
                                <div className="relative flex justify-center py-10 perspective-1000">
                                    {/* Shadow indicating height */}
                                    <div
                                        className={cn(
                                            "absolute bottom-0 w-24 sm:w-32 h-6 bg-black/20 rounded-[100%] blur-md transition-all duration-[3000ms]",
                                            coinFlipping ? "animate-shadow-shrink" : "scale-100 opacity-50"
                                        )}
                                    />

                                    <div
                                        onClick={flipCoin}
                                        className={cn(
                                            "relative h-40 w-40 sm:h-56 sm:w-56 cursor-pointer preserve-3d transition-transform",
                                            coinFlipping ? "animate-coin-toss" : ""
                                        )}
                                        style={{
                                            transform: coinResult
                                                ? (coinResult === 'Heads' ? 'rotateY(0deg)' : 'rotateY(180deg)')
                                                : 'rotateY(0deg)'
                                        }}
                                    >
                                        {/* EDGE LAYERS (To simulate thickness) */}
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute inset-0 rounded-full border border-yellow-700/30"
                                                style={{ transform: `translateZ(-${i}px)` }}
                                            />
                                        ))}

                                        {/* Front (Heads) */}
                                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] shadow-[inset_-5px_-5px_20px_rgba(0,0,0,0.5),inset_5px_5px_10px_rgba(255,255,255,0.7)] flex items-center justify-center border-2 border-yellow-600 backface-hidden z-10">
                                            {/* Outer Ring */}
                                            <div className="absolute inset-1 rounded-full border-4 border-dashed border-yellow-800/20" />
                                            {/* Inner Groove */}
                                            <div className="absolute inset-3 rounded-full border border-yellow-600/30 bg-linear-to-tr from-[#FDB931] to-[#FFD700]" />

                                            {/* Content */}
                                            <div className="relative z-20 flex flex-col items-center justify-center">
                                                <div className="text-[0.6rem] font-bold tracking-[0.2em] text-yellow-900 mb-1 opacity-80">CRICVERSE</div>
                                                <div className="h-24 w-24 bg-linear-to-br from-yellow-700 to-yellow-900 rounded-full flex items-center justify-center shadow-inner border border-yellow-600/50">
                                                    <Trophy className="h-14 w-14 text-yellow-100 drop-shadow-md" strokeWidth={2} />
                                                </div>
                                                <span className="block font-black text-3xl text-yellow-900 mt-2 tracking-widest drop-shadow-sm font-serif">HEADS</span>
                                            </div>

                                            {/* Shine effect */}
                                            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-linear-to-tr from-white/60 via-transparent to-transparent opacity-40 pointer-events-none" />
                                        </div>

                                        {/* Back (Tails) */}
                                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[inset_-5px_-5px_20px_rgba(0,0,0,0.5),inset_5px_5px_10px_rgba(255,255,255,0.7)] flex items-center justify-center border-2 border-slate-500 backface-hidden z-10" style={{ transform: 'rotateY(180deg)' }}>
                                            {/* Outer Ring */}
                                            <div className="absolute inset-1 rounded-full border-4 border-dashed border-slate-600/20" />
                                            {/* Inner Groove */}
                                            <div className="absolute inset-3 rounded-full border border-slate-400/30 bg-linear-to-tr from-slate-300 to-slate-100" />

                                            {/* Content */}
                                            <div className="relative z-20 flex flex-col items-center justify-center">
                                                <div className="text-[0.6rem] font-bold tracking-[0.2em] text-slate-700 mb-1 opacity-80">CRICVERSE</div>
                                                <div className="h-24 w-24 bg-linear-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-inner border border-slate-500/50">
                                                    <span className="font-serif text-6xl font-bold text-slate-200 drop-shadow-md">I</span>
                                                </div>
                                                <span className="block font-black text-3xl text-slate-800 mt-2 tracking-widest drop-shadow-sm font-serif">TAILS</span>
                                            </div>

                                            {/* Shine effect */}
                                            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-linear-to-tr from-white/60 via-transparent to-transparent opacity-40 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-12 flex items-center justify-center">
                                    {coinResult && (
                                        <div className="px-4 sm:px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-2xl sm:text-3xl font-black animate-in zoom-in slide-in-from-bottom-2 duration-300 text-primary drop-shadow-sm">
                                            It's <span className="uppercase tracking-wide">{coinResult}</span>!
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t flex items-center justify-center md:relative md:bg-transparent md:border-0 md:p-0 mt-8">
                                <div className="flex gap-3">
                                    <Button variant="outline" size="lg" type="button" onClick={() => setStep(1)} className="border-primary/20">Back</Button>
                                    <Button type="submit" size="lg" className="font-bold shadow-xl shadow-primary/20 px-8 min-w-[150px]">Start Match</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </Form>


            {/* Edit Team Dialog Component */}
            <EditTeamDialog
                isOpen={!!editingTeamId}
                onClose={() => setEditingTeamId(null)}
                teamId={editingTeamId}
                onTeamUpdated={fetchTeams}
            />

            {/* Create Team Dialog Component */}
            <CreateTeamDialog
                isOpen={isCreatingTeam}
                onClose={() => {
                    setIsCreatingTeam(false);
                    setCreatingForTeam(null);
                }}
                onTeamCreated={async (newTeamData) => {
                    await fetchTeams();

                    const actualTeam = newTeamData?.data || newTeamData;
                    if (actualTeam?.name) {
                        if (creatingForTeam === 'A') {
                            form.setValue('teamA', actualTeam.name);
                        } else if (creatingForTeam === 'B') {
                            form.setValue('teamB', actualTeam.name);
                        }
                    }
                    setIsCreatingTeam(false);
                    setCreatingForTeam(null);
                }}
            />
        </div>
    )
}

