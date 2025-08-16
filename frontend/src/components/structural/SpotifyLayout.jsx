import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

import logo from "../../assets/logo.png";
import ThemeToggle from "../ThemeToggle";

function SpotifyLayout() {
    const [loginStatus, setLoginStatus] = React.useState(() => {
        const saved = sessionStorage.getItem("spotify-login");
        return saved ? JSON.parse(saved) : null;
    });

    React.useEffect(() => {
        if (loginStatus) {
            sessionStorage.setItem("spotify-login", JSON.stringify(loginStatus));
        } else {
            sessionStorage.removeItem("spotify-login");
        }
    }, [loginStatus]);

    return (
        <div>
            <Navbar bg="dark" variant="dark" expand="md" fixed="top" className="w-100">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
                        <img
                            alt="logo"
                            src={logo}
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />
                        Spotify Explorer Lite
                    </Navbar.Brand>

                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        {loginStatus ?
                            (<Nav.Link as={Link} to="logout">Logout</Nav.Link>)
                            :
                            (
                                <>
                                    <Nav.Link as={Link} to="login">Login</Nav.Link>
                                    <Nav.Link as={Link} to="register">Register</Nav.Link>
                                </>
                            )
                        }

                        <NavDropdown title="Library">
                            <NavDropdown.Item
                                as={Link}
                                to={`/library/songs`}
                            >
                                Songs
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to={`/library/albums`}
                            >
                                Albums
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={Link}
                                to={`/library/playlists`}
                            >
                                Playlists
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>
            </Navbar>

            <div style={{ margin: "1rem", paddingTop: "4.5rem" }}>
                <ThemeToggle
                    className="position-fixed top-1 end-0 p-2"
                />
                <Outlet />

            </div>
        </div>
    );
}

export default SpotifyLayout;