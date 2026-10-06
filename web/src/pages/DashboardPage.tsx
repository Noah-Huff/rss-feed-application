import { useAuth } from "../hooks/useAuth"

export default function DashBoardPage() {
    const { user, logout } = useAuth();
    return <div>
        <h1>Welcome, {user?.firstName}!</h1>
        <button onClick={logout}>Log out</button>
    </div>
}