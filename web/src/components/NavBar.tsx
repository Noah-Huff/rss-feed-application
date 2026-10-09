import { Link } from "react-router-dom";
import "../styles/components/navbar.css";

export default function NavBar() {

    return <nav>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/feeds">My Feeds</Link></li>
        </ul>
    </nav>
}