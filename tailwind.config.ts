import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                red: {
                    50: "#FDEBEA",
                    600: "#E2231A",
                    700: "#B81B14",
                },
                blue: {
                    50: "#EBEEFC",
                    600: "#1531B8",
                    700: "#0C1F8F",
                },
                gold: {
                    50: "#FBF3E2",
                    600: "#B8892B",
                },
                ink: {
                    900: "#0B0E1A",
                    700: "#333749",
                    500: "#5B5F72",
                    300: "#9296A6",
                },
                paper: {
                    0: "#FFFFFF",
                    50: "#F6F7FB",
                    100: "#EEF0F7",
                },
                line: {
                    200: "#E2E5EE",
                    300: "#CDD1E0",
                },
            },
            fontFamily: {
                display: ["var(--font-serif)", "Georgia", "serif"],
                body: ["var(--font-sans)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            maxWidth: {
                container: "1240px",
            },
            boxShadow: {
                sm2: "0 1px 2px rgba(11,14,26,.06), 0 1px 1px rgba(11,14,26,.04)",
                md2: "0 8px 24px -8px rgba(11,14,26,.18)",
                lg2: "0 24px 48px -16px rgba(11,14,26,.28)",
            },
            keyframes: {
                ticker: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-50%)" },
                },
                skeleton: {
                    "0%": { backgroundPosition: "100% 50%" },
                    "100%": { backgroundPosition: "0 50%" },
                },
            },
            animation: {
                ticker: "ticker 32s linear infinite",
                skeleton: "skeleton 1.4s ease infinite",
            },
        },
    },
    plugins: [],
};

export default config;