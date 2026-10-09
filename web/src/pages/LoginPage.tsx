import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { type SubmitEvent, useState } from "react";
import { ApiError } from "../models/errors";
import { FormField } from "../components/FormField";
import "../styles/pages/login-register.css";

export default function LoginPage() {
    const { login, status } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormError('');

        const values = {
            email: email.trim(),
            password: password
        }

        if (!values) {
            setFormError('Please enter your email and password.');
            return;
        }

        setSubmitting(true);
        try {
            await login(values);
            navigate('/');
        } catch (err) {
            let message = 'Something unexpected happened';
            if (err instanceof ApiError) {
                if (err.status === 400) message = 'Please enter a valid email and password.';
                else if (err.status === 401) message = 'Invalid email or password.';
                else if (err.status === 429) message = 'Too many attempts, please try again later.';
                else message = err.message;
            }
            setFormError(message);
        } finally {
            setSubmitting(false);
        }

    }

    if (status === 'authenticated') return <Navigate to="/" replace />

    return <form onSubmit={handleSubmit} noValidate className="login-register">
        <h1>Log in</h1>
        <div>
        <FormField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            />
        </div>

        <div>
        <FormField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            />
        </div>

        {formError && <p role="alert">{formError}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "Logging in..." : "Log in"}</button>
        <div>
            <Link to="/register">Create an account</Link>
        </div>
    </form>
}