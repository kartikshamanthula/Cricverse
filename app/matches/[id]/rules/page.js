"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import {
    Trophy,
    Clock,
    Users,
    Target,
    Circle,
    MapPin,
    Calendar,
    Zap
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function MatchRulesPage({ params }) {
    const router = useRouter()
    const { id } = use(params)

    // Mock match data - replace with actual API call
    const matchData = {
        teamA: "Royal Strikers",
        teamB: "Thunder XI",
        venue: "Wankhede Stadium",
        date: "January 18, 2026",
        matchType: "Limited Overs",
        overs: 20,
        oversPerBowler: 4,
        ballType: "Tennis",
        pitchType: "Concrete",
        tossWinner: "Royal Strikers",
        tossDecision: "Bat"
    }

    const rules = [
        {
            icon: Clock,
            title: "Match Format",
            items: [
                `${matchData.matchType} match`,
                `${matchData.overs} overs per innings`,
                `Maximum ${matchData.oversPerBowler} overs per bowler`
            ]
        },
        {
            icon: Circle,
            title: "Ball & Pitch",
            items: [
                `Ball type: ${matchData.ballType}`,
                `Pitch type: ${matchData.pitchType}`,
                "Standard cricket rules apply"
            ]
        },
        {
            icon: Users,
            title: "Team Composition",
            items: [
                "11 players per team",
                "Minimum 2 batsmen on field",
                "Wicket keeper mandatory"
            ]
        },
        {
            icon: Target,
            title: "Bowling Rules",
            items: [
                `Max ${matchData.oversPerBowler} overs per bowler`,
                "No bowler can bowl consecutive overs",
                "6 legal deliveries per over"
            ]
        },
        {
            icon: Zap,
            title: "Scoring",
            items: [
                "Runs: 0, 1, 2, 3, 4, 6",
                "Extras: Wide, No-ball, Bye, Leg-bye",
                "Wickets: Bowled, Caught, LBW, Run-out, Stumped"
            ]
        },
        {
            icon: Trophy,
            title: "Result",
            items: [
                "Team with higher score wins",
                "Tie if scores are equal",
                "Super over in case of tie (optional)"
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto pt-2 pb-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PageHeader
                    title="Match Rules"
                    description="Review the match configuration and playing rules."
                    onBack={() => router.back()}
                />

                {/* Match Details Card */}
                <Card className="mb-6 border-primary/20 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            Match Details
                        </CardTitle>
                        <CardDescription>Configuration for this match</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Teams */}
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-lg border-2 border-emerald-400">
                                    {matchData.teamA[0]}
                                </div>
                                <span className="font-semibold">{matchData.teamA}</span>
                            </div>
                            <span className="text-2xl font-black text-muted-foreground">VS</span>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">{matchData.teamB}</span>
                                <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center font-bold text-rose-600 dark:text-rose-400 text-lg border-2 border-rose-400">
                                    {matchData.teamB[0]}
                                </div>
                            </div>
                        </div>

                        {/* Venue & Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Venue</p>
                                    <p className="font-semibold">{matchData.venue}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Date</p>
                                    <p className="font-semibold">{matchData.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Toss Result */}
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Toss Result</p>
                            <p className="font-semibold">
                                <span className="text-primary">{matchData.tossWinner}</span> won the toss and elected to{" "}
                                <Badge variant={matchData.tossDecision === "Bat" ? "default" : "secondary"}>
                                    {matchData.tossDecision}
                                </Badge>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Rules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {rules.map((rule, index) => (
                        <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <rule.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    {rule.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {rule.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] shadow-lg"
                        onClick={() => router.back()}
                    >
                        Back to Player Selection
                    </Button>
                </div>
            </div>
        </div>
    )
}
