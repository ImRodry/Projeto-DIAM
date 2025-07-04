import { useEffect, useState } from "react"
import { Table, Button, Modal, Spinner, ListGroup, Toast } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import EventForm from "../components/EventForm"
import { fetchWithCSRF, getErrorMessage, isStaff, type APIError, type EditableEvent, type Event } from "../utils"

function StaffEvents() {
	const navigate = useNavigate()
	const [events, setEvents] = useState<Event[]>([])
	const [showEditModal, setShowEditModal] = useState(false)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [selectedEvent, setSelectedEvent] = useState<EditableEvent | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const { user } = useAuth()

	const fetchEvents = async () => {
		const response = await fetchWithCSRF("http://localhost:8000/api/events/", {
				credentials: "include",
			}),
			responseData: APIError | Event[] = await response.json()
		if ("errors" in responseData) throw new Error(getErrorMessage(responseData))
		setEvents(responseData)
	}

	useEffect(() => {
		fetchEvents()
	}, [])

	// Don't render anything while checking Staff status
	if (!user) return <Spinner animation="border" />
	if (!isStaff(user)) navigate("/")

	const handleEdit = (event: Event) => {
		setSelectedEvent(event)
		setShowEditModal(true)
	}

	const handleDelete = async (eventId: number) => {
		setError(null)
		setSuccess(null)
		if (!confirm("Are you sure you want to delete this event?")) return
		try {
			const response = await fetchWithCSRF(`http://localhost:8000/api/events/${eventId}/`, {
				method: "DELETE",
				credentials: "include",
			})
			if (!response.ok) {
				const responseData: APIError = await response.json()
				throw new Error(getErrorMessage(responseData))
			}
			setSuccess("Evento apagado com sucesso.")
			fetchEvents()
		} catch (err) {
			setError(err.message)
		}
	}

	const uploadImage = async (imageFile: File): Promise<string> => {
		const formData = new FormData()
		formData.append("image", imageFile)

		const response = await fetchWithCSRF("http://localhost:8000/api/upload/", {
				method: "POST",
				body: formData,
				credentials: "include",
			}),
			responseData: APIError | { image_path: string } = await response.json()
		if ("errors" in responseData) throw new Error(getErrorMessage(responseData))

		return responseData.image_path
	}

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedEvent) return
		setSuccess(null)
		setError(null)
		try {
			if (selectedEvent.imageFile) {
				const imageUrl = await uploadImage(selectedEvent.imageFile)
				selectedEvent.image = imageUrl
				delete selectedEvent.imageFile
			}

			const response = await fetchWithCSRF("http://localhost:8000/api/events/", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(selectedEvent),
				}),
				responseData: APIError | Event[] = await response.json()
			if ("errors" in responseData) throw new Error(getErrorMessage(responseData))
			setSuccess("Evento criado com sucesso.")
			setShowCreateModal(false)
			setSelectedEvent(null)
			fetchEvents()
		} catch (err) {
			setError(err.message)
		}
	}

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedEvent) return
		setSuccess(null)
		setError(null)
		try {
			// Upload image if a new one was selected
			if (selectedEvent.imageFile) {
				const imageUrl = await uploadImage(selectedEvent.imageFile)
				selectedEvent.image = imageUrl
				delete selectedEvent.imageFile
			}

			const response = await fetchWithCSRF(`http://localhost:8000/api/events/${selectedEvent.id}/`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify(selectedEvent),
				}),
				responseData: APIError | Event = await response.json()
			if ("errors" in responseData) throw new Error(getErrorMessage(responseData))
			setSuccess("Evento editado com sucesso.")
			setShowEditModal(false)
			setSelectedEvent(null)
			fetchEvents()
		} catch (err) {
			setError(err.message)
		}
	}

	return (
		<div>
			<Button variant="secondary" className="mb-3" onClick={() => navigate("/")}>
				Voltar à Página Inicial
			</Button>
			<h1>Administração de Eventos</h1>
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
				{success && (
					<Toast onClose={() => setSuccess(null)} show={!!success} bg="success" delay={5000} autohide>
						<Toast.Header closeButton>
							<strong className="me-auto">Sucesso</strong>
						</Toast.Header>
						<Toast.Body className="text-white">{success}</Toast.Body>
					</Toast>
				)}
				{error && (
					<Toast onClose={() => setError(null)} show={!!error} bg="danger" delay={5000} autohide>
						<Toast.Header closeButton>
							<strong className="me-auto">Erro</strong>
						</Toast.Header>
						<Toast.Body className="text-white">{error}</Toast.Body>
					</Toast>
				)}
			</div>
			<Button
				variant="primary"
				className="mb-3"
				onClick={() => {
					setSelectedEvent({
						id: 0,
						name: "",
						description: "",
						date: "",
						location: "",
						latitude: 0.0,
						longitude: 0.0,
						is_visible: false,
						ticket_types: [
							{
								name: "",
								price: 0,
								quantity_available: 0,
								groups: [],
							},
						],
					})
					setShowCreateModal(true)
				}}
			>
				Criar Novo Evento
			</Button>
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Nome</th>
						<th>Data</th>
						<th>Localização</th>
						<th>Visível</th>
						<th>Tipos de Bilhete</th>
						<th>Ações</th>
					</tr>
				</thead>
				<tbody>
					{events.map(event => (
						<tr key={event.id}>
							<td>{event.name}</td>
							<td>
								{new Date(event.date).toLocaleString("pt", {
									dateStyle: "short",
									timeStyle: "short",
								})}
							</td>
							<td>
								<a
									href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									{event.location}
								</a>
							</td>
							<td>{event.is_visible ? "Sim" : "Não"}</td>
							<td>
								<ListGroup variant="flush">
									{event.ticket_types.map((type, index) => (
										<ListGroup.Item key={index} className="py-1 px-2">
											<div>
												<strong>Nome:</strong> {type.name}
												<strong>, Preço:</strong> €{type.price}
												<strong>, Quantidade:</strong> {type.quantity_available}
											</div>
										</ListGroup.Item>
									))}
								</ListGroup>
							</td>
							<td>
								<Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(event)}>
									Editar
								</Button>
								<Button variant="danger" size="sm" onClick={() => handleDelete(event.id)}>
									Apagar
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
			<Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Editar Evento</Modal.Title>
				</Modal.Header>
				<EventForm
					event={selectedEvent}
					setEvent={setSelectedEvent}
					onSubmit={handleEditSubmit}
					onCancel={() => {
						setShowEditModal(false)
						setSelectedEvent(null)
					}}
				/>
			</Modal>
			<Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Criar Novo Evento</Modal.Title>
				</Modal.Header>
				<EventForm
					event={selectedEvent}
					setEvent={setSelectedEvent}
					onSubmit={handleCreateSubmit}
					onCancel={() => {
						setShowCreateModal(false)
						setSelectedEvent(null)
					}}
				/>
			</Modal>
		</div>
	)
}

export default StaffEvents
