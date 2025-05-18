import { useEffect, useState } from "react"
import { Button, Form, Spinner, Alert, Toast } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import { fetchWithCSRF, getErrorMessage, type APIError, type User } from "../utils"

function EditProfile() {
	const { user, setUser } = useAuth()
	const [loading, setLoading] = useState(true)
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		old_password: "",
		new_password: "",
		confirm_password: "",
	})
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	useEffect(() => {
		if (user) {
			setFormData(prev => ({
				...prev,
				username: user.username || "",
				email: user.email || "",
				first_name: user.first_name || "",
				last_name: user.last_name || "",
			}))
		}
		setLoading(false)
	}, [user])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setSuccess(null)

		const payload = {
			username: formData.username,
			email: formData.email,
			first_name: formData.first_name,
			last_name: formData.last_name,
			...(formData.new_password && {
				old_password: formData.old_password,
				password: formData.new_password,
			}),
		}

		try {
			const res = await fetchWithCSRF("http://localhost:8000/api/user/", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(payload),
				}),
				responseData: User | APIError = await res.json()
			if ("errors" in responseData) throw new Error(getErrorMessage(responseData))
			setSuccess("Perfil atualizado com sucesso.")
			setUser(responseData)
			navigate("/profile")
		} catch (err) {
			setError(err.message)
		}
	}

	if (loading) return <Spinner animation="border" />
	if (!user) return <Alert variant="danger">Não Autorizado</Alert>

	return (
		<Form onSubmit={handleSubmit}>
			<div
				style={{
					position: "fixed",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					zIndex: 1060,
					minWidth: "300px",
				}}
			>
				{error && (
					<Toast onClose={() => setError(null)} show={!!error} bg="danger" delay={5000} autohide>
						<Toast.Header closeButton>
							<strong className="me-auto">Erro</strong>
						</Toast.Header>
						<Toast.Body className="text-white">{error}</Toast.Body>
					</Toast>
				)}
				{success && (
					<Toast onClose={() => setSuccess(null)} show={!!success} bg="success" delay={5000} autohide>
						<Toast.Header closeButton>
							<strong className="me-auto">Sucesso</strong>
						</Toast.Header>
						<Toast.Body className="text-white">{success}</Toast.Body>
					</Toast>
				)}
			</div>
			<h2>Editar Perfil</h2>
			<Form.Group className="mb-3">
				<Form.Label>Username</Form.Label>
				<Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Email</Form.Label>
				<Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Primeiro Nome</Form.Label>
				<Form.Control
					type="text"
					name="first_name"
					value={formData.first_name}
					onChange={handleChange}
					required
				/>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Último Nome</Form.Label>
				<Form.Control
					type="text"
					name="last_name"
					value={formData.last_name}
					onChange={handleChange}
					required
				/>
			</Form.Group>
			<hr />
			<h4>Alterar Password</h4>
			<Form.Group className="mb-3">
				<Form.Label>Password Antiga</Form.Label>
				<Form.Control
					type="password"
					name="old_password"
					value={formData.old_password}
					onChange={handleChange}
					placeholder="Enter current password"
				/>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Password Nova</Form.Label>
				<Form.Control
					type="password"
					name="new_password"
					value={formData.new_password}
					onChange={handleChange}
					placeholder="Enter new password"
				/>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Confirmar Password Nova</Form.Label>
				<Form.Control
					type="password"
					name="confirm_password"
					value={formData.confirm_password}
					onChange={handleChange}
					placeholder="Repeat new password"
				/>
			</Form.Group>
			<Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
				Voltar
			</Button>
			<Button variant="primary" type="submit">
				Guardar Alterações
			</Button>
		</Form>
	)
}

export default EditProfile
