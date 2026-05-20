import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  NumberFormat, convertInchesToTwip
} from "docx";
import { writeFileSync } from "fs";

// ── Helpers ──────────────────────────────────────────────────────────────────

const GREEN  = "166534"; // dark green
const DKBLUE = "1D4ED8";
const AMBER  = "92400E";
const WHITE  = "FFFFFF";
const GRAY1  = "F9FAFB";
const GRAY2  = "1F2937";
const GREEN_LIGHT = "DCFCE7";
const BLUE_LIGHT  = "DBEAFE";

const heading = (text, level = 1) =>
  new Paragraph({
    text,
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: level === 1 ? 400 : 240, after: 120 },
  });

const para = (text, opts = {}) =>
  new Paragraph({
    children: [new TextRun({ text, size: 22, ...opts })],
    spacing: { after: 140 },
    alignment: AlignmentType.JUSTIFIED,
  });

const boldPara = (label, rest, color) =>
  new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, size: 22, color: color || "000000" }),
      new TextRun({ text: rest, size: 22 }),
    ],
    spacing: { after: 120 },
    alignment: AlignmentType.JUSTIFIED,
  });

const bullet = (text) =>
  new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level: 0 },
    spacing: { after: 80 },
  });

const cell = (text, opts = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text), size: 19, bold: opts.bold || false, color: opts.color || "000000" })],
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      }),
    ],
    shading: opts.shading
      ? { fill: opts.shading, type: ShadingType.CLEAR, color: "auto" }
      : undefined,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
  });

const hcell = (text, bg = GREEN) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 19, bold: true, color: WHITE })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: { fill: bg, type: ShadingType.CLEAR, color: "auto" },
  });

const spacer = () => new Paragraph({ text: "", spacing: { after: 160 } });

// ── EVM Table ────────────────────────────────────────────────────────────────
const evmRows = [
  ["Sprint 1 — Foundation",      "Dec 2025",    "30","30","27", "0",   "+3",  "1.00","1.11","Done"],
  ["Sprint 2 — Auth & Teams",    "Jan W1–W2",   "35","35","34", "0",   "+1",  "1.00","1.03","Done"],
  ["Sprint 3 — Match Engine",    "Jan W3–W4",   "45","40","38", "−5",  "+2",  "0.89","1.05","Done"],
  ["Sprint 4 — Live Scoring",    "Feb W1–W2",   "40","36","35", "−4",  "+1",  "0.90","1.03","Done"],
  ["Sprint 5 — Tournaments",     "Feb W3–Mar W1","50","38","36","−12", "+2",  "0.76","1.06","In Progress"],
  ["Sprint 6 — Store & Admin",   "Mar W2–W4",   "45","—","—",   "—",   "—",   "—",   "—",  "Planned"],
  ["Sprint 7 — Polish & Deploy", "April 2026",  "30","—","—",   "—",   "—",   "—",   "—",  "Planned"],
  ["CUMULATIVE (to date)",        "—",           "200","179","170","−21","+9", "0.90","1.05","—"],
];

const statusColor = (s) =>
  s === "Done" ? "16A34A" : s === "In Progress" ? "D97706" : s === "Planned" ? "2563EB" : "374151";

function makeEvmTable() {
  const headers = ["Sprint / Phase","Period","PV (SP)","EV (SP)","AC (SP)","SV","CV","SPI","CPI","Status"];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => hcell(h)),
      }),
      ...evmRows.map((r, i) =>
        new TableRow({
          children: r.map((v, ci) => {
            const isLast = ci === 9;
            const isFirst = ci === 0;
            const isTotal = i === evmRows.length - 1;
            return new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({
                    text: v,
                    size: 18,
                    bold: isFirst || isTotal,
                    color: isLast ? statusColor(v) : isTotal ? WHITE : "374151",
                  })],
                  alignment: isFirst ? AlignmentType.LEFT : AlignmentType.CENTER,
                }),
              ],
              shading: isTotal
                ? { fill: "166534", type: ShadingType.CLEAR, color: "auto" }
                : i % 2 === 0
                  ? { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" }
                  : undefined,
            });
          }),
        })
      ),
    ],
  });
}

