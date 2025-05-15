import { useEffect, useState } from "react"
import { Button, Card, Table, Spinner, Alert } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import { fetchWithCSRF, getErrorMessage, type APIError, type Ticket } from "../utils"

function Profile() {
	const [purchases, setPurchases] = useState<Ticket[]>([])
	const [loading, setLoading] = useState(true)
	const { user } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		fetchWithCSRF("http://localhost:8000/api/purchases/", {
			method: "GET",
			credentials: "include",
		})
			.then(async res => {
				const responseData: APIError | Ticket[] = await res.json()
				if ("errors" in responseData)
					throw new Error(getErrorMessage(responseData))
				setPurchases(responseData)
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
						<th>Evento</th>
						<th>Data</th>
						<th>Tipo de Bilhete</th>
						<th>Quantidade</th>
						<th>Preço</th>
					</tr>
				</thead>
				<tbody>
					{purchases.length > 0 ? (
						purchases.map((purchase: Ticket) => (
							<tr key={purchase.id}>
								<td>{purchase.ticket_type.event.name}</td>
								<td>
									{new Date(purchase.purchase_date).toLocaleString("pt", {
										dateStyle: "short",
										timeStyle: "short",
									})}
								</td>
								<td>{purchase.ticket_type.name}</td>
								<td>{purchase.quantity}</td>
								<td>{purchase.ticket_type.price} €</td>
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
