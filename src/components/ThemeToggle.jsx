import { useContext } from "react";
import { ThemeContext } from "./contexts/ThemeContext";

import dayButton from "../assets/day-mode.png";
import nightButton from "../assets/night-mode.png";

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
                src={theme === "light" ? nightButton : dayButton}
                alt="theme-toggle"
                width={28}
                height={28}
            />
        </button>
    );
}