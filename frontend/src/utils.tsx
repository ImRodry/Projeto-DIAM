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

export function getErrorMessage(error: APIError) {
	if (error.errors) {
		if (Array.isArray(error.errors)) {
			return error.errors.map(err => err).join(", ")
		} else if (typeof error.errors === "string") {
			return error.errors
		} else if (typeof error.errors === "object") {
			return Object.entries(error.errors)
				.map(
					([key, value]) =>
						`${key !== "non_field_errors" ? `${key}: ` : ""}${
							Array.isArray(value) ? value.join(", ") : value
						}`
				)
				.join("\n")
		}
	}
	console.error("Unknown error format:", error)
	return "An unknown error occurred"
}

export function isStaff(user: User): boolean {
	return user.groups.includes(UserRole.Staff)
}

export const enum UserRole {
	Aluno = 1,
	Sócio,
	Staff,
}

export interface SignupFormData {
	username: string
	password: string
	email: string
	firstName: string
	lastName: string
}

export interface LoginFormData {
	username: string
	password: string
}

export interface APIError {
	errors: unknown
}

export interface User {
	username: string
	email: string
	first_name: string
	last_name: string
	date_joined: Date
	groups: UserRole[]
}

export interface Event {
	id: number
	name: string
	image?: string
	description: string
	date: string
	location: string
	latitude: number
	longitude: number
	is_visible: boolean
	ticket_types: TicketType[]
}

export interface EditableEvent extends EventPostData {
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

export interface EventPostData {
	id: number
	name: string
	image?: string
	description: string
	date: string
	location: string
	latitude: number
	longitude: number
	is_visible: boolean
	ticket_types: TicketTypePostData[]
}

export interface TicketTypePostData {
	id?: number
	name: string
	price: number
	quantity_available: number
}

export interface TicketPostData {
	ticket_type_id: number
	quantity: number
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
