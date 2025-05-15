import { useRef, useEffect, useState } from "react"
import { useParams } from "react-router"
import { Card, Button, Spinner, ListGroup, Alert } from "react-bootstrap"
import LoginModal from "../components/LoginModal.tsx"
import SignupModal from "../components/SignupModal.tsx"
import { useAuth } from "../contexts/AuthContext"
import {
	fetchWithCSRF,
	getErrorMessage,
	type APIError,
	type EditableEvent,
	type Ticket,
	type TicketPostData,
} from "../utils"

function EventDetails() {
	const { id } = useParams<{ id: string }>()
	const [event, setEvent] = useState<EditableEvent | null>(null)
	const [showLogin, setShowLogin] = useState(false)
	const [showSignup, setShowSignup] = useState(false)
	const [loading, setLoading] = useState(true)
	const { user } = useAuth()
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	useEffect(() => {
		if (success) {
			const timer = setTimeout(() => {
				setSuccess(null)
			}, 3000) // 3 seconds
			return () => clearTimeout(timer)
		}
	}, [success])

	const [ticketQuantity, setTicketQuantity] = useState(1)
	const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null)

	const [showEvaluationForm, setShowEvaluationForm] = useState(false)
	const [showEvaluations, setShowEvaluations] = useState(false)
	const [selectedStars, setSelectedStars] = useState<number>(0)
	const [evaluations, setEvaluations] = useState<{ stars: number; comment: string }[]>([])
	const evaluationFormRef = useRef<HTMLDivElement | null>(null)
	const evaluationsRef = useRef<HTMLDivElement | null>(null)

	const loginModalProps = {
		show: showLogin,
		onHide: () => setShowLogin(false),
		onShowSignup: () => {
			setShowLogin(false)
			setShowSignup(true)
		},
	}

	const signupModalProps = {
		show: showSignup,
		onHide: () => setShowSignup(false),
	}

	useEffect(() => {
		fetch(`http://localhost:8000/api/events/${id}/`)
			.then(res => res.json())
			.then(data => setEvent(data))
			.catch(err => console.error("Failed to load event", err))
			.finally(() => setLoading(false))
	}, [id])

	const handleBuyClick = async () => {
		if (!user) {
			setShowLogin(true)
			return
		}

		if (!selectedTicketTypeId) {
			alert("Por favor selecione um tipo de bilhete.")
			return
		}

		const purchaseData: TicketPostData = {
			ticket_type_id: selectedTicketTypeId,
			quantity: ticketQuantity,
		}

		try {
			const response = await fetchWithCSRF("http://localhost:8000/api/purchases/", {
					method: "POST",
					body: JSON.stringify(purchaseData),
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				}),
				responseData: APIError | Ticket = await response.json()
			setSuccess("Bilhete comprado com sucesso!")
			if ("errors" in responseData) throw new Error(getErrorMessage(responseData))
		} catch (err) {
			setError(err.message)
		}
	}

	const handleEvaluationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (selectedStars < 1 || selectedStars > 5) {
			alert("Por favor, selecione de 1 a 5 estrelas.")
			return
		}

		const form = e.currentTarget
		const commentInput = form.elements.namedItem("comment") as HTMLTextAreaElement
		const comment = commentInput.value

		setEvaluations(prev => [...prev, { stars: selectedStars, comment }])
		setShowEvaluationForm(false)
		setSelectedStars(0)
	}

	if (loading) return <Spinner animation="border" />
	if (!event) return <p>Evento não encontrado.</p>

	const isPastEvent = Date.parse(event.date) <= Date.now()

	return (
		<div>
			<LoginModal {...loginModalProps} />
			<SignupModal {...signupModalProps} />
			<Card className="mt-4 mb-4">
				{success && <Alert variant="success">{success}</Alert>}
				{error && <Alert variant="danger">{error}</Alert>}
				{event.image && (
					<Card.Img
						variant="top"
						src={"http://localhost:8000" + event.image}
						alt={event.name}
						style={{ objectFit: "cover" }}
					/>
				)}
				<Card.Body>
					<Card.Title>{event.name}</Card.Title>
					<Card.Text>{event.description}</Card.Text>
					<Card.Text>
						<strong>Localização:</strong>{" "}
						<a
							href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{event.location}
						</a>
					</Card.Text>
					<Card.Text>
						<strong>Data:</strong>{" "}
						{new Date(event.date).toLocaleString("pt", { dateStyle: "short", timeStyle: "short" })}
					</Card.Text>
					<div className="card-text">
						<strong>Tipos de Bilhete:</strong>
						<ListGroup variant="flush">
							{event.ticket_types && event.ticket_types.length > 0 ? (
								event.ticket_types.map((type, index) => (
									<ListGroup.Item key={index} className="py-1 px-2">
										<div>
											<strong>Nome:</strong> {type.name}
											<strong>, Preço:</strong> €{type.price}
										</div>
									</ListGroup.Item>
								))
							) : (
								<ListGroup.Item className="py-1 px-2">
									Nenhum tipo de bilhete disponível.
								</ListGroup.Item>
							)}
						</ListGroup>
					</div>
					<div className="d-flex flex-wrap gap-2 mt-3">
						{!isPastEvent && (
							<>
								<select
									className="form-select"
									style={{ width: "200px" }}
									value={selectedTicketTypeId ?? ""}
									onChange={e => setSelectedTicketTypeId(Number(e.target.value))}
								>
									<option value="" disabled>
										Selecione um tipo de bilhete
									</option>
									{event.ticket_types.map((type, index) => (
										<option key={index} value={type.id}>
											{type.name} – €{type.price}
										</option>
									))}
								</select>
								<input
									type="number"
									min={1}
									value={ticketQuantity}
									onChange={e => setTicketQuantity(Number(e.target.value))}
									className="form-control"
									style={{ width: "80px" }}
								/>
								<Button variant="primary" onClick={handleBuyClick}>
									Comprar
								</Button>
							</>
						)}
						{isPastEvent && (
							<>
								<Button
									variant="warning"
									onClick={() => {
										setShowEvaluationForm(prev => {
											const next = !prev
											if (next) {
												setShowEvaluations(false)
												setTimeout(
													() =>
														evaluationFormRef.current?.scrollIntoView({
															behavior: "smooth",
														}),
													100
												)
											}
											return next
										})
									}}
								>
									Avaliar Evento
								</Button>
								<Button
									variant="secondary"
									onClick={() => {
										setShowEvaluations(prev => {
											const next = !prev
											if (next) {
												setShowEvaluationForm(false)
												setTimeout(
													() =>
														evaluationsRef.current?.scrollIntoView({ behavior: "smooth" }),
													100
												)
											}
											return next
										})
									}}
								>
									Ver Avaliações
								</Button>
							</>
						)}
					</div>
				</Card.Body>
			</Card>

			{showEvaluationForm && (
				<div ref={evaluationFormRef} className="mb-4 mt-4">
					<form onSubmit={handleEvaluationSubmit} className="mt-4">
						<div className="mb-3">
							<label className="form-label">Estrelas:</label>
							<div>
								{[1, 2, 3, 4, 5].map(star => {
									let colorClass = "btn-outline-secondary"
									if (selectedStars >= star) {
										colorClass =
											selectedStars <= 2
												? "btn-danger"
												: selectedStars === 3
												? "btn-warning"
												: "btn-success"
									}
									return (
										<button
											type="button"
											key={star}
											className={`btn btn-sm me-1 ${colorClass}`}
											onClick={() => setSelectedStars(star)}
										>
											★
										</button>
									)
								})}
							</div>
						</div>
						<div className="mb-3">
							<label htmlFor="comment" className="form-label">
								Comentário:
							</label>
							<textarea id="comment" name="comment" className="form-control" rows={3} required />
						</div>
						<Button type="submit" variant="success">
							Submeter Avaliação
						</Button>
					</form>
				</div>
			)}

			{showEvaluations && (
				<div ref={evaluationsRef} className="mb-4 mt-4">
					<div className="mt-4">
						<h5>Avaliações</h5>
						{evaluations.length === 0 ? (
							<p>Sem avaliações ainda.</p>
						) : (
							evaluations.map((evaluation, index) => (
								<Card key={index} className="mb-2">
									<Card.Body>
										<div>
											<strong>⭐ {evaluation.stars}/5</strong>
										</div>
										<p className="mb-0">{evaluation.comment}</p>
									</Card.Body>
								</Card>
							))
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default EventDetails
