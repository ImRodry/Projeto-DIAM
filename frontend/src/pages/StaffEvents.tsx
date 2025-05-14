import { useEffect, useState } from "react"
import { Table, Button, Modal, Alert, Spinner } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useAuth } from "../contexts/AuthContext"
import EventForm from "../components/EventModal"
import { fetchWithCSRF, type Event } from "../utils"

function StaffEvents() {
	const navigate = useNavigate()
	const [events, setEvents] = useState<Event[]>([])
	const [showEditModal, setShowEditModal] = useState(false)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
	const [error, setError] = useState<string | null>(null)
	const { user } = useAuth()

	const fetchEvents = async () => {
		try {
			const response = await fetchWithCSRF("http://localhost:8000/database/api/events/", {
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

	const handleDelete = async (eventId: number, ticketsSold: number) => {
		if (ticketsSold > 0) {
			alert("Cannot delete event with sold tickets")
			return
		}

		if (!confirm("Are you sure you want to delete this event?")) return

		try {
			const response = await fetchWithCSRF(`http://localhost:8000/database/api/events/${eventId}/`, {
				method: "DELETE",
				credentials: "include",
			})
			if (!response.ok) throw new Error("Failed to delete event")
			fetchEvents()
		} catch (err) {
			setError("Failed to delete event")
		}
	}

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedEvent) return

		try {
			const response = await fetchWithCSRF(`http://localhost:8000/database/api/events/${selectedEvent.id}/`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(selectedEvent),
			})
			if (!response.ok) throw new Error("Failed to update event")
			setShowEditModal(false)
			fetchEvents()
		} catch (err) {
			setError("Failed to update event")
		}
	}

	const handleCreateSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedEvent) return

		try {
			const response = await fetchWithCSRF("http://localhost:8000/database/api/events/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(selectedEvent),
			})
			if (!response.ok) throw new Error("Failed to create event")
			setShowCreateModal(false)
			fetchEvents()
		} catch (err) {
			setError("Failed to create event")
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
						description: "",
						date: "",
						location: "",
						latitude: 0.0,
						longitude: 0.0,
						is_visible: false,
						tickets_sold: 0,
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
						<th>Bilhetes Vendidos</th>
						<th>Ações</th>
					</tr>
				</thead>
				<tbody>
					{events.map(event => (
						<tr key={event.id}>
							<td>{event.name}</td>
							<td>
								{new Date(event.date).toLocaleString("pt", { dateStyle: "short", timeStyle: "short" })}
							</td>
							<td>{event.location}</td>
							<td>{event.is_visible ? "Sim" : "Não"}</td>
							<td>{event.tickets_sold}</td>
							<td>
								<Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(event)}>
									Editar
								</Button>
								<Button
									variant="danger"
									size="sm"
									onClick={() => handleDelete(event.id, event.tickets_sold)}
									disabled={event.tickets_sold > 0}
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
