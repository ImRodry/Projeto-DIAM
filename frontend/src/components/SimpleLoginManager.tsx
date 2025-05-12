import { useState, useEffect, type FC } from "react"
import { Button, Alert } from "react-bootstrap"
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

	return (
		<div className="d-flex justify-content-between align-items-center">
			{username ? (
				<>
					<Alert variant="success" className="mb-0">
						Logged in as: <strong>{username}</strong>
					</Alert>
					<Button variant="outline-danger" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</>
			) : (
				<Alert variant="warning" className="mb-0">
					Not logged in
				</Alert>
			)}
		</div>
	)
}

export default SimpleLoginManager
