import { useEffect, useState } from "react"
import { Button, Form, Spinner, Alert } from "react-bootstrap"
import { useNavigate } from "react-router"

function EditProfile() {
	const [user, setUser] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [formData, setFormData] = useState({ email: "", full_name: "" })
	const navigate = useNavigate()

	useEffect(() => {
		fetch("http://localhost:8000/votacao/api/user/", {
			method: "GET",
			credentials: "include",
		})
			.then(async res => {
				if (!res.ok) throw new Error()
				const data = await res.json()
				setUser(data)
				setFormData({ email: data.email, full_name: data.full_name })
			})
			.catch(() => {
				setUser(null)
			})
			.finally(() => setLoading(false))
	}, [])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const res = await fetch("http://localhost:8000/votacao/api/user/update/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(formData),
		})

		if (res.ok) {
			alert("User info updated!")
			navigate("/profile")
		} else {
			alert("Update failed")
		}
	}

	if (loading) return <Spinner animation="border" />
	if (!user) return <Alert variant="danger">Not authorized</Alert>

	return (
		<Form onSubmit={handleSubmit}>
			<h2>Edit Profile</h2>
			<Form.Group className="mb-3">
				<Form.Label>Email</Form.Label>
				<Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Full Name</Form.Label>
				<Form.Control type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
			</Form.Group>
			<Button variant="primary" type="submit">
				Save Changes
			</Button>
		</Form>
	)
}

export default EditProfile
