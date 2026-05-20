"use client"

import { useState } from "react"
import { X, Bell, Trophy, ShoppingBag, Calendar, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { notifications as initialNotifications } from "@/lib/notifications-data"

export function NotificationsPanel({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState(initialNotifications)

    if (!isOpen) return null

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const removeNotification = (id, e) => {
        e.stopPropagation() // Prevent marking as read when removing
        setNotifications(notifications.filter(n => n.id !== id))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const getIcon = (type) => {
        switch (type) {
            case "match": return <Calendar className="h-5 w-5 text-blue-500" />
            case "tournament": return <Trophy className="h-5 w-5 text-yellow-500" />
            case "store": return <ShoppingBag className="h-5 w-5 text-green-500" />
            default: return <Bell className="h-5 w-5 text-primary" />
        }
    }

    const formatTime = (timestamp) => {
        const now = new Date()
        const diff = now - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-card border-l border-border z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Bell className="h-6 w-6 text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold">Notifications</h2>
                                <p className="text-sm text-muted-foreground">
                                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <Bell className="h-20 w-20 text-muted-foreground/30" />
                            <div>
                                <h3 className="text-xl font-bold text-muted-foreground">No notifications</h3>
                                <p className="text-sm text-muted-foreground">You're all caught up!</p>
                            </div>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`p-4 cursor-pointer transition-all hover:shadow-lg group relative ${!notification.read
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-card/50 border-secondary/20'
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex gap-3">
                                    <div className="shrink-0 mt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-sm line-clamp-1">
                                                {notification.title}
                                            </h3>
                                            <div className="flex items-center gap-1">
                                                {!notification.read && (
                                                    <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={(e) => removeNotification(notification.id, e)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {formatTime(notification.timestamp)}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {notification.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}
