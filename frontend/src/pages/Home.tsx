import { useEffect, useState } from "react"
import { Card, Row, Col, Spinner } from "react-bootstrap"
import { useNavigate } from "react-router"

interface Event {
	id: number
	title: string
	description: string
	date: string
	image?: string
}

function Home() {
	const [events, setEvents] = useState<Event[]>([])
	const navigate = useNavigate()
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch("http://localhost:8000/database/api/events/")
			.then(res => res.json())
			.then(data => setEvents(data))
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <Spinner animation="border" />

	const now = Date.now()
	const upcomingEvents = events.filter(e => Date.parse(e.date) > now)
	const pastEvents = events.filter(e => Date.parse(e.date) <= now)

	const renderEventCard = (event: Event) => (
		<Col key={event.id} md={4} className="mb-4">
			<Card onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: "pointer" }}>
				{event.image && <Card.Img variant="top" src={event.image} />}
				<Card.Body>
					<Card.Title>{event.title}</Card.Title>
					<Card.Text>{event.description}</Card.Text>
					<Card.Text className="text-muted">
						{new Date(event.date).toLocaleString("pt", { dateStyle: "short", timeStyle: "short" })}
					</Card.Text>
				</Card.Body>
			</Card>
		</Col>
	)

	return (
		<div>
			<h2 className="mb-4">Próximos Eventos</h2>
			<Row>{upcomingEvents.length > 0 ? upcomingEvents.map(renderEventCard) : <p>Nenhum evento futuro.</p>}</Row>

			<h2 className="mt-5 mb-4">Eventos Passados</h2>
			<Row>{pastEvents.length > 0 ? pastEvents.map(renderEventCard) : <p>Nenhum evento passado.</p>}</Row>
		</div>
	)
}

export default Home
