import { Link } from "react-router-dom";
import "../styles/components/navbar.css";
import { useAuth } from "../hooks/useAuth";

export default function NavBar() {
    const { logout } = useAuth();

    return <nav className="navbar">
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/feeds">My Feeds</Link></li>
            <li><button onClick={logout}>Log out</button></li>
        </ul>
    </nav>
}