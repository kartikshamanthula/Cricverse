export const notifications = [
    {
        id: "n1",
        type: "match",
        title: "Match Starting Soon",
        message: "Mumbai Indians vs Chennai Super Kings starts in 30 minutes",
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        icon: "🏏"
    },
    {
        id: "n2",
        type: "tournament",
        title: "Tournament Registration Open",
        message: "IPL 2024 registration is now open. Register your team today!",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        icon: "🏆"
    },
    {
        id: "n3",
        type: "store",
        title: "Flash Sale Alert!",
        message: "Get 30% off on all cricket bats. Limited time offer!",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false,
        icon: "🛍️"
    },
    {
        id: "n4",
        type: "match",
        title: "Match Result",
        message: "Your team won against Royal Challengers by 25 runs!",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        icon: "🏏"
    },
    {
        id: "n5",
        type: "tournament",
        title: "Tournament Update",
        message: "Quarter-finals schedule has been announced. Check your fixtures.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
        icon: "🏆"
    },
    {
        id: "n6",
        type: "store",
        title: "New Arrivals",
        message: "Check out the latest cricket gear collection in the store!",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true,
        icon: "🛍️"
    }
]
