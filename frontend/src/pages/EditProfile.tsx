import { useEffect, useState } from "react"
import { Button, Form, Spinner, Alert } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"

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

		if (formData.new_password || formData.confirm_password) {
			if (!formData.old_password) {
				alert("Old password is required to change your password.")
				return
			}
			if (formData.new_password !== formData.confirm_password) {
				alert("New passwords do not match.")
				return
			}
		}

		const payload = {
			username: formData.username,
			email: formData.email,
			first_name: formData.first_name,
			last_name: formData.last_name,
			...(formData.new_password && {
				old_password: formData.old_password,
				new_password: formData.new_password,
			}),
		}

		const res = await fetch("http://localhost:8000/database/api/user/update/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(payload),
		})

		if (res.ok) {
			const updatedUser = await res.json()
			setUser(updatedUser)
			alert("User info updated!")
			navigate("/profile")
		} else {
			alert("Update failed. Please check your password or try again.")
		}
	}

	if (loading) return <Spinner animation="border" />
	if (!user) return <Alert variant="danger">Not authorized</Alert>

	return (
		<Form onSubmit={handleSubmit}>
			<h2>Edit Profile</h2>
			<Form.Group className="mb-3">
				<Form.Label>Username</Form.Label>
				<Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Email</Form.Label>
				<Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>First Name</Form.Label>
				<Form.Control
					type="text"
					name="first_name"
					value={formData.first_name}
					onChange={handleChange}
					required
				/>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Last Name</Form.Label>
				<Form.Control
					type="text"
					name="last_name"
					value={formData.last_name}
					onChange={handleChange}
					required
				/>
			</Form.Group>
			<hr />
			<h4>Change Password</h4>
			<Form.Group className="mb-3">
				<Form.Label>Old Password</Form.Label>
				<Form.Control
					type="password"
					name="old_password"
					value={formData.old_password}
					onChange={handleChange}
					placeholder="Enter current password"
				/>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>New Password</Form.Label>
				<Form.Control
					type="password"
					name="new_password"
					value={formData.new_password}
					onChange={handleChange}
					placeholder="Enter new password"
				/>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label>Confirm New Password</Form.Label>
				<Form.Control
					type="password"
					name="confirm_password"
					value={formData.confirm_password}
					onChange={handleChange}
					placeholder="Repeat new password"
				/>
			</Form.Group>
			<Button variant="primary" type="submit">
				Save Changes
			</Button>
		</Form>
	)
}

export default EditProfile
