import { createContext, useEffect } from "react";
import useStorage from "../hooks/useStorage";

export const ThemeContext = createContext();
export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useStorage("theme", "light");
    // normalise once on mount
    useEffect(() => {
        if (theme !== "light" && theme !== "dark") setTheme("light");
    }, []);   // run only once
    // whenever theme changes → update Bootstrap + persist
    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme(t => t === "light" ? "dark" : "light");

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}