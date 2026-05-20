"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Trophy, Target, Users } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [userData, setUserData] = useState({
        name: "John Doe",
        email: "john.doe@cricverse.com",
        phone: "+91 98765 43210",
        location: "Mumbai, India",
        joinDate: "January 2024",
        bio: "Passionate cricket enthusiast and tournament organizer. Love playing and managing cricket events.",
        role: "Tournament Organizer"
    })

    const [editData, setEditData] = useState(userData)

    const stats = [
        { label: "Tournaments Hosted", value: "12", icon: Trophy, color: "text-yellow-500" },
        { label: "Matches Organized", value: "48", icon: Target, color: "text-blue-500" },
        { label: "Teams Managed", value: "8", icon: Users, color: "text-green-500" }
    ]

    const handleSave = () => {
        setUserData(editData)
        setIsEditing(false)
        toast.success("Profile Updated", {
            description: "Your profile has been updated successfully."
        })
    }

    const handleCancel = () => {
        setEditData(userData)
        setIsEditing(false)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="My Profile"
                description="Manage your account settings and preferences"
                backHref="/"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-1 border-secondary/20 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-32 w-32 border-4 border-primary shadow-lg shadow-primary/20">
                                <AvatarImage src="/avatars/01.png" alt={userData.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                                    {userData.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-2xl">{userData.name}</CardTitle>
                        <CardDescription className="text-base">
                            <Badge variant="secondary" className="mt-2">
                                {userData.role}
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{userData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{userData.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{userData.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Joined {userData.joinDate}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details and Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.map((stat, index) => (
                            <Card key={index} className="border-secondary/20 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center ${stat.color}`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold">{stat.value}</p>
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Profile Details */}
                    <Card className="border-secondary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your personal details</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} size="sm">
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} size="sm">
                                            <Save className="h-4 w-4 mr-2" />
                                            Save
                                        </Button>
                                        <Button onClick={handleCancel} variant="outline" size="sm">
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={isEditing ? editData.name : userData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={isEditing ? editData.email : userData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={isEditing ? editData.phone : userData.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={isEditing ? editData.location : userData.location}
                                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <textarea
                                    id="bio"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={isEditing ? editData.bio : userData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
