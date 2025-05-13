import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "../utils"

type AuthContextType = {
	user: User | null
	setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)

	// Load user from localStorage on initial render (if available)
	useEffect(() => {
		const storedUser = localStorage.getItem("user")
		if (storedUser) {
			setUser(JSON.parse(storedUser))
		}
	}, [])

	// Update localStorage whenever the user state changes
	useEffect(() => {
		if (user) {
			localStorage.setItem("user", JSON.stringify(user))
		} else {
			localStorage.removeItem("user") // Remove user data when logged out
		}
	}, [user])

	return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
