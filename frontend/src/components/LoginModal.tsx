import { useState, type FormEvent, type ReactNode } from "react"
import { Modal, Button, Form } from "react-bootstrap"
import { fetchWithCSRF, type APIError, type User } from "../utils"
import { useAuth } from "../contexts/AuthContext"

interface Props {
	show: boolean
	onHide: () => void
	onShowSignup: () => void
}

function LoginModal({ show, onHide, onShowSignup }: Props): ReactNode {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const { setUser } = useAuth()

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const response = await fetchWithCSRF("http://localhost:8000/api/login/", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			}),
			responseData: APIError | User = await response.json()
		if ("errors" in responseData)
			throw new Error(
				Object.entries(responseData.errors)
					.map(([key, value]) => `${key}: ${value.join(", ")}`)
					.join("\n")
			)

		setUser(responseData)
		onHide()
	}

	return (
		<Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Login</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleSubmit}>
				<Modal.Body>
					<Form.Group controlId="formLoginUsername">
						<Form.Label>Username</Form.Label>
						<Form.Control
							type="text"
							value={username}
							onChange={e => setUsername(e.target.value)}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formLoginPassword" className="mt-3">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
						/>
					</Form.Group>
					<div className="mt-3">
						<span>Don't have an account? </span>
						<a href="#" onClick={onShowSignup} className="text-primary">
							Sign up
						</a>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={onHide}>
						Cancel
					</Button>
					<Button variant="primary" type="submit">
						Login
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	)
}

export default LoginModal
