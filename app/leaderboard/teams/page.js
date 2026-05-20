"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Crown, Trophy, Medal } from "lucide-react"
import { teamLeaderboard } from "@/lib/leaderboard-data"

export default function TeamLeaderboardPage() {
    const [ballType, setBallType] = useState("leatherBall")

    const currentData = teamLeaderboard[ballType]
    const topThree = currentData.slice(0, 3)

    const getBallTypeLabel = (type) => {
        switch (type) {
            case "leatherBall": return "Leather Ball"
            case "tennisBall": return "Tennis Ball"
            default: return type
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Team Leaderboard"
                description="Top performing teams across all formats"
                backHref="/"
            />

            {/* Ball Type Selection */}
            <div className="flex justify-center">
                <Tabs value={ballType} onValueChange={setBallType} className="w-full max-w-xl">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="leatherBall" className="text-base font-bold">
                            Leather Ball
                        </TabsTrigger>
                        <TabsTrigger value="tennisBall" className="text-base font-bold">
                            Tennis Ball
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Podium Section */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-12 min-h-[300px]">
                {/* Silver - 2nd Place */}
                <Card className="w-full md:w-1/3 order-2 md:order-1 border-slate-400/30 bg-linear-to-b from-slate-400/10 to-transparent hover:shadow-2xl transition-all">
                    <CardContent className="flex flex-col items-center pt-6">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full border-4 border-slate-400 shadow-xl bg-slate-800 flex items-center justify-center">
                                <Trophy className="h-12 w-12 text-slate-400" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-900 font-bold px-3 py-0.5 rounded-full text-sm shadow-md flex items-center gap-1">
                                <Medal className="h-3 w-3" /> 2
                            </div>
                        </div>
                        <h3 className="mt-4 text-xl font-bold">{topThree[1]?.name}</h3>
                        <div className="mt-4 flex gap-4 text-center">
                            <div>
                                <div className="text-2xl font-black text-slate-200">{topThree[1]?.won}</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Wins</p>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-200">{topThree[1]?.points}</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Points</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gold - 1st Place */}
                <Card className="w-full md:w-1/3 order-1 md:order-2 border-yellow-500/30 bg-linear-to-b from-yellow-500/10 to-transparent scale-110 z-10 shadow-2xl shadow-yellow-500/10">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <Crown className="h-10 w-10 text-yellow-500 filter drop-shadow-lg animate-pulse" />
                    </div>
                    <CardContent className="flex flex-col items-center pt-8">
                        <div className="relative">
                            <div className="h-28 w-28 rounded-full border-4 border-yellow-400 shadow-2xl bg-yellow-900/50 flex items-center justify-center">
                                <Trophy className="h-14 w-14 text-yellow-400" />
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full text-base shadow-md flex items-center gap-1">
                                <Trophy className="h-4 w-4" /> 1
                            </div>
                        </div>
                        <h3 className="mt-5 text-2xl font-black">{topThree[0]?.name}</h3>
                        <div className="mt-4 flex gap-6 text-center">
                            <div>
                                <div className="text-3xl font-black text-yellow-400">{topThree[0]?.won}</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Wins</p>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-yellow-400">{topThree[0]?.points}</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Points</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bronze - 3rd Place */}
                <Card className="w-full md:w-1/3 order-3 border-orange-700/30 bg-linear-to-b from-orange-700/10 to-transparent hover:shadow-2xl transition-all">
                    <CardContent className="flex flex-col items-center pt-6">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full border-4 border-orange-700 shadow-xl bg-orange-950 flex items-center justify-center">
                                <Trophy className="h-12 w-12 text-orange-700" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-orange-100 font-bold px-3 py-0.5 rounded-full text-sm shadow-md flex items-center gap-1">
                                <Medal className="h-3 w-3" /> 3
                            </div>
                        </div>
                        <h3 className="mt-4 text-xl font-bold">{topThree[2]?.name}</h3>
                        <div className="mt-4 flex gap-4 text-center">
                            <div>
                                <div className="text-2xl font-black text-orange-200">{topThree[2]?.won}</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Wins</p>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-orange-200">{topThree[2]?.points}</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Points</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Full Leaderboard Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{getBallTypeLabel(ballType)} - Team Rankings</CardTitle>
                    <CardDescription>Complete standings for the season</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Rank</TableHead>
                                <TableHead>Team</TableHead>
                                <TableHead className="text-center">Matches</TableHead>
                                <TableHead className="text-center">Won</TableHead>
                                <TableHead className="text-center">Lost</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                                <TableHead className="text-right">NRR</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.map((team) => (
                                <TableRow key={team.rank}>
                                    <TableCell className="font-medium">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${team.rank <= 3 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {team.rank}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{team.name}</TableCell>
                                    <TableCell className="text-center text-muted-foreground">{team.matches}</TableCell>
                                    <TableCell className="text-center text-green-500 font-bold">{team.won}</TableCell>
                                    <TableCell className="text-center text-red-500 font-bold">{team.lost}</TableCell>
                                    <TableCell className="text-right font-black text-lg">{team.points}</TableCell>
                                    <TableCell className={`text-right font-bold ${team.nrr.startsWith('+') ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {team.nrr}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
