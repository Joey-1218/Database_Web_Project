import { useContext } from "react";
import { ThemeContext } from "./contexts/ThemeContext";

import icon from "../assets/icon.png";

export default function ThemeToggle({ className = "" }) {
const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            className={`btn p-0 border-0 bg-transparent ${className}`}
            aria-label="Toggle dark mode"
            style={{ lineHeight: 0 }}
        >
            <img
                src={icon}
                alt="theme-toggle"
                width={32}
                height={32}
            />
        </button>
    );
}