import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: "#4dbff0",
                    secondary: "#22C55E",
                    background: "#F9FAFB",
                    dark: "#111827",
                    card: "#FFFFFF",
                    teal: "#F3F4F6",
                    border: "#E5E7EB",
                },
                surface: {
                    primary: "#111827",
                    secondary: "#4B5563",
                    muted: "#9CA3AF",
                },
                status: {
                    success: "#10B981",
                    warning: "#F59E0B",
                    danger: "#EF4444",
                    info: "#3B82F6",
                }
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                poppins: ["Poppins", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
