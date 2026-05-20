"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Trophy, Medal } from "lucide-react"
import { playerLeaderboard } from "@/lib/leaderboard-data"

export default function PlayerLeaderboardPage() {
    const [ballType, setBallType] = useState("leatherBall")
    const [category, setCategory] = useState("batting")

    const currentData = playerLeaderboard[ballType][category]
    const topThree = currentData.slice(0, 3)

    const getBallTypeLabel = (type) => {
        switch (type) {
            case "leatherBall": return "Leather Ball"
            case "tennisBall": return "Tennis Ball"
            case "boxCricket": return "Box Cricket"
            default: return type
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Player Leaderboard"
                description="Top performing players across all formats"
                backHref="/"
            />

            {/* Ball Type Selection */}
            <div className="flex justify-center">
                <Tabs value={ballType} onValueChange={setBallType} className="w-full max-w-2xl">
                    <TabsList className="grid w-full grid-cols-3 h-12">
                        <TabsTrigger value="leatherBall" className="text-base font-bold">
                            Leather Ball
                        </TabsTrigger>
                        <TabsTrigger value="tennisBall" className="text-base font-bold">
                            Tennis Ball
                        </TabsTrigger>
                        <TabsTrigger value="boxCricket" className="text-base font-bold">
                            Box Cricket
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Category Selection */}
            <div className="flex justify-center">
                <Tabs value={category} onValueChange={setCategory} className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="batting" className="text-base font-bold">
                            🏏 Batting
                        </TabsTrigger>
                        <TabsTrigger value="bowling" className="text-base font-bold">
                            ⚡ Bowling
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
                            <Avatar className="h-24 w-24 border-4 border-slate-400 shadow-xl">
                                <AvatarFallback className="text-2xl bg-slate-800 text-slate-200">
                                    {topThree[1]?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-900 font-bold px-3 py-0.5 rounded-full text-sm shadow-md flex items-center gap-1">
                                <Medal className="h-3 w-3" /> 2
                            </div>
                        </div>
                        <h3 className="mt-4 text-xl font-bold">{topThree[1]?.name}</h3>
                        <p className="text-sm text-slate-400 font-mono">{topThree[1]?.team}</p>
                        <div className="mt-4 text-3xl font-black text-slate-200">
                            {category === "batting" ? topThree[1]?.runs : topThree[1]?.wickets}
                        </div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {category === "batting" ? "Runs" : "Wickets"}
                        </p>
                    </CardContent>
                </Card>

                {/* Gold - 1st Place */}
                <Card className="w-full md:w-1/3 order-1 md:order-2 border-yellow-500/30 bg-linear-to-b from-yellow-500/10 to-transparent scale-110 z-10 shadow-2xl shadow-yellow-500/10">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <Crown className="h-10 w-10 text-yellow-500 filter drop-shadow-lg animate-pulse" />
                    </div>
                    <CardContent className="flex flex-col items-center pt-8">
                        <div className="relative">
                            <Avatar className="h-28 w-28 border-4 border-yellow-400 shadow-2xl">
                                <AvatarFallback className="text-4xl bg-yellow-900/50 text-yellow-200">
                                    {topThree[0]?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full text-base shadow-md flex items-center gap-1">
                                <Trophy className="h-4 w-4" /> 1
                            </div>
                        </div>
                        <h3 className="mt-5 text-2xl font-black">{topThree[0]?.name}</h3>
                        <p className="text-sm text-yellow-500/80 font-mono">{topThree[0]?.team}</p>
                        <div className="mt-4 text-4xl font-black text-yellow-400">
                            {category === "batting" ? topThree[0]?.runs : topThree[0]?.wickets}
                        </div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {category === "batting" ? "Runs" : "Wickets"}
                        </p>
                    </CardContent>
                </Card>

                {/* Bronze - 3rd Place */}
                <Card className="w-full md:w-1/3 order-3 border-orange-700/30 bg-linear-to-b from-orange-700/10 to-transparent hover:shadow-2xl transition-all">
                    <CardContent className="flex flex-col items-center pt-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-orange-700 shadow-xl">
                                <AvatarFallback className="text-2xl bg-orange-950 text-orange-200">
                                    {topThree[2]?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-orange-100 font-bold px-3 py-0.5 rounded-full text-sm shadow-md flex items-center gap-1">
                                <Medal className="h-3 w-3" /> 3
                            </div>
                        </div>
                        <h3 className="mt-4 text-xl font-bold">{topThree[2]?.name}</h3>
                        <p className="text-sm text-orange-500 font-mono">{topThree[2]?.team}</p>
                        <div className="mt-4 text-3xl font-black text-orange-200">
                            {category === "batting" ? topThree[2]?.runs : topThree[2]?.wickets}
                        </div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {category === "batting" ? "Runs" : "Wickets"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Full Leaderboard Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {getBallTypeLabel(ballType)} - {category === "batting" ? "Top Run Scorers" : "Top Wicket Takers"}
                    </CardTitle>
                    <CardDescription>Complete rankings for the season</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Rank</TableHead>
                                <TableHead>Player</TableHead>
                                <TableHead>Team</TableHead>
                                {category === "batting" ? (
                                    <>
                                        <TableHead className="text-right">Runs</TableHead>
                                        <TableHead className="text-right">Avg</TableHead>
                                        <TableHead className="text-right">SR</TableHead>
                                        <TableHead className="text-right">100s/50s</TableHead>
                                    </>
                                ) : (
                                    <>
                                        <TableHead className="text-right">Wickets</TableHead>
                                        <TableHead className="text-right">Avg</TableHead>
                                        <TableHead className="text-right">Econ</TableHead>
                                        <TableHead className="text-right">Best</TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.map((player) => (
                                <TableRow key={player.rank}>
                                    <TableCell className="font-medium">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${player.rank <= 3 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {player.rank}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{player.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{player.team}</TableCell>
                                    {category === "batting" ? (
                                        <>
                                            <TableCell className="text-right font-black text-lg">{player.runs}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{player.avg}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{player.sr}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {player.hundreds}/{player.fifties}
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="text-right font-black text-lg">{player.wickets}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{player.avg}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{player.economy}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{player.bestFigures}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
