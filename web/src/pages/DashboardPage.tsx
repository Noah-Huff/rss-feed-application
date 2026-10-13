import { useAuth } from "../hooks/useAuth";
import { ItemList } from "../components/ItemList";
import "../styles/pages/dashboard.css";

export default function DashBoardPage() {
    const { user } = useAuth();

    return <div className="dashboard">
        <h1>Welcome, {user?.firstName} {user?.lastName}!</h1>
        <div className="dashboard-items">
            <h2 className="dashboard">Check out the latest from your feeds</h2>
            <ItemList />
        </div>
    </div>
}