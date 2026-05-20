"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Trophy, Users, GitMerge, CheckCircle, MapPin, CalendarDays } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header" // Assuming this component exists or I should replace it with standard header if not found. I'll assume it exists based on previous file.

const formSchema = z.object({
    name: z.string().min(3, "Tournament name must be at least 3 characters."),
    type: z.string({ required_error: "Please select a tournament format." }),
    overs: z.coerce.number().min(1, "Minimum 1 over required.").max(20, "Maximum 20 overs allowed for box cricket."),
    venue: z.string().min(3, "Venue must be at least 3 characters."),
    startDate: z.string({ required_error: "Please select a start date." }),
    maxPlayersPerTeam: z.number().default(11),
})

export default function CreateTournamentPage() {
    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "league",
            overs: 6,
            venue: "",
            startDate: new Date().toISOString().split('T')[0],
            maxPlayersPerTeam: 11,
        },
    })

    async function onSubmit(values) {
        try {
            const response = await fetch('/api/tournaments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    type: values.type,
                    overs: values.overs,
                    venue: values.venue,
                    startDate: values.startDate,
                    maxPlayersPerTeam: values.maxPlayersPerTeam,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create tournament');
            }

            toast.success("Tournament Created!", {
                description: `${values.name} initialized successfully.`
            });
            router.push(`/tournaments/${data.data._id}`);
        } catch (e) {
            toast.error("Failed to create tournament", {
                description: e.message
            });
            console.error(e);
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
            <div className="flex items-center gap-4 mb-6">
                <Button asChild variant="ghost" size="icon" className="rounded-full">
                    <Link href="/tournaments">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Host Box Cricket Tournament</h1>
                    <p className="text-muted-foreground">Create a new box cricket league.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Section 1: Tournament Identity */}
                    <Card className="border-secondary/20 shadow-xl bg-card/50 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle>Tournament Details</CardTitle>
                            <CardDescription>Name your tournament.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tournament Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Trophy className="absolute left-3 top-3.5 h-5 w-5 text-primary" />
                                                <Input placeholder="e.g. Summer Premier League 2024" {...field} className="pl-10 h-12 text-lg font-bold bg-background/50 border-input/50 focus:border-primary focus:ring-primary/20" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="venue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Venue / Location</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="e.g. Wankhede Stadium" {...field} className="pl-9" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                                    <Input type="date" {...field} className="pl-9 block" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Format Display (League Only) */}
                    <Card className="border-secondary/20 shadow-xl bg-card/50 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle>Tournament Format</CardTitle>
                            <CardDescription>Box cricket tournaments use League format.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="rounded-xl border-2 border-primary bg-primary/5 ring-1 ring-primary p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-primary/10 p-3 rounded-lg">
                                                    <Users className="h-8 w-8 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <p className="font-bold text-xl">League Format</p>
                                                        <CheckCircle className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        Round Robin format where every team plays every other team.
                                                        Perfect for box cricket tournaments with multiple teams competing for the championship.
                                                    </p>
                                                    <input type="hidden" {...field} value="league" />
                                                </div>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>



                    {/* Team Size Information */}
                    <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm mb-1">Team Size Restriction</h4>
                                <p className="text-sm text-muted-foreground">
                                    All teams in this tournament will be limited to a maximum of <span className="font-bold text-foreground">11 players</span>.
                                    This restriction will be enforced when teams are added to the tournament.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-border/50">
                        <Button asChild variant="outline" size="lg" type="button" className="border-primary/20 hover:bg-primary/10 hover:text-primary">
                            <Link href="/tournaments">Cancel</Link>
                        </Button>
                        <Button type="submit" size="lg" className="font-bold shadow-lg shadow-primary/25 px-8">Create Tournament</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

