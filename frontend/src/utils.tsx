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
