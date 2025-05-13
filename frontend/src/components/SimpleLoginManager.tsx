import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import { fetchWithCSRF, type APIError } from "../utils"

function SimpleLoginManager() {
	const navigate = useNavigate()
	const { user, setUser } = useAuth()

	const handleLogout = async () => {
		const response = await fetchWithCSRF("http://localhost:8000/database/api/logout/", {
			method: "POST",
			credentials: "include",
		})
		if (response.status === 204) {
			setUser(null)
			navigate("/")
			return
		}
		const responseData: APIError | { success: string } = await response.json()
		if ("error" in responseData) throw new Error(responseData.error)
	}

	const goToProfile = () => {
		navigate("/profile")
	}

	const goToStaff = () => {
		navigate("/staff/events")
	}

	return (
		<div className="d-flex justify-content-between align-items-center gap-2">
			{user ? (
				<>
					{user.is_staff && (
						<Button variant="info" size="sm" onClick={goToStaff}>
							Painel do Staff
						</Button>
					)}
					<Button variant="success" size="sm" onClick={goToProfile}>
						Logged in como: <strong>{user.username}</strong>
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
