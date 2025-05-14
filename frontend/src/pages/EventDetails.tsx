import { useRef, useEffect, useState } from "react"
import { useParams } from "react-router"
import { Card, Button, Spinner } from "react-bootstrap"
import LoginModal from "../components/LoginModal.tsx"
import SignupModal from "../components/SignupModal.tsx"
import { useAuth } from "../contexts/AuthContext"
import { type EditableEvent } from "../utils"

function EventDetails() {
	const { id } = useParams<{ id: string }>()
	const [event, setEvent] = useState<EditableEvent | null>(null)
	const [showLogin, setShowLogin] = useState(false)
	const [showSignup, setShowSignup] = useState(false)
	const [loading, setLoading] = useState(true)
	const { user } = useAuth()

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
		fetch(`http://localhost:8000/database/api/events/${id}/`)
			.then(res => res.json())
			.then(data => setEvent(data))
			.catch(err => console.error("Failed to load event", err))
			.finally(() => setLoading(false))
	}, [id])

	const [ticketQuantity, setTicketQuantity] = useState(1)

	const handleBuyClick = () => {
		if (!user) {
			setShowLogin(true)
		} else {
			// TODO Redirect to purchase logic, or show ticket modal, etc.
		}
	}

	const [showEvaluationForm, setShowEvaluationForm] = useState(false)
	const [showEvaluations, setShowEvaluations] = useState(false)
	const [selectedStars, setSelectedStars] = useState<number>(0)
	const [evaluations, setEvaluations] = useState<{ stars: number; comment: string }[]>([])
	const evaluationFormRef = useRef<HTMLDivElement | null>(null)
	const evaluationsRef = useRef<HTMLDivElement | null>(null)

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
			<Card className="mt-4">
				{event.image && (
					<Card.Img
						variant="top"
						src={"http://localhost:8000" + event.image}
						alt={event.name}
						style={{ objectFit: "cover", maxHeight: "300px" }}
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
					{/* <Card.Text>
						<strong>Preço do bilhete:</strong> {event.ticket_price.toFixed(2)} €
					</Card.Text> */}
					<div className="d-flex flex-wrap gap-2 mt-3">
						{!isPastEvent && (
							<div className="d-flex align-items-center gap-2">
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
							</div>
						)}
						{isPastEvent && (
							<Button
								variant="warning"
								onClick={() => {
									setShowEvaluationForm(prev => {
										const next = !prev
										if (next) {
											setShowEvaluations(false) // Auto-collapse other
											setTimeout(
												() => evaluationFormRef.current?.scrollIntoView({ behavior: "smooth" }),
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
						{isPastEvent && (
							<Button
								variant="secondary"
								onClick={() => {
									setShowEvaluations(prev => {
										const next = !prev
										if (next) {
											setShowEvaluationForm(false) // Auto-collapse other
											setTimeout(
												() => evaluationsRef.current?.scrollIntoView({ behavior: "smooth" }),
												100
											)
										}
										return next
									})
								}}
							>
								Ver Avaliações
							</Button>
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
									let colorClass = "btn-outline-secondary" // default (unselected)

									if (selectedStars >= star) {
										if (selectedStars <= 2) {
											colorClass = "btn-danger" // red
										} else if (selectedStars === 3) {
											colorClass = "btn-warning" // grey
										} else {
											colorClass = "btn-success" // green
										}
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
