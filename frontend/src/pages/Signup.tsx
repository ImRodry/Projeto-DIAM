import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { Container, Form, Button, Row, Col, Card, Alert } from "react-bootstrap"

function Signup() {
	const [username, setUsername] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const navigate = useNavigate()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setErrorMsg(null)

		try {
			const response = await fetch("http://127.0.0.1:8000/votacao/api/signup/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || "Signup failed")
			}

			alert("Signup successful!")
			navigate("/")
		} catch (error: unknown) {
			if (error instanceof Error) {
				setErrorMsg(error.message)
			} else {
				setErrorMsg("An unexpected error occurred")
			}
		}
	}

	return (
		<Container className="d-flex justify-content-center align-items-center vh-100">
			<Row className="w-100 justify-content-center">
				<Col md={6} lg={4}>
					<Card className="p-4 shadow-sm">
						<Card.Body>
							<h2 className="mb-4 text-center">Signup</h2>
							{errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
							<Form onSubmit={handleSubmit}>
								<Form.Group controlId="formUsername" className="mb-3">
									<Form.Label>Username</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter username"
										value={username}
										onChange={e => setUsername(e.target.value)}
										required
									/>
								</Form.Group>

								<Form.Group controlId="formPassword" className="mb-3">
									<Form.Label>Password</Form.Label>
									<Form.Control
										type="password"
										placeholder="Enter password"
										value={password}
										onChange={e => setPassword(e.target.value)}
										required
									/>
								</Form.Group>

								<Button variant="success" type="submit" className="w-100">
									Signup
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	)
}

export default Signup
