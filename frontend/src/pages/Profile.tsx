import { useEffect, useState } from "react"
import { Button, Card, Table, Spinner, Alert } from "react-bootstrap"
import { useNavigate } from "react-router"

function Profile() {
	const [user, setUser] = useState<any>(null)
	const [purchases, setPurchases] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
		// Fetch user data
		fetch("http://localhost:8000/votacao/api/user/", {
			method: "GET",
			credentials: "include",
		})
			.then(async res => {
				if (!res.ok) throw new Error()
				const data = await res.json()
				setUser(data)
			})
			.catch(() => {
				setUser(null)
			})

		// Fetch purchase history
		fetch("http://localhost:8000/votacao/api/user/purchases/", {
			method: "GET",
			credentials: "include",
		})
			.then(async res => {
				if (!res.ok) throw new Error()
				const data = await res.json()
				setPurchases(data)
			})
			.catch(() => {
				setPurchases([])
			})
			.finally(() => setLoading(false))
	}, [])

	if (loading) {
		return <Spinner animation="border" />
	}

	if (!user) {
		return <Alert variant="danger">You must be logged in to view this page.</Alert>
	}

	return (
		<div>
			<h2>Your Profile</h2>
			<Card className="mb-4">
				<Card.Body>
					<Card.Title>{user.username}</Card.Title>
					<Card.Text>Email: {user.email}</Card.Text>
					<Card.Text>Full Name: {user.full_name}</Card.Text>
					<Button variant="primary" onClick={() => navigate("/profile/edit")}>
						Edit Info
					</Button>
				</Card.Body>
			</Card>

			<h3>Purchase History & Invoices</h3>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>#</th>
						<th>Event</th>
						<th>Date</th>
						<th>Tickets</th>
						<th>Price</th>
					</tr>
				</thead>
				<tbody>
					{purchases.length > 0 ? (
						purchases.map((purchase: any) => (
							<tr key={purchase.id}>
								<td>{purchase.id}</td>
								<td>{purchase.event_name}</td>
								<td>{purchase.date}</td>
								<td>{purchase.ticket_amount}</td>
								<td>{purchase.price}</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={4}>No purchase history available</td>
						</tr>
					)}
				</tbody>
			</Table>
		</div>
	)
}

export default Profile
