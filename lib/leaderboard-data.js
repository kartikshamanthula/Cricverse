// Player Leaderboard Data
export const playerLeaderboard = {
    leatherBall: {
        batting: [
            { rank: 1, name: "Virat Kohli", team: "Royal Strikers", runs: 856, matches: 12, avg: 71.3, sr: 145.5, hundreds: 3, fifties: 4 },
            { rank: 2, name: "Rohit Sharma", team: "Thunder XI", runs: 798, matches: 12, avg: 66.5, sr: 152.1, hundreds: 2, fifties: 5 },
            { rank: 3, name: "Faf du Plessis", team: "Super Kings", runs: 775, matches: 11, avg: 70.4, sr: 138.8, hundreds: 2, fifties: 6 },
            { rank: 4, name: "Shubman Gill", team: "Titans", runs: 720, matches: 12, avg: 60.0, sr: 135.2, hundreds: 1, fifties: 6 },
            { rank: 5, name: "Sanju Samson", team: "Royals", runs: 680, matches: 11, avg: 61.8, sr: 160.2, hundreds: 2, fifties: 4 },
        ],
        bowling: [
            { rank: 1, name: "Jasprit Bumrah", team: "Thunder XI", wickets: 28, matches: 12, avg: 18.5, economy: 6.2, bestFigures: "5/18" },
            { rank: 2, name: "Rashid Khan", team: "Titans", wickets: 26, matches: 12, avg: 19.8, economy: 6.8, bestFigures: "4/22" },
            { rank: 3, name: "Yuzvendra Chahal", team: "Royals", wickets: 24, matches: 11, avg: 21.2, economy: 7.1, bestFigures: "4/25" },
            { rank: 4, name: "Mohammed Shami", team: "Titans", wickets: 23, matches: 12, avg: 22.1, economy: 7.5, bestFigures: "4/30" },
            { rank: 5, name: "Trent Boult", team: "Royals", wickets: 22, matches: 11, avg: 23.5, economy: 7.8, bestFigures: "3/20" },
        ]
    },
    tennisBall: {
        batting: [
            { rank: 1, name: "Rahul Sharma", team: "Street Kings", runs: 645, matches: 10, avg: 64.5, sr: 175.3, hundreds: 4, fifties: 2 },
            { rank: 2, name: "Amit Patel", team: "Gully Warriors", runs: 598, matches: 10, avg: 59.8, sr: 168.2, hundreds: 3, fifties: 3 },
            { rank: 3, name: "Suresh Kumar", team: "Local Heroes", runs: 567, matches: 9, avg: 63.0, sr: 182.5, hundreds: 2, fifties: 4 },
            { rank: 4, name: "Vijay Singh", team: "Colony Strikers", runs: 534, matches: 10, avg: 53.4, sr: 165.8, hundreds: 2, fifties: 3 },
            { rank: 5, name: "Ravi Verma", team: "Street Kings", runs: 512, matches: 9, avg: 56.8, sr: 171.2, hundreds: 1, fifties: 5 },
        ],
        bowling: [
            { rank: 1, name: "Prakash Yadav", team: "Gully Warriors", wickets: 22, matches: 10, avg: 15.2, economy: 5.8, bestFigures: "4/12" },
            { rank: 2, name: "Deepak Chauhan", team: "Local Heroes", wickets: 20, matches: 9, avg: 16.8, economy: 6.1, bestFigures: "5/15" },
            { rank: 3, name: "Manoj Kumar", team: "Street Kings", wickets: 19, matches: 10, avg: 17.5, economy: 6.4, bestFigures: "4/18" },
            { rank: 4, name: "Sandeep Joshi", team: "Colony Strikers", wickets: 18, matches: 10, avg: 18.2, economy: 6.7, bestFigures: "3/10" },
            { rank: 5, name: "Arun Mehta", team: "Gully Warriors", wickets: 17, matches: 9, avg: 19.1, economy: 7.0, bestFigures: "4/20" },
        ]
    },
    boxCricket: {
        batting: [
            { rank: 1, name: "Karan Malhotra", team: "Box Blasters", runs: 423, matches: 8, avg: 52.8, sr: 195.4, hundreds: 2, fifties: 3 },
            { rank: 2, name: "Arjun Reddy", team: "Indoor Kings", runs: 398, matches: 8, avg: 49.7, sr: 188.6, hundreds: 1, fifties: 4 },
            { rank: 3, name: "Nikhil Gupta", team: "Arena Warriors", runs: 376, matches: 7, avg: 53.7, sr: 201.2, hundreds: 2, fifties: 2 },
            { rank: 4, name: "Rohan Desai", team: "Box Blasters", runs: 354, matches: 8, avg: 44.2, sr: 183.5, hundreds: 1, fifties: 3 },
            { rank: 5, name: "Akash Tiwari", team: "Indoor Kings", runs: 332, matches: 7, avg: 47.4, sr: 192.8, hundreds: 1, fifties: 2 },
        ],
        bowling: [
            { rank: 1, name: "Vishal Pandey", team: "Arena Warriors", wickets: 18, matches: 7, avg: 12.5, economy: 5.2, bestFigures: "4/8" },
            { rank: 2, name: "Gaurav Saxena", team: "Box Blasters", wickets: 16, matches: 8, avg: 13.8, economy: 5.6, bestFigures: "3/6" },
            { rank: 3, name: "Harsh Agarwal", team: "Indoor Kings", wickets: 15, matches: 8, avg: 14.2, economy: 5.9, bestFigures: "4/10" },
            { rank: 4, name: "Siddharth Roy", team: "Arena Warriors", wickets: 14, matches: 7, avg: 15.1, economy: 6.2, bestFigures: "3/9" },
            { rank: 5, name: "Rajat Kapoor", team: "Box Blasters", wickets: 13, matches: 8, avg: 16.3, economy: 6.5, bestFigures: "3/12" },
        ]
    }
}

