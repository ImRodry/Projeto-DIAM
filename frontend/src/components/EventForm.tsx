import { useState, useEffect } from "react"
import { Button, Col, Form, Modal, Row } from "react-bootstrap"
import { UserRole, type EditableEvent } from "../utils"

type EventFormProps = {
	event: EditableEvent | null
	setEvent: React.Dispatch<React.SetStateAction<EditableEvent | null>>
	onSubmit: (e: React.FormEvent) => void
	onCancel: () => void
}

function EventForm({ event, setEvent, onSubmit, onCancel }: EventFormProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl)
			}
		}
	}, [previewUrl])

	if (!event) return null

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setEvent(prev => (prev ? { ...prev, imageFile: file } : null))
			const objectUrl = URL.createObjectURL(file)
			setPreviewUrl(objectUrl)
		}
	}
	const isFormValid = event.ticket_types.every(tt => tt.groups.length > 0)

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
					<Form.Label>Imagem</Form.Label>
					<Form.Control type="file" accept="image/*" onChange={handleImageChange} />
					{previewUrl ? (
						<div className="mt-2">
							<img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px" }} />
						</div>
					) : event.image ? (
						<div className="mt-2">
							<img
								src={"http://localhost:8000" + event.image}
								alt="Current"
								style={{ maxWidth: "100%", maxHeight: "200px" }}
							/>
						</div>
					) : null}
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
					<Row>
						<Col md={6}>
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
						</Col>
						<Col md={6}>
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
						</Col>
					</Row>
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
				<Form.Group className="mb-3">
					<Form.Label>Tipos de Bilhete</Form.Label>
					<div>
						{event.ticket_types.map((ticketType, index) => (
							<div key={`ticket-type-${index}`}>
								<Row className="mb-2 align-items-end">
									<Col md={4}>
										<Form.Label>Nome</Form.Label>
										<Form.Control
											type="text"
											value={ticketType.name}
											onChange={e => {
												const updated = [...event.ticket_types]
												updated[index].name = e.target.value
												setEvent(prev => (prev ? { ...prev, ticket_types: updated } : null))
											}}
											required
										/>
									</Col>
									<Col md={3}>
										<Form.Label>Preço</Form.Label>
										<Form.Control
											type="number"
											step="1.00"
											min="1.00"
											value={ticketType.price}
											onChange={e => {
												const updated = [...event.ticket_types]
												updated[index].price = parseFloat(e.target.value)
												setEvent(prev => (prev ? { ...prev, ticket_types: updated } : null))
											}}
											required
										/>
									</Col>
									<Col md={3}>
										<Form.Label>Quantidade</Form.Label>
										<Form.Control
											type="number"
											min="1"
											value={ticketType.quantity_available}
											onChange={e => {
												const updated = [...event.ticket_types]
												updated[index].quantity_available = parseInt(e.target.value, 10)
												setEvent(prev => (prev ? { ...prev, ticket_types: updated } : null))
											}}
											required
										/>
									</Col>
									<Col md={1}>
										<Button
											variant="danger"
											onClick={() => {
												if (event.ticket_types.length > 1) {
													const updated = event.ticket_types.filter((_, i) => i !== index)
													setEvent(prev => (prev ? { ...prev, ticket_types: updated } : null))
												}
											}}
											disabled={event.ticket_types.length === 1}
										>
											&times;
										</Button>
									</Col>
								</Row>
								<Row>
									<Col md={12}>
										<Form.Label>Grupos</Form.Label>
										<div className="d-flex flex-wrap gap-3 mb-2">
											{Object.keys(UserRole)
												.filter(key => isNaN(Number(key)))
												.map(key => {
													const roleKey = key as keyof typeof UserRole
													const isChecked = (ticketType.groups || []).includes(
														UserRole[roleKey]
													)
													return (
														<Form.Check
															type="checkbox"
															id={`role-${key}-${index}`}
															key={key}
															label={key}
															value={key}
															checked={isChecked}
															onChange={e => {
																const updated = [...event.ticket_types]
																const roleKey = key as keyof typeof UserRole
																const role = UserRole[roleKey]
																const currentGroups = updated[index].groups || []
																if (e.target.checked) {
																	updated[index].groups = [...currentGroups, role]
																} else {
																	updated[index].groups = currentGroups.filter(
																		(r: UserRole) => r !== role
																	)
																}
																setEvent(prev =>
																	prev ? { ...prev, ticket_types: updated } : null
																)
															}}
														/>
													)
												})}
										</div>
									</Col>
								</Row>
							</div>
						))}
						<Button
							variant="success"
							size="sm"
							onClick={() =>
								setEvent(prev =>
									prev
										? {
												...prev,
												ticket_types: [
													...prev.ticket_types,
													{
														name: "",
														price: 0,
														quantity_available: 0,
														groups: [],
													},
												],
										  }
										: null
								)
							}
						>
							Adicionar Tipo de Bilhete
						</Button>
					</div>
				</Form.Group>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" type="button" onClick={onCancel}>
					Cancelar
				</Button>
				<Button variant="primary" type="submit" disabled={!isFormValid}>
					Guardar
				</Button>
			</Modal.Footer>
		</Form>
	)
}

export default EventForm
