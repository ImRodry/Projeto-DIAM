import { useState, useEffect } from "react"
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"

function SimpleLoginManager() {
	const navigate = useNavigate()
	const [username, setUsername] = useState<string | null>(null)
	const [isAdmin, setIsAdmin] = useState(false)

	useEffect(() => {
		fetch("http://localhost:8000/votacao/api/user/", {
			method: "GET",
			credentials: "include",
		})
			.then(async res => {
				if (!res.ok) throw new Error()
				const data = await res.json()
				setUsername(data.username)
				setIsAdmin(data.is_superuser)
			})
			.catch(() => {
				console.log("User not logged in")
				setUsername(null)
				setIsAdmin(false)
			})
	}, [])

	const handleLogout = async () => {
		try {
			const response = await fetch("http://localhost:8000/votacao/api/logout/", {
				method: "GET",
				credentials: "include",
			})

			if (!response.ok) throw new Error()

			setUsername(null)
			setIsAdmin(false)
			navigate("/")
		} catch {
			alert("Logout failed")
		}
	}

	const goToProfile = () => {
		navigate("/profile")
	}

	const goToAdmin = () => {
		navigate("/admin/events")
	}

	return (
		<div className="d-flex justify-content-between align-items-center gap-2">
			{username ? (
				<>
					{isAdmin && (
						<Button variant="info" size="sm" onClick={goToAdmin}>
							Admin Panel
						</Button>
					)}
					<Button variant="success" size="sm" onClick={goToProfile}>
						Logged in as: <strong>{username}</strong>
					</Button>
					<Button variant="outline-danger" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</>
			) : (
				<Button variant="warning" size="sm" disabled>
					Not logged in
				</Button>
			)}
		</div>
	)
}

export default SimpleLoginManager
