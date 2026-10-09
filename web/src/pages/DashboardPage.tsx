import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import "../styles/pages/dashboard.css";

export default function DashBoardPage() {
    const { user, logout } = useAuth();
    return <div className="dashboard">
        <h1>Welcome, {user?.firstName} {user?.lastName}!</h1>
        <div>
        <button onClick={logout}>Log out</button>
        </div>
        <div className="explore-feeds">
            <Link to="/feeds">Explore My Feeds</Link>
        </div>
    </div>
}