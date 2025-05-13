import { useState, type FormEvent } from "react"
import { Modal, Button, Form } from "react-bootstrap"

interface Props {
	show: boolean
	onHide: () => void
}

function SignupModal({ show, onHide }: Props) {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		try {
			const response = await fetch("http://localhost:8000/votacao/api/signup/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			})

			if (!response.ok) throw new Error("Signup failed")

			alert("Signup successful!")
			onHide()
		} catch (error) {
			alert("Signup failed")
		}
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
