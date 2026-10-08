import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function DashBoardPage() {
    const { user, logout } = useAuth();
    return <div>
        <h1>Welcome, {user?.firstName}!</h1>
        <button onClick={logout}>Log out</button>
        <Link to="/feeds">My feeds</Link>
    </div>
}