// Team Leaderboard Data
export const teamLeaderboard = {
    leatherBall: [
        { rank: 1, name: "Royal Strikers", matches: 12, won: 10, lost: 2, points: 20, nrr: "+1.45" },
        { rank: 2, name: "Thunder XI", matches: 12, won: 9, lost: 3, points: 18, nrr: "+1.12" },
        { rank: 3, name: "Super Kings", matches: 11, won: 8, lost: 3, points: 16, nrr: "+0.98" },
        { rank: 4, name: "Titans", matches: 12, won: 7, lost: 5, points: 14, nrr: "+0.65" },
        { rank: 5, name: "Royals", matches: 11, won: 6, lost: 5, points: 12, nrr: "+0.42" },
        { rank: 6, name: "Warriors", matches: 12, won: 4, lost: 8, points: 8, nrr: "-0.58" },
        { rank: 7, name: "Knights", matches: 11, won: 3, lost: 8, points: 6, nrr: "-0.89" },
        { rank: 8, name: "Challengers", matches: 12, won: 1, lost: 11, points: 2, nrr: "-1.35" },
    ],
    tennisBall: [
        { rank: 1, name: "Street Kings", matches: 10, won: 9, lost: 1, points: 18, nrr: "+2.15" },
        { rank: 2, name: "Gully Warriors", matches: 10, won: 8, lost: 2, points: 16, nrr: "+1.78" },
        { rank: 3, name: "Local Heroes", matches: 9, won: 7, lost: 2, points: 14, nrr: "+1.42" },
        { rank: 4, name: "Colony Strikers", matches: 10, won: 5, lost: 5, points: 10, nrr: "+0.25" },
        { rank: 5, name: "Mohalla XI", matches: 9, won: 4, lost: 5, points: 8, nrr: "-0.38" },
        { rank: 6, name: "Area Champions", matches: 10, won: 3, lost: 7, points: 6, nrr: "-1.12" },
        { rank: 7, name: "Street Fighters", matches: 9, won: 2, lost: 7, points: 4, nrr: "-1.65" },
        { rank: 8, name: "Gully Boys", matches: 10, won: 0, lost: 10, points: 0, nrr: "-2.45" },
    ]
}
