"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { z } from "zod"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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

const formSchema = z.object({
    teamA: z.string({ required_error: "Please select Team A." }),
    teamB: z.string({ required_error: "Please select Team B." }),
    venue: z.string().min(2, "Venue is required."),
    overs: z.coerce.number().min(1, "At least 1 over is required").default(20),
    oversPerBowler: z.coerce.number().min(1, "At least 1 over is required").default(4),
    date: z.date({
        required_error: "A date of match is required.",
    }),
    matchType: z.string().default("Limited Overs"),
    ballType: z.string().default("Tennis"),
    pitchType: z.string().default("Concrete"),
    tossWinner: z.string({ required_error: "Who won the toss?" }),
    tossDecision: z.string({ required_error: "What did the winner decide?" }),
}).refine((data) => data.oversPerBowler <= data.overs, {
    message: "Overs per bowler cannot be greater than total overs.",
    path: ["oversPerBowler"],
})

export default function CreateTournamentMatchPage() {
    const params = useParams()
    const router = useRouter()
    const tournamentId = params.id

    const [step, setStep] = useState(1);
    const [coinFlipping, setCoinFlipping] = useState(false);
    const [coinResult, setCoinResult] = useState(null);
    const [tournamentTeams, setTournamentTeams] = useState([]);
    const [tournamentData, setTournamentData] = useState(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamA: "",
            teamB: "",
            venue: "",
            overs: "20",
            oversPerBowler: "4",
            matchType: "Limited Overs",
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

    // Load tournament data and participating teams
    useEffect(() => {
        const tKey = `tournament_${tournamentId}`
        const tData = localStorage.getItem(tKey)
        if (tData) {
            const parsedT = JSON.parse(tData)
            setTournamentData(parsedT)

            // Pre-fill form from tournament defaults
            if (parsedT.venue) setValue("venue", parsedT.venue)
            if (parsedT.overs) {
                setValue("overs", parsedT.overs.toString())
                setValue("oversPerBowler", Math.ceil(parsedT.overs / 5).toString())
            }

            // Load connected teams
            const loadedTeams = []
            if (parsedT.teams) {
                parsedT.teams.forEach(teamId => {
                    const team = localStorage.getItem(`team_${teamId}`)
                    if (team) loadedTeams.push(JSON.parse(team))
                })
            }
            setTournamentTeams(loadedTeams)
        }
    }, [tournamentId, setValue])

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
        const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
        setTimeout(() => {
            setCoinResult(result);
            setCoinFlipping(false);
        }, 3000);
    };

    function onSubmit(values) {
        if (values.teamA === values.teamB) {
            toast.error("Teams must be different", { description: "You cannot start a match between the same team." })
            return
        }

        const matchId = Date.now().toString()

        // Get team data from loaded tournament teams
        const teamAData = tournamentTeams.find(t => t.name === values.teamA);
        const teamBData = tournamentTeams.find(t => t.name === values.teamB);

        const battingTeam = values.tossDecision === 'Bat'
            ? (values.tossWinner === values.teamA ? teamAData : teamBData)
            : (values.tossWinner === values.teamA ? teamBData : teamAData);

        const bowlingTeam = values.tossDecision === 'Bat'
            ? (values.tossWinner === values.teamA ? teamBData : teamAData)
            : (values.tossWinner === values.teamA ? teamAData : teamBData);

        // Save match data
        const matchData = {
            id: matchId,
            tournamentId: tournamentId, // Link to tournament
            ...values,
            battingTeam: {
                id: battingTeam?.id,
                name: battingTeam?.name || values.teamA,
                players: battingTeam?.players || []
            },
            bowlingTeam: {
                id: bowlingTeam?.id,
                name: bowlingTeam?.name || values.teamB,
                players: bowlingTeam?.players || []
            },
            status: 'upcoming',
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(`match_${matchId}`, JSON.stringify(matchData));

        // Update Tournament Matches List
        if (tournamentData) {
            const updatedT = {
                ...tournamentData,
                matches: [...(tournamentData.matches || []), matchId]
            }
            localStorage.setItem(`tournament_${tournamentId}`, JSON.stringify(updatedT))
        }

        toast.success("Tournament Match Scheduler!", {
            description: `${values.teamA} vs ${values.teamB} added to ${tournamentData?.name}.`
        })

        // Redirect back to tournament page
        router.push(`/tournaments/${tournamentId}`)
    }

    if (!tournamentData) return <div className="p-8 text-center">Loading tournament details...</div>

    return (
        <div className="max-w-4xl mx-auto pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/tournaments">Tournaments</Link>
                <ChevronLeft className="h-4 w-4 rotate-180" />
                <Link href={`/tournaments/${tournamentId}`}>{tournamentData.name}</Link>
                <ChevronLeft className="h-4 w-4 rotate-180" />
                <span className="text-foreground">Schedule Match</span>
            </div>

            <PageHeader
                title={step === 1 ? "Schedule Fixture" : "Toss"}
                description={step === 1 ? `Create a new match for ${tournamentData.name}.` : "Flip the coin to decide who bats first."}
                backHref={step === 1 ? `/tournaments/${tournamentId}` : undefined}
                onBack={step === 2 ? () => setStep(1) : undefined}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <>
                            {/* Team Selection Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="teamA"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Team A</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-16 text-lg font-bold">
                                                        <SelectValue placeholder="Select Team A" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {tournamentTeams.map(t => (
                                                        <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="teamB"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Team B</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-16 text-lg font-bold">
                                                        <SelectValue placeholder="Select Team B" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {tournamentTeams.filter(t => t.name !== teamA).map(t => (
                                                        <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Logistics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Match Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="venue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Venue</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Stadium Name" {...field} />
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
                                                <FormLabel>Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
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
                                                            disabled={(date) => date < new Date("1900-01-01")}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="overs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Overs</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="oversPerBowler"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Max Overs Per Bowler</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button asChild type="button" variant="outline" size="lg">
                                    <Link href={`/tournaments/${tournamentId}`}>Cancel</Link>
                                </Button>
                                <Button type="button" onClick={handleNext} size="lg" className="font-bold px-8">Next: Toss</Button>
                            </div>
                        </>
                    )}

                    {/* STEP 2: TOSS */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Who won the toss?</h3>
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
                                                            "cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:bg-muted/50",
                                                            field.value === team ? "border-primary bg-primary/5" : "border-border"
                                                        )}
                                                    >
                                                        <span className="font-bold text-lg">{team}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Winner elected to?</h3>
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
                                                            "cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:bg-muted/50",
                                                            field.value === decision ? "border-primary bg-primary/5" : "border-border"
                                                        )}
                                                    >
                                                        <span className="font-bold text-lg">{decision}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Card className="p-8 text-center bg-muted/20 border-0">
                                <div
                                    onClick={flipCoin}
                                    className={`w-32 h-32 mx-auto rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center cursor-pointer shadow-xl transition-transform ${coinFlipping ? 'animate-spin' : 'hover:scale-105'}`}
                                >
                                    {coinFlipping ? (
                                        <span className="font-black text-yellow-800">...</span>
                                    ) : coinResult ? (
                                        <span className="font-black text-2xl text-yellow-900">{coinResult}</span>
                                    ) : (
                                        <span className="font-bold text-yellow-800">CLICK TO FLIP</span>
                                    )}
                                </div>
                            </Card>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} size="lg">Back</Button>
                                <Button type="submit" size="lg" className="font-bold px-8">Confirm & Schedule</Button>
                            </div>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    )
}
