import { useState, type FormEvent } from "react"
import { Modal, Button, Form, Alert } from "react-bootstrap"
import { fetchWithCSRF, getErrorMessage, type APIError, type SignupFormData, type User } from "../utils"
import { useAuth } from "../contexts/AuthContext"

interface Props {
	show: boolean
	onHide: () => void
}

function SignupModal({ show, onHide }: Props) {
	const { setUser } = useAuth()
	const [error, setError] = useState<string | null>(null)
	const initialFormData: SignupFormData = {
		username: "",
		password: "",
		confirm_password: "",
		email: "",
		firstName: "",
		lastName: "",
	}
	const [formData, setFormData] = useState<SignupFormData>(initialFormData)

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError(null)

		if (formData.password !== formData.confirm_password) {
			setError("Passwords do not match.")
			return
		}

		try {
			const response = await fetchWithCSRF("http://localhost:8000/api/signup/", {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						username: formData.username,
						password: formData.password,
						email: formData.email,
						first_name: formData.firstName,
						last_name: formData.lastName,
					}),
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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	return (
		<Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Signup</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleSubmit}>
				<Modal.Body>
					<Form.Group controlId="formSignupUsername">
						<Form.Label>Username</Form.Label>
						<Form.Control
							name="username"
							type="text"
							value={formData.username}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formSignupPassword" className="mt-3">
						<Form.Label>Password</Form.Label>
						<Form.Control
							name="password"
							type="password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formSignupConfirmPassword" className="mt-3">
						<Form.Label>Confirm Password</Form.Label>
						<Form.Control
							name="confirm_password"
							type="password"
							value={formData.confirm_password}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formSignupEmail" className="mt-3">
						<Form.Label>Email</Form.Label>
						<Form.Control
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formSignupFirstName" className="mt-3">
						<Form.Label>First Name</Form.Label>
						<Form.Control
							name="firstName"
							type="text"
							value={formData.firstName}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formSignupLastName" className="mt-3">
						<Form.Label>Last Name</Form.Label>
						<Form.Control
							name="lastName"
							type="text"
							value={formData.lastName}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					{error && <Alert variant="danger">{error}</Alert>}
				</Modal.Body>
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
						Signup
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	)
}

export default SignupModal