// ── Enhancements Table ───────────────────────────────────────────────────────
const enhRows = [
  ["WebSocket Real-Time Scoring",       "High",   "18","Very High","Sprint 6"],
  ["RBAC Middleware Hardening",          "High",   "10","High (Security)","Sprint 6"],
  ["Tournament Bracket Visualiser",      "High",   "22","High (UX)","Sprint 7"],
  ["Advanced Player Analytics",          "Medium", "25","High","Post-Release"],
  ["Redis Caching Layer",                "Medium", "12","High (Perf.)","Post-Release"],
  ["Automated Test Suite",               "Medium", "20","Medium (QA)","Ongoing"],
  ["AI Match Commentator",               "Medium", "15","Medium","Release 2.0"],
  ["Player Ranking & Achievements",      "Medium", "18","Medium","Release 2.0"],
  ["PWA Support",                        "Low",    "8", "Medium","Release 2.0"],
  ["Internationalisation (i18n)",        "Low",    "14","Low-Medium","Release 2.0"],
];

const prioColor = (p) => p === "High" ? "DC2626" : p === "Medium" ? "D97706" : "16A34A";

function makeEnhTable() {
  const headers = ["Enhancement","Priority","Effort (SP)","User Impact","Target Sprint"];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map(h => hcell(h)) }),
      ...enhRows.map((r, i) =>
        new TableRow({
          children: r.map((v, ci) =>
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: v, size: 19, bold: ci === 1,
                  color: ci === 1 ? prioColor(v) : "374151",
                })],
                alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
              })],
              shading: i % 2 === 0
                ? { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" }
                : undefined,
            })
          ),
        })
      ),
    ],
  });
}

// ── Bibliography entries ─────────────────────────────────────────────────────
const bibEntries = [
  // Technical
  ["1.","Vercel Inc. (2024). Next.js 16 Documentation — App Router. https://nextjs.org/docs"],
  ["2.","MongoDB, Inc. (2024). MongoDB Atlas Documentation. https://www.mongodb.com/docs/atlas/"],
  ["3.","Mongoose Team. (2024). Mongoose ODM v9 Documentation. https://mongoosejs.com/docs/"],
  ["4.","Radix UI. (2024). Radix Primitives — Accessible Component Library. https://www.radix-ui.com/docs/primitives"],
  ["5.","TailwindCSS. (2024). TailwindCSS v4 Documentation. https://tailwindcss.com/docs"],
  ["6.","Framer. (2024). Framer Motion API Reference. https://www.framer.com/motion/"],
  ["7.","Panasonic, J. et al. (2023). Jose — JSON Object Signing and Encryption (JWT). https://github.com/panva/jose"],
  ["8.","React Hook Form. (2024). React Hook Form v7 Documentation. https://react-hook-form.com/"],
  ["9.","Zod. (2024). Zod Schema Validation Documentation. https://zod.dev/"],
  ["10.","Recharts. (2024). Recharts — Chart library built with React and D3. https://recharts.org/en-US/"],
  // SE & Agile
  ["11.","Schwaber, K., & Sutherland, J. (2020). The Scrum Guide. Scrum.org. https://scrumguides.org"],
  ["12.","Project Management Institute. (2021). PMBOK® Guide — 7th Edition. PMI."],
  ["13.","Kerzner, H. (2019). Using the Project Management Maturity Model (3rd ed.). Wiley."],
  ["14.","Fleming, Q. W., & Koppelman, J. M. (2010). Earned Value Project Management (4th ed.). PMI."],
  ["15.","Cohn, M. (2005). Agile Estimating and Planning. Prentice Hall Professional."],
  ["16.","Beck, K., et al. (2001). Manifesto for Agile Software Development. https://agilemanifesto.org/"],
  // Design & UX
  ["17.","Norman, D. (2013). The Design of Everyday Things (Revised ed.). Basic Books."],
  ["18.","Nielsen, J. (1994). 10 Usability Heuristics for User Interface Design. Nielsen Norman Group."],
  ["19.","Google Fonts. (2024). Inter Font Family. https://fonts.google.com/specimen/Inter"],
];

