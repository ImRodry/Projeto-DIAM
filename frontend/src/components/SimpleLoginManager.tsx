import { useState, useEffect, type FC } from "react"
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"

const SimpleLoginManager: FC = () => {
	const navigate = useNavigate()
	const [username, setUsername] = useState<string | null>(null)

	useEffect(() => {
		fetch("http://localhost:8000/votacao/api/user/", {
			method: "GET",
			credentials: "include",
		})
			.then(async res => {
				if (!res.ok) throw new Error()
				const data = await res.json()
				setUsername(data.username)
			})
			.catch(() => {
				console.log("User not logged in")
				setUsername(null)
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
			navigate("/")
		} catch {
			alert("Logout failed")
		}
	}

	const goToProfile = () => {
		navigate("/profile")
	}

	return (
		<div className="d-flex justify-content-between align-items-center gap-2">
			{username ? (
				<>
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
