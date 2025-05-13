import { useState } from "react"
import { Navbar, Nav, Container } from "react-bootstrap"
import { Route, Routes } from "react-router"
import LoginModal from "./components/LoginModal.tsx"
import SignupModal from "./components/SignupModal.tsx"
import SimpleLoginManager from "./components/SimpleLoginManager"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import StaffEvents from "./pages/StaffEvents"
import EditProfile from "./pages/EditProfile"
import EventDetails from "./pages/EventDetails"
import Home from "./pages/Home"
import Profile from "./pages/Profile"

function AppContent() {
	const [showLogin, setShowLogin] = useState(false)
	const [showSignup, setShowSignup] = useState(false)
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

	return (
		<>
			<Navbar bg="light" expand="lg">
				<Container>
					<Navbar.Brand href="/">
						<img
							src="/images/favicon.ico"
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
					<Route path="/staff/events" element={<StaffEvents />} />
				</Routes>
			</Container>

			<LoginModal {...loginModalProps} />
			<SignupModal {...signupModalProps} />
		</>
	)
}

function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	)
}

export default App