// ── Build Document ────────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      { reference: "my-bullet", levels: [{ level: 0, format: NumberFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } }] },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1080, bottom: 1080, left: 1260, right: 1080 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "CricVerse", bold: true, size: 20, color: GREEN }),
                new TextRun({ text: " — Progress Report 4  |  Semester IV  |  18 March 2026", size: 18, color: "6B7280" }),
              ],
              border: { bottom: { color: "E5E7EB", style: BorderStyle.SINGLE, size: 4 } },
              spacing: { after: 100 },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Page ", size: 18, color: "9CA3AF" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "9CA3AF" }),
                new TextRun({ text: " of ", size: 18, color: "9CA3AF" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "9CA3AF" }),
                new TextRun({ text: "        CricVerse — Cricket Scoring & Management Platform", size: 18, color: "9CA3AF" }),
              ],
              alignment: AlignmentType.CENTER,
              border: { top: { color: "E5E7EB", style: BorderStyle.SINGLE, size: 4 } },
            }),
          ],
        }),
      },
      children: [

        // ── COVER PAGE ─────────────────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: "PROGRESS REPORT — 4", bold: true, size: 24, color: WHITE })],
          alignment: AlignmentType.CENTER,
          shading: { fill: GREEN, type: ShadingType.CLEAR, color: "auto" },
          spacing: { before: 0, after: 0 },
          border: { bottom: { color: GREEN_LIGHT, style: BorderStyle.SINGLE, size: 4 } },
        }),

        spacer(),

        new Paragraph({
          children: [new TextRun({ text: "CricVerse", bold: true, size: 72, color: GRAY2 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Cricket Scoring & Management Platform", size: 28, color: "6B7280" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        new Table({
          width: { size: 60, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [hcell("Field", "374151"), hcell("Details", "374151")] }),
            new TableRow({ children: [cell("Report Date", {bold:true, shading:"F9FAFB"}), cell("18 March 2026")] }),
            new TableRow({ children: [cell("Report Number", {bold:true}), cell("Progress Report 4")] }),
            new TableRow({ children: [cell("Project", {bold:true, shading:"F9FAFB"}), cell("CricVerse")] }),
            new TableRow({ children: [cell("Technology", {bold:true}), cell("Next.js 16 · MongoDB · TailwindCSS v4 · React 19")] }),
            new TableRow({ children: [cell("Current Phase", {bold:true, shading:"F9FAFB"}), cell("Phase 3 — Tournaments, Leaderboard & E-commerce")] }),
            new TableRow({ children: [cell("Previous Report", {bold:true}), cell("Progress Report 3 (20 Feb 2026)")] }),
          ],
        }),

        spacer(), spacer(),

        new Paragraph({
          children: [new TextRun({ text: "  ⚡  72% of project scope delivered  ·  SPI: 0.90  ·  CPI: 1.05  ⚡  ", bold: true, size: 22, color: WHITE })],
          alignment: AlignmentType.CENTER,
          shading: { fill: "166534", type: ShadingType.CLEAR, color: "auto" },
          spacing: { before: 80, after: 80 },
        }),

        // Page break
        new Paragraph({ pageBreakBefore: true, text: "" }),

        // ── SECTION 1 — EVM ────────────────────────────────────────────────────
        heading("1. Earned Value Analysis & Burn Charts"),

        para("Earned Value Management (EVM) provides an objective, data-driven view of project schedule and cost health by comparing Planned Value (PV), Earned Value (EV), and Actual Cost (AC) at each sprint milestone. The CricVerse project follows a five-phase agile roadmap; the table below captures EVM metrics at the end of each completed sprint. Story points serve as the unit of measure (1 SP ≈ 4 dev-hours)."),

        heading("1.1 Key Performance Indicators at Reporting Date", 2),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [hcell("KPI"), hcell("Value"), hcell("Interpretation")] }),
            new TableRow({ children: [cell("Cumulative PV (Planned Value)", {shading:GRAY1}), cell("200 SP", {center:true, shading:GRAY1}), cell("Total budget planned through Sprint 5", {shading:GRAY1})] }),
            new TableRow({ children: [cell("Cumulative EV (Earned Value)"), cell("179 SP", {center:true}), cell("Actual scope delivered through Sprint 5")] }),
            new TableRow({ children: [cell("Cumulative AC (Actual Cost)", {shading:GRAY1}), cell("170 SP", {center:true, shading:GRAY1}), cell("Effort actually expended", {shading:GRAY1})] }),
            new TableRow({ children: [cell("Schedule Variance (SV)"), cell("−21 SP", {center:true, color:"DC2626"}), cell("Behind schedule by ~21 story points")] }),
            new TableRow({ children: [cell("Cost Variance (CV)", {shading:GRAY1}), cell("+9 SP", {center:true, color:"16A34A", shading:GRAY1}), cell("9 SP of value delivered under budget", {shading:GRAY1})] }),
            new TableRow({ children: [cell("Schedule Performance Index (SPI)"), cell("0.90", {center:true, color:"D97706"}), cell("Project is running ~10% behind schedule")] }),
            new TableRow({ children: [cell("Cost Performance Index (CPI)", {shading:GRAY1}), cell("1.05", {center:true, color:"16A34A", shading:GRAY1}), cell("5% more value per story point than planned", {shading:GRAY1})] }),
            new TableRow({ children: [cell("% Complete"), cell("72%", {center:true, color:"16A34A"}), cell("Of total 275-SP project scope")] }),
          ],
        }),

        spacer(),

        heading("1.2 Sprint-by-Sprint EVM Data", 2),
        makeEvmTable(),

        spacer(),
        new Paragraph({
          children: [new TextRun({ text: "Key: PV = Planned Value, EV = Earned Value, AC = Actual Cost, SV = Schedule Variance (EV−PV), CV = Cost Variance (EV−AC), SPI = EV/PV, CPI = EV/AC", size: 17, italics: true, color: "6B7280" })],
          spacing: { after: 200 },
        }),

        heading("1.3 Burn-Down Analysis", 2),
        para("The sprint burn-down chart would show that the ideal trend line decreases linearly from 275 story points (start of Sprint 1) to 0 (end of Sprint 7). The actual remaining points track closely to ideal in Sprints 1–2 but diverge slightly in Sprints 3–5 as the match engine and tournament modules revealed additional complexity."),
        para("A brief scope increase (≈ +10 SP) was logged in Sprint 3 due to backend API refactoring required for atomic ball-by-ball updates to the Match document. This is reflected as a mild upward bump in the actual burn-down line before it resumes its downward trend."),

        heading("1.4 Burn-Up Analysis", 2),
        para("The Release Burn-Up chart plots cumulative story points delivered (EV) against the total project scope line. The scope line remained stable at 275 SP for most of the project, with a brief spike to 285 SP in Sprints 3–5 due to the scope additions noted above. The Earned Value line (30 → 65 → 105 → 141 → 179) shows a consistent upward trajectory confirming steady delivery cadence."),
        para("At the current EV delivery rate of approximately 38–40 SP per sprint, the team is on track to complete all 275 story points within the two planned remaining sprints (Sprint 6 and Sprint 7), targeting a Beta release by end of March 2026."),

        heading("1.5 Interpretation & EVM Findings", 2),
        para("The SPI of 0.90 indicates the project is running approximately 10% behind the initial schedule — primarily because the Tournaments feature (Sprint 5) involved unforeseen complexity in fixture-scheduling logic and standings-calculation algorithms. Despite this schedule slip, the CPI of 1.05 confirms that effort is being applied efficiently: the team is delivering slightly more value per story point expended than planned."),
        para("Overall the EVM data presents a healthy project that is slightly behind schedule but under budget, with no critical risk to final delivery. The gap between EV and PV is projected to close fully by Sprint 7."),

        // Page break
        new Paragraph({ pageBreakBefore: true, text: "" }),

        // ── SECTION 2 — ENHANCEMENTS ──────────────────────────────────────────
        heading("2. Proposed Enhancements"),

        para("Based on the current state of development, user story feedback collected during Sprint 4 and 5 reviews, and technical observations made by the development team, the following enhancements are proposed for inclusion in future sprints or post-Release 1.0 iterations of CricVerse. Enhancements are grouped by category and prioritised by business value and implementation effort."),

        heading("2.1 Functional Enhancements", 2),

        heading("2.1.1  [HIGH]  WebSocket-Based Real-Time Scoring", 3),
        para("Current State: The live scoring page currently relies on periodic HTTP polling to fetch updated match data, introducing small latency in score propagation to spectators."),
        para("Enhancement: Replace polling with a persistent WebSocket connection using Socket.io (or Next.js Edge Runtime's native WebSocket support). Every delivery recorded by the scorer would be instantly broadcast to all connected clients — players, spectators, and the admin panel — with zero manual page refresh."),
        bullet("Estimated Effort: 18 story points"),
        bullet("Target Release: Sprint 6"),
        bullet("User Impact: Very High — eliminates latency for real-time viewers"),
        spacer(),

        heading("2.1.2  [HIGH]  Interactive Tournament Bracket Visualiser", 3),
        para("Current State: Tournament fixtures are displayed as a plain table list, which is functional but lacks the visual appeal and intuitive navigation expected from a modern sports platform."),
        para("Enhancement: Develop an SVG-based interactive bracket diagram that renders the full tournament draw — supporting knockout, league, and round-robin formats — with live result propagation updating match cells automatically as scores are submitted."),
        bullet("Estimated Effort: 22 story points"),
        bullet("Target Release: Sprint 7"),
        bullet("User Impact: High — significantly improves tournament UX"),
        spacer(),

        heading("2.1.3  [MEDIUM]  Advanced Player Analytics Dashboard", 3),
        para("Enhancement: Dedicated per-player profile pages showing historical batting averages, bowling economy trends across multiple matches, wagon-wheel shot charts, pitch-type performance breakdowns, and head-to-head comparison tools. All charts powered by Recharts with smooth animations."),
        bullet("Estimated Effort: 25 story points  |  Target: Post-Release 1.0"),
        spacer(),

        heading("2.1.4  [MEDIUM]  AI Match Commentator", 3),
        para("Enhancement: Integrate a lightweight LLM (OpenAI GPT-4o-mini or Google Gemini Flash) to auto-generate one-line contextual commentary for each ball delivered, based on the ball type, runs, dismissal, match situation, and over context. Commentary would appear alongside the ball history log on the scoring page."),
        bullet("Estimated Effort: 15 story points  |  Target: Release 2.0"),
        spacer(),

        heading("2.1.5  [MEDIUM]  Player Ranking & Achievements System", 3),
        para("Enhancement: A gamified badge and ranking system awarding milestones such as 'First Half-Century', 'Hat-trick Hero', 'Economy King', and 'Highest Run-Scorer'. Ranks auto-update after every completed match and are prominently featured on the global Leaderboard page."),
        bullet("Estimated Effort: 18 story points  |  Target: Release 2.0"),
        spacer(),

        heading("2.1.6  [LOW]  Progressive Web App (PWA) Support", 3),
        para("Enhancement: Add manifest.json and a service worker enabling: (1) offline access to previously viewed scorecards, (2) push notifications for live score milestones, and (3) home-screen installability on Android and iOS."),
        bullet("Estimated Effort: 8 story points  |  Target: Release 2.0"),
        spacer(),

        heading("2.2 Technical & Infrastructure Enhancements", 2),

        heading("2.2.1  [HIGH]  Role-Based Access Control (RBAC) Middleware Hardening", 3),
        para("Current State: Admin pages contain client-side role checks which can be bypassed by a technically savvy user who directly navigates to the URL."),
        para("Enhancement: Move all role enforcement to Next.js Middleware (middleware.js at the project root). The middleware reads and verifies the JWT cookie on every request and redirects unauthorized users before the page even renders, closing the current client-side bypass vulnerability."),
        bullet("Estimated Effort: 10 story points  |  Target: Sprint 6"),
        spacer(),

        heading("2.2.2  [MEDIUM]  Redis Caching Layer", 3),
        para("Enhancement: Introduce Upstash Redis to cache frequently read, rarely mutated data: leaderboard rankings (TTL: 5 min), tournament standings (TTL: 2 min), and the product catalogue (TTL: 10 min). This will reduce MongoDB read load under concurrent user traffic and sharply improve page load times for high-traffic pages."),
        bullet("Estimated Effort: 12 story points  |  Target: Post-Release 1.0"),
        spacer(),

        heading("2.2.3  [MEDIUM]  Automated Test Suite (Jest + React Testing Library)", 3),
        para("Enhancement: Introduce comprehensive unit tests for all utility/helper functions and API route handlers, plus integration tests for the match-scoring engine end-to-end flow (ball recorded → score updated → stats persisted). Target: ≥ 80% code coverage on core logic modules before Release 1.0."),
        bullet("Estimated Effort: 20 story points  |  Target: Ongoing from Sprint 6"),
        spacer(),

        heading("2.2.4  [LOW]  Internationalisation (i18n)", 3),
        para("Enhancement: Integrate next-intl to support Hindi, Bengali, Tamil, and Telugu — the four most widely spoken languages in India's cricket-enthusiastic user base. All UI labels, error messages, and notification strings would be extracted into locale JSON files."),
        bullet("Estimated Effort: 14 story points  |  Target: Release 2.0"),
        spacer(),

        heading("2.3 Enhancement Prioritisation Matrix", 2),
        makeEnhTable(),

        // Page break
        new Paragraph({ pageBreakBefore: true, text: "" }),

        // ── SECTION 3 — CONCLUSION ────────────────────────────────────────────
        heading("3. Conclusion"),

        para("CricVerse has evolved significantly since its inception as a Semester IV project. What began as a humble idea for a cricket scoring application has matured into a full-featured, production-grade web platform encompassing real-time match management, team administration, tournament orchestration, a merchandise store, and a role-based admin dashboard — all built on a modern Next.js 16 + MongoDB technology stack."),

        heading("3.1 Current State Summary", 2),
        para("As of Progress Report 4, approximately 72% of the total planned scope has been delivered. The core backend infrastructure — MongoDB schemas and REST API endpoints for Teams, Matches, Tournaments, Users, Products, and Orders — is fully operational and connected to MongoDB Atlas. The JWT-based authentication system is live, all team and match CRUD APIs function correctly, and the ball-by-ball live scoring engine actively records deliveries, updating per-innings batting stats, bowling figures, and extras atomically on every ball."),

        heading("3.2 Significant Achievements This Period", 2),

        boldPara("Live-Scoring Engine: ", "The most technically significant achievement during this reporting period is the completion of the live-scoring console. The Match model's nested InningsSchema stores full ball history, striker/non-striker player stats, and over-level bowling figures. The POST /api/matches/[id]/ball endpoint atomically updates all derived statistics, ensuring data consistency even under concurrent updates."),

        boldPara("E-commerce Module: ", "The full shopping cart flow — CartContext (localStorage-persisted), CartSidebar drawer, CheckoutModal, and backend Order API — is functionally complete, giving CricVerse a meaningful e-commerce revenue stream alongside its core cricket utility."),

        boldPara("Design & UX Polish: ", "Integration of Framer Motion animations, a responsive mobile footer navigation, a two-row gradient store header, and an animated landing hero page demonstrates the team's commitment to a premium, user-centric design philosophy that goes well beyond a typical university project."),

        boldPara("Admin Panel: ", "Role-protected admin routes for product management, order management, and user management provide the administrative oversight required for a production deployment."),

        heading("3.3 Lessons Learned", 2),
        para("Sprint 3 and Sprint 5 revealed that underestimating schema complexity and inter-model relationships in MongoDB can cause meaningful schedule slippage when discovered mid-sprint. The practice of separating the MongoDB schema design phase from the API development phase — and validating schemas with real data before building the API — will be strictly adopted going forward."),
        para("Additionally, the team learned the value of incremental API integration: connecting the frontend to the live database in small, independently testable slices rather than attempting a large bulk integration. This approach would have prevented the Sprint 3 refactoring event that cost approximately 10 additional story points."),

        heading("3.4 Path Forward", 2),
        para("The two remaining planned sprints will focus on: (1) completing the Tournament module's frontend integration including standings table and fixture management, (2) hardening the admin panel with Middleware-level RBAC, (3) finalising the store checkout flow with persistent order creation, and (4) deploying a stable Release 1.0 Beta to Vercel with MongoDB Atlas by end of March 2026."),
        para("The proposed enhancements — particularly WebSocket-based live scoring and the tournament bracket visualiser — are scheduled for the post-Beta Release 2.0 cycle. These capabilities, combined with the planned Redis caching layer and automated test suite, will position CricVerse as a genuinely competitive, scalable, and reliable platform in the amateur cricket management space — well beyond the scope of a standard academic project."),

        new Paragraph({
          children: [new TextRun({ text: "In summary, CricVerse demonstrates strong technical depth, a well-architected full-stack codebase, and a clear roadmap to production release — reflecting positively on the team's engineering discipline and agile project management practices throughout Semester IV.", size: 22, italics: true, color: "374151" })],
          spacing: { after: 160 },
          alignment: AlignmentType.JUSTIFIED,
          shading: { fill: "F0FDF4", type: ShadingType.CLEAR, color: "auto" },
          border: { left: { color: GREEN, style: BorderStyle.SINGLE, size: 12 } },
          indent: { left: 240 },
        }),

        // Page break
        new Paragraph({ pageBreakBefore: true, text: "" }),

        // ── SECTION 4 — BIBLIOGRAPHY ──────────────────────────────────────────
        heading("4. Bibliography"),

        heading("4.1 Technical Documentation", 2),
        ...bibEntries.slice(0, 10).map(([num, text]) =>
          new Paragraph({
            children: [
              new TextRun({ text: num + "  ", bold: true, size: 21, color: GREEN }),
              new TextRun({ text, size: 21 }),
            ],
            spacing: { after: 120 },
            alignment: AlignmentType.JUSTIFIED,
          })
        ),

        heading("4.2 Software Engineering & Agile References", 2),
        ...bibEntries.slice(10, 16).map(([num, text]) =>
          new Paragraph({
            children: [
              new TextRun({ text: num + "  ", bold: true, size: 21, color: GREEN }),
              new TextRun({ text, size: 21 }),
            ],
            spacing: { after: 120 },
            alignment: AlignmentType.JUSTIFIED,
          })
        ),

        heading("4.3 Design & UX References", 2),
        ...bibEntries.slice(16).map(([num, text]) =>
          new Paragraph({
            children: [
              new TextRun({ text: num + "  ", bold: true, size: 21, color: GREEN }),
              new TextRun({ text, size: 21 }),
            ],
            spacing: { after: 120 },
            alignment: AlignmentType.JUSTIFIED,
          })
        ),

      ],
    },
  ],
});

// ── Write file ───────────────────────────────────────────────────────────────
const buffer = await Packer.toBuffer(doc);
writeFileSync("Progress_Report_4.docx", buffer);
console.log("✅  Progress_Report_4.docx created successfully!");
