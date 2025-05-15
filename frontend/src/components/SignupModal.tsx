import { useState, type FormEvent } from "react"
import { Modal, Button, Form } from "react-bootstrap"
import { fetchWithCSRF, getErrorMessage, type APIError, type User } from "../utils"
import { useAuth } from "../contexts/AuthContext"

interface Props {
	show: boolean
	onHide: () => void
}

function SignupModal({ show, onHide }: Props) {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [email, setEmail] = useState("")
	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
	const { setUser } = useAuth()

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const response = await fetchWithCSRF("http://localhost:8000/api/signup/", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username,
					password,
					email,
					first_name: firstName,
					last_name: lastName,
				}),
			}),
			responseData: APIError | User = await response.json()
		if ("errors" in responseData)
			throw new Error(getErrorMessage(responseData))
		setUser(responseData)
		onHide()
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
							type="text"
							value={username}
							onChange={e => setUsername(e.target.value)}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formSignupPassword" className="mt-3">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formSignupEmail" className="mt-3">
						<Form.Label>Email</Form.Label>
						<Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
					</Form.Group>
					<Form.Group controlId="formSignupFirstName" className="mt-3">
						<Form.Label>First Name</Form.Label>
						<Form.Control
							type="text"
							value={firstName}
							onChange={e => setFirstName(e.target.value)}
							required
						/>
					</Form.Group>
					<Form.Group controlId="formSignupLastName" className="mt-3">
						<Form.Label>Last Name</Form.Label>
						<Form.Control
							type="text"
							value={lastName}
							onChange={e => setLastName(e.target.value)}
							required
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={onHide}>
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
