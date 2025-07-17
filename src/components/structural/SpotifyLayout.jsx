import { Container, Navbar } from "react-bootstrap";

function SpotifyLayout() {
    const [loginStatus, setLoginStatus] = useState(() => {
        const saved = sessionStorage.getItem("spotify-login");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (loginStatus) {
            sessionStorage.setItem("spotify-login", JSON.stringify(loginStatus));
        } else {
            sessionStorage.removeItem("spotify-login");
        }
    }, [loginStatus]);

    return (
        <div>
            <Navbar bg="dark" variant="dark">
                <Container>
                    
                </Container>
            </Navbar>
        </div>
    );
}

export default SpotifyLayout;