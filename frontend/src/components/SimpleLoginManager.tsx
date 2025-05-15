import { Button } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import { fetchWithCSRF, getErrorMessage, type APIError } from "../utils"

function SimpleLoginManager() {
	const navigate = useNavigate()
	const { user, setUser } = useAuth()

	const handleLogout = async () => {
		const response = await fetchWithCSRF("http://localhost:8000/api/logout/", {
			method: "POST",
			credentials: "include",
		})
		if (!response.ok) {
			const responseData: APIError = await response.json()
			throw new Error(getErrorMessage(responseData))
		} else {
			setUser(null)
			navigate("/")
			return
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
			{user ? (
				<>
					{user.is_staff && (
						<Button variant="info" size="sm" onClick={goToStaff}>
							Staff
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
