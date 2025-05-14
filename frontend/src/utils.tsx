export function getCSRFToken() {
	return document.cookie
		.split("; ")
		.find(row => row.startsWith("csrftoken="))
		?.split("=")[1]
}

export function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
	const csrfToken = getCSRFToken()
	if (csrfToken) {
		options.headers = {
			...options.headers,
			"X-CSRFToken": csrfToken,
		}
	}
	return fetch(url, options)
}

export interface APIError {
	error: string
}

export interface User {
	username: string
	email: string
	first_name: string
	last_name: string
	date_joined: Date
	is_staff: boolean
}

export interface Event {
	id: number
	name: string
	image: string
	description: string
	date: string
	location: string
	latitude: number
	longitude: number
	is_visible: boolean
	ticket_types: TicketType[]
}

export interface EditableEvent extends Event {
	imageFile?: File
}

export interface TicketType {
	event: Event
	id: number
	name: string
	price: number
	quantity_available: number
	tickets: Ticket[]
}

export interface Ticket {
	id: number
	ticket_type: TicketType
	user: User
	purchase_date: Date
	quantity: number
	rating: number
	rating_comment: string
}
