import { Button, Form, Modal } from "react-bootstrap"
import { type Event } from "../utils"

type EventFormProps = {
	event: Event | null
	setEvent: React.Dispatch<React.SetStateAction<Event | null>>
	onSubmit: (e: React.FormEvent) => void
	onCancel: () => void
}

function EventForm({ event, setEvent, onSubmit, onCancel }: EventFormProps) {
	if (!event) return null

	return (
		<Form onSubmit={onSubmit}>
			<Modal.Body>
				<Form.Group className="mb-3">
					<Form.Label>Nome</Form.Label>
					<Form.Control
						type="text"
						value={event.name}
						onChange={e => setEvent(prev => (prev ? { ...prev, name: e.target.value } : null))}
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Descrição</Form.Label>
					<Form.Control
						as="textarea"
						value={event.description}
						onChange={e => setEvent(prev => (prev ? { ...prev, description: e.target.value } : null))}
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Data</Form.Label>
					<Form.Control
						type="datetime-local"
						value={event.date ? new Date(event.date).toISOString().slice(0, 16) : ""}
						onChange={e => setEvent(prev => (prev ? { ...prev, date: e.target.value } : null))}
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Localização</Form.Label>
					<Form.Control
						type="text"
						value={event.location}
						onChange={e => setEvent(prev => (prev ? { ...prev, location: e.target.value } : null))}
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Latitude</Form.Label>
					<Form.Control
						type="number"
						step="any"
						value={event.latitude}
						onChange={e =>
							setEvent(prev => (prev ? { ...prev, latitude: parseFloat(e.target.value) } : null))
						}
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Longitude</Form.Label>
					<Form.Control
						type="number"
						step="any"
						value={event.longitude}
						onChange={e =>
							setEvent(prev => (prev ? { ...prev, longitude: parseFloat(e.target.value) } : null))
						}
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Check
						type="checkbox"
						label="Visível ao público"
						id="is_visible"
						checked={event.is_visible}
						onChange={e => setEvent(prev => (prev ? { ...prev, is_visible: e.target.checked } : null))}
					/>
				</Form.Group>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" type="button" onClick={onCancel}>
					Cancelar
				</Button>
				<Button variant="primary" type="submit">
					Guardar
				</Button>
			</Modal.Footer>
		</Form>
	)
}

export default EventForm
