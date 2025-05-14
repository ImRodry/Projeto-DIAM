import { useEffect, useState } from "react"
import { Table, Button, Modal, Alert, Spinner } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import EventForm from "../components/EventForm"
import { fetchWithCSRF, type EditableEvent, type Event, type TicketType } from "../utils"

function StaffEvents() {
	const navigate = useNavigate()
	const [events, setEvents] = useState<Event[]>([])
	const [showEditModal, setShowEditModal] = useState(false)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [selectedEvent, setSelectedEvent] = useState<EditableEvent | null>(null)
	const [error, setError] = useState<string | null>(null)
	const { user } = useAuth()

	const fetchEvents = async () => {
		try {
			const response = await fetchWithCSRF("http://localhost:8000/api/events/", {
				credentials: "include",
			})
			if (!response.ok) throw new Error("Failed to fetch events")
			const data = await response.json()
			setEvents(data)
		} catch (err) {
			setError("Failed to load events")
		}
	}

	useEffect(() => {
		fetchEvents()
	}, [])

	// Don't render anything while checking Staff status
	if (!user) return <Spinner animation="border" />
	if (!user.is_staff) navigate("/")

	const handleEdit = (event: Event) => {
		setSelectedEvent(event)
		setShowEditModal(true)
	}

	const handleDelete = async (eventId: number, ticketTypes: TicketType[]) => {
		if (ticketTypes.some(type => type.tickets.length > 0)) {
			alert("Cannot delete event with sold tickets")
			return
		}

		if (!confirm("Are you sure you want to delete this event?")) return

		try {
			const response = await fetchWithCSRF(`http://localhost:8000/api/events/${eventId}/`, {
				method: "DELETE",
				credentials: "include",
			})
			if (!response.ok) throw new Error("Failed to delete event")
			fetchEvents()
		} catch (err) {
			setError("Failed to delete event")
		}
	}

	const uploadImageIfPresent = async (imageFile: File): Promise<string> => {
		const formData = new FormData()
		formData.append("image", imageFile)

		const response = await fetchWithCSRF("http://localhost:8000/api/upload/", {
			method: "POST",
			body: formData,
			credentials: "include",
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || "Image upload failed")
		}

		const data = await response.json()
		return data.image_url || data.image_path
	}

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedEvent) return

		try {
			// Upload image if selected
			if (selectedEvent.imageFile) {
				const imageUrl = await uploadImageIfPresent(selectedEvent.imageFile)
				selectedEvent.image = imageUrl
				delete selectedEvent.imageFile
			}

			const response = await fetchWithCSRF("http://localhost:8000/api/events/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(selectedEvent),
			})

			if (!response.ok) throw new Error("Failed to create event")

			setShowCreateModal(false)
			setSelectedEvent(null)
			fetchEvents()
		} catch (err) {
			setError("Failed to create event")
		}
	}

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedEvent) return

		try {
			// Upload image if a new one was selected
			if (selectedEvent.imageFile) {
				const imageUrl = await uploadImageIfPresent(selectedEvent.imageFile)
				selectedEvent.image = imageUrl
				delete selectedEvent.imageFile
			}

			const response = await fetchWithCSRF(`http://localhost:8000/api/events/${selectedEvent.id}/`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(selectedEvent),
			})

			if (!response.ok) throw new Error("Failed to update event")

			setShowEditModal(false)
			setSelectedEvent(null)
			fetchEvents()
		} catch (err) {
			setError("Failed to update event")
		}
	}

	return (
		<div>
			<h1>Administração de Eventos</h1>
			{error && <Alert variant="danger">{error}</Alert>}
			<Button
				variant="primary"
				className="mb-3"
				onClick={() => {
					setSelectedEvent({
						id: 0,
						name: "",
						image: "",
						description: "",
						date: "",
						location: "",
						latitude: 0.0,
						longitude: 0.0,
						is_visible: false,
						ticket_types: [],
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
						<th>Tipo de Bilhete</th>
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
							<td>{event.ticket_types.map(type => type.name).join(", ")}</td>
							<td>
								<Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(event)}>
									Editar
								</Button>
								<Button
									variant="danger"
									size="sm"
									onClick={() => handleDelete(event.id, event.ticket_types)}
									disabled={event.ticket_types.some(type => type.tickets.length > 0)}
								>
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
