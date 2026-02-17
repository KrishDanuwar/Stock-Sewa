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
                    primary: "#84D400",
                    secondary: "#22C55E",
                    background: "#0B1F27",
                    dark: "#0F2A35",
                    card: "#132F3B",
                    teal: "#123A47",
                    border: "#1F4A57",
                },
                surface: {
                    primary: "#E6EDF3",
                    secondary: "#9FB3BD",
                    muted: "#6B8A96",
                },
                status: {
                    success: "#22C55E",
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
