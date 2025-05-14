import { useEffect, useState } from "react"
import { Button, Card, Table, Spinner, Alert } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext" // make sure the path is correct
import { fetchWithCSRF } from "../utils"

function Profile() {
	const [purchases, setPurchases] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const { user } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		// Fetch purchase history
		fetchWithCSRF("http://localhost:8000/database/api/user/purchases/", {
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
		return <Alert variant="danger">Não Autorizado</Alert>
	}

	return (
		<div>
			<h2>O Seu Perfil</h2>
			<Card className="mb-4">
				<Card.Body>
					<Card.Title>{user.username}</Card.Title>
					<Card.Text>Email: {user.email}</Card.Text>
					<Card.Text>Primeiro Nome: {user.first_name}</Card.Text>
					<Card.Text>Último Nome: {user.last_name}</Card.Text>
					<Card.Text>
						Membro Desde:{" "}
						{new Date(user.date_joined).toLocaleString("pt", { dateStyle: "short", timeStyle: "short" })}
					</Card.Text>
					<Button variant="primary" onClick={() => navigate("/profile/edit")}>
						Editar Informação
					</Button>
				</Card.Body>
			</Card>

			<h3>Histórico de Compras</h3>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>#</th>
						<th>Evento</th>
						<th>Data</th>
						<th>Bilhetes</th>
						<th>Preço</th>
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
							<td colSpan={5}>Sem histórico disponível</td>
						</tr>
					)}
				</tbody>
			</Table>
		</div>
	)
}

export default Profile
