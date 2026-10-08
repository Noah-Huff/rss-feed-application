import { Link } from "react-router-dom";
import "../styles/components/navbar.css";
//import { useAuth } from "../hooks/useAuth";

export default function NavBar() {
    //const { user, status } = useAuth();

    return <nav>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/feeds">My Feeds</Link></li>
        </ul>
    </nav>
}