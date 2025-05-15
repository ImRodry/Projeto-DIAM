import { useState } from "react"
import { Alert, Button } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import { fetchWithCSRF, getErrorMessage, isStaff, type APIError } from "../utils"

function SimpleLoginManager() {
	const navigate = useNavigate()
	const { user, setUser } = useAuth()
	const [error, setError] = useState<string | null>(null)

	const handleLogout = async () => {
		try {
			const response = await fetchWithCSRF("http://localhost:8000/api/logout/", {
				method: "POST",
				credentials: "include",
			})
			if (!response.ok) {
				const responseData: APIError = await response.json()
				throw new Error(getErrorMessage(responseData))
			} else {
				setUser(null)
				setError(null)
				navigate("/")
				return
			}
		} catch (err) {
			setError(err.message)
		}
	}

	const goToProfile = () => {
		navigate("/profile")
	}

	const goToStaff = () => {
		navigate("/staff")
	}

	return (
		<div className="d-flex justify-content-between align-items-center gap-2">
			{error && <Alert variant="danger">{error}</Alert>}
			{user ? (
				<>
					{isStaff(user) && (
						<Button variant="info" size="sm" onClick={goToStaff}>
							Staff
						</Button>
					)}
					<Button variant="success" size="sm" onClick={goToProfile}>
						Logged in como:{" "}
						<strong>
							{user.first_name} {user.last_name}
						</strong>
					</Button>
					<Button variant="outline-danger" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</>
			) : (
				<Button variant="warning" size="sm" disabled>
					Não logged in
				</Button>
			)}
		</div>
	)
}

export default SimpleLoginManager
