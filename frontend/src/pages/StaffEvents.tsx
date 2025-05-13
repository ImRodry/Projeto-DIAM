import { useState, useEffect } from "react"
import { Table, Button, Modal, Form, Alert } from "react-bootstrap"
import { useNavigate } from "react-router"

interface Event {
    id: number
    name: string
    description: string
    date: string
    location: string
    is_hidden: boolean
    tickets_sold: number
}

function StaffEvents() {
    const navigate = useNavigate()
    const [events, setEvents] = useState<Event[]>([])
    const [showEditModal, setShowEditModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isStaff, setIsStaff] = useState<boolean | null>(null)

    useEffect(() => {
        // Check if user is Staff
        fetch("http://localhost:8000/database/api/user/", {
            method: "GET",
            credentials: "include",
        })
            .then(async res => {
                if (!res.ok) throw new Error()
                const data = await res.json()
                if (!data.is_staff) {
                    navigate("/")
                    return
                }
                setIsStaff(true)
                fetchEvents()
            })
            .catch(() => {
                navigate("/")
            })
    }, [navigate])

    const fetchEvents = async () => {
        try {
            const response = await fetch("http://localhost:8000/database/api/events/admin/", {
                credentials: "include"
            })
            if (!response.ok) throw new Error("Failed to fetch events")
            const data = await response.json()
            setEvents(data)
        } catch (err) {
            setError("Failed to load events")
        }
    }

    // Don't render anything while checking Staff status
    if (isStaff === null) {
        return null
    }

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
            const response = await fetch(`http://localhost:8000/database/api/events/${eventId}/`, {
                method: "DELETE",
                credentials: "include"
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
            const response = await fetch(`http://localhost:8000/database/api/events/${selectedEvent.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(selectedEvent)
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
            const response = await fetch("http://localhost:8000/database/api/events/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(selectedEvent)
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
			<h1>Event Management</h1>
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
						is_hidden: false,
						tickets_sold: 0,
					})
					setShowCreateModal(true)
				}}
			>
				Create New Event
			</Button>

			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Name</th>
						<th>Date</th>
						<th>Location</th>
						<th>Hidden</th>
						<th>Tickets Sold</th>
						<th>Actions</th>
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
							<td>{event.is_hidden ? "Yes" : "No"}</td>
							<td>{event.tickets_sold}</td>
							<td>
								<Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(event)}>
									Edit
								</Button>
								<Button
									variant="danger"
									size="sm"
									onClick={() => handleDelete(event.id, event.tickets_sold)}
									disabled={event.tickets_sold > 0}
								>
									Delete
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</Table>

			<Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Event</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleEditSubmit}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Name</Form.Label>
							<Form.Control
								type="text"
								value={selectedEvent?.name || ""}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, name: e.target.value } : null))
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Description</Form.Label>
							<Form.Control
								as="textarea"
								value={selectedEvent?.description || ""}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, description: e.target.value } : null))
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Date</Form.Label>
							<Form.Control
								type="datetime-local"
								value={
									selectedEvent?.date ? new Date(selectedEvent.date).toISOString().slice(0, 16) : ""
								}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, date: e.target.value } : null))
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Location</Form.Label>
							<Form.Control
								type="text"
								value={selectedEvent?.location || ""}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, location: e.target.value } : null))
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Check
								type="checkbox"
								label="Hidden from public"
								checked={selectedEvent?.is_hidden || false}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, is_hidden: e.target.checked } : null))
								}
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowEditModal(false)}>
							Cancel
						</Button>
						<Button variant="primary" type="submit">
							Save Changes
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			<Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Create New Event</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleCreateSubmit}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Name</Form.Label>
							<Form.Control
								type="text"
								value={selectedEvent?.name || ""}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, name: e.target.value } : null))
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Description</Form.Label>
							<Form.Control
								as="textarea"
								value={selectedEvent?.description || ""}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, description: e.target.value } : null))
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Date</Form.Label>
							<Form.Control
								type="datetime-local"
								value={selectedEvent?.date || ""}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, date: e.target.value } : null))
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Location</Form.Label>
							<Form.Control
								type="text"
								value={selectedEvent?.location || ""}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, location: e.target.value } : null))
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Check
								type="checkbox"
								label="Hidden from public"
								checked={selectedEvent?.is_hidden || false}
								onChange={e =>
									setSelectedEvent(prev => (prev ? { ...prev, is_hidden: e.target.checked } : null))
								}
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowCreateModal(false)}>
							Cancel
						</Button>
						<Button variant="primary" type="submit">
							Create Event
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</div>
	)
}

export default StaffEvents 
