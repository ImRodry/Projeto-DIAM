import { useEffect, useState } from "react"
import { Navbar, Nav, Container } from "react-bootstrap"
import { Route, Routes, useLocation } from "react-router"
import LoginModal from "./components/LoginModal.tsx"
import SignupModal from "./components/SignupModal.tsx"
import SimpleLoginManager from "./components/SimpleLoginManager"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import StaffEvents from "./pages/StaffEvents"
import EditProfile from "./pages/EditProfile"
import EventDetails from "./pages/EventDetails"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import { fetchWithCSRF } from "./utils"

function AppContent() {
	const [showLogin, setShowLogin] = useState(false)
	const [showSignup, setShowSignup] = useState(false)
	const location = useLocation()
	const { user, setUser } = useAuth()

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
		fetchWithCSRF("http://localhost:8000/api/user/", {
			credentials: "include",
		})
			.then(res => {
				if (!res.ok) throw new Error("User not logged in")
				return res.json()
			})
			.then(data => {
				setUser(data)
			})
			.catch(() => {
				setUser(null)
			})
	}, [location.pathname])

	return (
		<>
			<Navbar bg="light" expand="lg">
				<Container>
					<Navbar.Brand href="/">
						<img
							src="https://aeiscte-iul.pt/wp-content/uploads/2024/10/cropped-Logos-Completos_Azul-192x192.png"
							alt="Logo"
							width="50"
							height="50"
							className="d-inline-block align-middle me-3"
						/>
						Eventos AEISCTE
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="navbar" />
					<Navbar.Collapse id="navbar">
						<Nav className="ms-auto align-items-center">
							{!user && (
								<>
									<Nav.Link onClick={() => setShowLogin(true)}>Login</Nav.Link>
									<Nav.Link onClick={() => setShowSignup(true)}>Sign Up</Nav.Link>
								</>
							)}
							<SimpleLoginManager />
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>

			<Container className="mt-4">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/event/:id" element={<EventDetails />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/profile/edit" element={<EditProfile />} />
					<Route path="/staff" element={<StaffEvents />} />
				</Routes>
			</Container>

			<LoginModal {...loginModalProps} />
			<SignupModal {...signupModalProps} />
			<footer className="bg-light text-center text-muted py-4 mt-auto">
				<Container>
					<small className="d-block mb-2">AEISCTE</small>
					<small className="d-block">Telefone: +351 217 903 018</small>
					<small className="d-block">
						Morada:{" "}
						<a href="https://maps.app.goo.gl/ueHk8P7VR1sgT5rE9" target="_blank" rel="noopener noreferrer">
							Av. das Forças Armadas, 1649-026 Lisboa, Edifício ISCTE, Sala 0N12
						</a>
					</small>
					<small className="d-block">
						Email: <a href="mailto:geral@aeiscte-iul.pt">geral@aeiscte-iul.pt</a>
					</small>
				</Container>
			</footer>
		</>
	)
}

function App() {
	return (
		<AuthProvider>
			<div className="d-flex flex-column min-vh-100">
				<AppContent />
			</div>
		</AuthProvider>
	)
}

export default App
