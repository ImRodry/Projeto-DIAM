import { type FC } from "react"
import { Navbar, Nav, Container } from "react-bootstrap"
import { Route, Routes } from "react-router"
import SimpleLoginManager from "./components/SimpleLoginManager"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Home from "./pages/Home"

const App: FC = () => {
	return (
		<>
			<Navbar bg="light" expand="lg">
				<Container>
					<Navbar.Brand href="/">
						<img
							src="images/favicon.ico"
							alt="Brand Logo"
							width="50"
							height="50"
							className="d-inline-block align-items-middle me-3"
						/>
						Eventos AEISCTE
					</Navbar.Brand>

					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="ms-auto align-items-center">
							<Nav.Link href="/login">Login</Nav.Link>
							<Nav.Link href="/signup">Signup</Nav.Link>
							<SimpleLoginManager />
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>

			<Container className="mt-4">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
				</Routes>
			</Container>
		</>
	)
}

export default App
