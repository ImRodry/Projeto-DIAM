import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { Card, Button } from "react-bootstrap"
import LoginModal from "../components/LoginModal.tsx"
import SignupModal from "../components/SignupModal.tsx"

interface Event {
	id: number
	title: string
	description: string
	date: string
	ticket_price: number
	image?: string
}

const EventDetails = () => {
	const { id } = useParams<{ id: string }>()
	const [event, setEvent] = useState<Event | null>(null)
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [showLogin, setShowLogin] = useState(false)
	const [showSignup, setShowSignup] = useState(false)

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

	// useEffect(() => {
	// 	fetch(`http://localhost:8000/votacao/api/events/${id}/`)
	// 		.then(res => res.json())
	// 		.then(data => setEvent(data))
	// 		.catch(err => console.error("Failed to load event", err))

	// 	fetch("http://localhost:8000/votacao/api/user/", { credentials: "include" })
	// 		.then(res => setIsLoggedIn(res.ok))
	// 		.catch(() => setIsLoggedIn(false))
	// }, [id])

	// TESTE para usar o mock json
	useEffect(() => {
		// Fetch event data from the mock JSON file
		fetch("/mock-events.json")
			.then(res => res.json())
			.then(data => {
				// Find the event by ID from the mock data
				const foundEvent = data.find((e: Event) => String(e.id) === id)
				setEvent(foundEvent || null) // If event not found, set it to null
			})
			.catch(err => console.error("Failed to load event", err))

		// Simulate a user login status for testing
		const mockIsLoggedIn = false // Change to `false` to test logged-out state
		setIsLoggedIn(mockIsLoggedIn)
	}, [id])

	const handleBuyClick = () => {
		if (!isLoggedIn) {
			alert("Precisa de iniciar sessão para comprar bilhetes.")
			setShowLogin(true)
		} else {
			// TODO Redirect to purchase logic, or show ticket modal, etc.
			alert("Compra iniciada (simulada).")
		}
	}

	if (!event) return <p>A carregar evento...</p>

	return (
		<div>
			<LoginModal {...loginModalProps} />
            <SignupModal {...signupModalProps} />
			<Card className="mt-4">
				{event.image && <Card.Img variant="top" src={event.image} />}
				<Card.Body>
					<Card.Title>{event.title}</Card.Title>
					<Card.Text>{event.description}</Card.Text>
					<Card.Text>
						<strong>Data:</strong> {new Date(event.date).toLocaleDateString()}
					</Card.Text>
					<Card.Text>
						<strong>Preço do bilhete:</strong> {event.ticket_price.toFixed(2)} €
					</Card.Text>
					<Button variant="primary" onClick={handleBuyClick}>
						Comprar Bilhete
					</Button>
				</Card.Body>
			</Card>
		</div>
	)
}

export default EventDetails
