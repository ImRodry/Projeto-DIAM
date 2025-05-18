import { useRef, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { Card, Button, Spinner, ListGroup, Toast } from "react-bootstrap"
import LoginModal from "../components/LoginModal.tsx"
import SignupModal from "../components/SignupModal.tsx"
import { useAuth } from "../contexts/AuthContext"
import {
	fetchWithCSRF,
	getErrorMessage,
	type APIError,
	type Event,
	type EditableEvent,
	type Ticket,
	type TicketPostData,
	type TicketType,
} from "../utils"

function EventDetails() {
	const { id } = useParams<{ id: string }>()
	const [event, setEvent] = useState<EditableEvent | null>(null)
	const [eventTicket, setEventTicket] = useState<Ticket | null>(null)
	const [showLogin, setShowLogin] = useState(false)
	const [showSignup, setShowSignup] = useState(false)
	const [loading, setLoading] = useState(true)
	const { user } = useAuth()
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
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

	const fetchEvaluations = async () => {
		try {
			const response = await fetch(`http://localhost:8000/api/events/${id}/`),
				eventData: APIError | Event = await response.json()
			if ("errors" in eventData) throw new Error(getErrorMessage(eventData))

			const allTickets = eventData.ticket_types
				.flatMap((type: TicketType) => type.tickets || [])
				.filter((ticket: Ticket) => ticket.rating !== null)
				.map((ticket: Ticket) => ({
					stars: ticket.rating,
					comment: ticket.rating_comment,
				}))
			setEvaluations(allTickets)
		} catch (err) {
			setError(err.message)
		}
	}

	useEffect(() => {
		fetch(`http://localhost:8000/api/events/${id}/`)
			.then(res => res.json())
			.then(data => {
				setEvent(data)
				fetchEvaluations()
			})
			.catch(err => setError(err.message))
			.finally(() => setLoading(false))
	}, [id])
	useEffect(() => {
		fetchWithCSRF(`http://localhost:8000/api/purchases/`, {
			credentials: "include",
		})
			.then(r => r.json())
			.then((tickets: Ticket[]) =>
				setEventTicket(tickets.find(t => t.ticket_type.event.id === Number(id)) || null)
			)
	}, [evaluations])

	const handleBuyClick = async () => {
		if (!user) {
			setShowLogin(true)
			return
		}

		setError(null)
		setSuccess(null)

		if (!selectedTicketTypeId) {
			setError("Por favor, selecione um tipo de bilhete.")
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
			if ("errors" in responseData) throw new Error(getErrorMessage(responseData))
			setSuccess("Bilhete comprado com sucesso!")
		} catch (err) {
			setError(err.message)
		}
	}

	const handleEvaluationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setSuccess(null)
		const form = e.currentTarget
		const commentInput = form.elements.namedItem("comment") as HTMLTextAreaElement
		const comment = commentInput.value

		try {
			if (!eventTicket) throw new Error("Precisas de ter comprado bilhetes para avaliar o evento.")

			const ratingResponse = await fetchWithCSRF(`http://localhost:8000/api/purchase/${eventTicket.id}/`, {
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					rating: selectedStars,
					rating_comment: comment,
				}),
			})
			if (!ratingResponse.ok) {
				const data = await ratingResponse.json()
				throw new Error(getErrorMessage(data))
			}

			setSuccess("Avaliação enviada com sucesso!")
			setShowEvaluationForm(false)
			setSelectedStars(0)
			form.reset()

			await fetchEvaluations()
		} catch (err) {
			setError(err.message)
		}
	}

	if (loading) return <Spinner animation="border" />
	if (!event) return <p>Evento não encontrado.</p>

	const isPastEvent = Date.parse(event.date) <= Date.now()

	return (
		<div>
			<Button variant="secondary" className="mt-4" onClick={() => navigate("/")}>
				Voltar para a Página Inicial
			</Button>
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
			<LoginModal {...loginModalProps} />
			<SignupModal {...signupModalProps} />
			<Card className="mt-4 mb-4">
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
						{!isPastEvent ? (
							!user ? (
								<Button variant="warning" onClick={handleBuyClick}>
									Precisas de estar logged in para comprar bilhetes.
								</Button>
							) : (
								<>
									<select
										className="form-select"
										style={{ width: "300px" }}
										value={selectedTicketTypeId ?? ""}
										onChange={e => setSelectedTicketTypeId(Number(e.target.value))}
									>
										<option value="" disabled>
											Selecione um tipo de bilhete
										</option>
										{event.ticket_types
											.filter(type => type.groups.some(role => user.groups.includes(role)))
											.map((type, index) => (
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
							)
						) : (
							<>
								{user && eventTicket?.rating === null && (
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
								)}

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
