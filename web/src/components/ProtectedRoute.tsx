import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { status } = useAuth();

    if (status === 'loading') return <p>Loading...</p>;
    if (status === 'unauthenticated') return <Navigate to="/login" replace />;
    if (status === 'authenticated') return children;
    if (status === 'error') {
        return (
            <main>
                <p role="alert">Couldn't reach the server. Please try again in a moment.</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </main>
        );
    }
}