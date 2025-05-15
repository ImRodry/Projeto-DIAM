import { useState, type FormEvent, type ReactNode } from "react"
import { Modal, Button, Form, Alert } from "react-bootstrap"
import { fetchWithCSRF, getErrorMessage, type APIError, type LoginFormData, type User } from "../utils"
import { useAuth } from "../contexts/AuthContext"

interface Props {
	show: boolean
	onHide: () => void
	onShowSignup: () => void
}

function LoginModal({ show, onHide, onShowSignup }: Props): ReactNode {
	const { setUser } = useAuth()
	const [error, setError] = useState<string | null>(null)
	const initialFormData = {
		username: "",
		password: "",
	}
	const [formData, setFormData] = useState<LoginFormData>(initialFormData)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			const response = await fetchWithCSRF("http://localhost:8000/api/login/", {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				}),
				responseData: APIError | User = await response.json()
			if ("errors" in responseData) throw new Error(getErrorMessage(responseData))
			setUser(responseData)
			setFormData(initialFormData)
			onHide()
		} catch (err) {
			setError(err.message)
		}
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
							name="username"
							type="text"
							value={formData.username}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formLoginPassword" className="mt-3">
						<Form.Label>Password</Form.Label>
						<Form.Control
							name="password"
							type="password"
							value={formData.password}
							onChange={handleChange}
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
				{error && <Alert variant="danger">{error}</Alert>}
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => {
							onHide()
							setFormData(initialFormData)
							setError(null)
						}}
					>
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
