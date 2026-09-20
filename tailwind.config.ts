import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem", /* 9px */
        md: ".375rem", /* 6px */
        sm: ".1875rem", /* 3px */
      },
      colors: {
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },

        /**
         * SAKRED HEALTH — daylight palette.
         *
         * Sakred Body is night / inner terrain. Sakred Health is daylight:
         * the external terrain, the atlas, the professional layer. Every new
         * surface on the site is built from these and nothing else, so the
         * whole site reads as one material rather than a pile of hex codes.
         *
         * Ordered light → dark within each family so `canvas → surface-alt →
         * stone` is a legible depth ladder rather than a set of nicknames.
         */
        sakred: {
          /** Page ground. Warm ivory — never white. */
          canvas: "#F1EEE7",
          /** Raised surface: cards, sheets, the nav after scroll. */
          surface: "#FFFDF9",
          /** Recessed / alternating band. Oat milk. */
          "surface-alt": "#F8F4EC",
          /** Parchment — resource + library surfaces. */
          parchment: "#EFE7D8",
          /** Hairlines, dividers, quiet borders. */
          stone: "#E0D5C5",
          /** Limestone — muted fills, skeletons, inactive chips. */
          limestone: "#D6CDBE",
          /** Café au lait — the grounded coverage plane. */
          latte: "#B9A88E",
          /** Deep café — market / food surfaces, inverted bands. */
          cafe: "#4A3D30",
          /** Espresso ink — all primary type. Never pure black. */
          espresso: "#1C1A17",
          /** Espresso at reading weight for long body copy. */
          ink: "#2C2924",

          /** Gold, three weights. Accent for decoration, surface for fills,
           *  deep for text on light — `gold` alone fails contrast as type. */
          gold: "#C5A059",
          "gold-surface": "#A8842F",
          "gold-deep": "#8A6C27",
          /** The light end of the existing gradient, kept for continuity. */
          "gold-light": "#EBD598",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      /** The one timing scale. Anything that moves picks a duration from here
       *  so the whole site feels like a single system (brief §26). */
      transitionDuration: {
        micro: "150ms",
        card: "420ms",
        hero: "900ms",
      },
      transitionTimingFunction: {
        settle: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        /** Ambient: a very slow wander for botanical/contour decoration. */
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(-10px,-14px,0)" },
        },
        /** Gold hairline drawing itself in (verification ladder, diagrams). */
        "draw-line": {
          from: { strokeDashoffset: "var(--dash, 100)" },
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        drift: "drift 18s ease-in-out infinite",
        "draw-line": "draw-line 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
