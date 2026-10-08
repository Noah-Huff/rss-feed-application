import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, type SubmitEvent } from "react";
import { ApiError } from "../models/errors";
import { FormField } from "../components/FormField";
import type { RegisterUser } from "../models/userModel";

type FieldName = 'firstName' | 'lastName' | 'email' | 'password';
type FieldErrors = Partial<Record<FieldName, string>>;

function validate(values: RegisterUser): FieldErrors {
    const errors: FieldErrors = {};

    if (!values.firstName) errors.firstName = 'First name is required';
    else if (values.firstName.length > 100) errors.firstName = 'First name has too many characters';

    if (!values.lastName) errors.lastName = 'Last name is required';
    else if (values.lastName.length > 100) errors.lastName = 'Last name has too many characters';

    if (!values.email) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Email must be in correct format';
    else if (values.email.length > 254) errors.email = 'Email is too long';

    if (!values.password) errors.password = 'Password is required';
    else if (values.password.length < 8) errors.password = 'Password is too short';
    else if (values.password.length > 128) errors.password = 'Password is too long';

    return errors;
}

export default function RegisterPage() {
    const { register, status } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormError('');
        setFieldErrors({});

        const values = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password
        }
        const errors = validate(values);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setSubmitting(true);
        try {
            await register(values);
            navigate('/');
        } catch (err) {
            let message = 'Something unexpected happened';
            if (err instanceof ApiError) {
                if (err.status === 409) {
                    setFieldErrors({ email: 'This email is already in use.' });
                    message = '';
                }
                else if (err.status === 400) message = 'Check your details and try again.';
                else if (err.status === 429) message = 'Too many attempts. Try again later.';
                else message = err.message;
            }
            setFormError(message);
        } finally {
            setSubmitting(false);
        }
    }
    
    if (status === 'authenticated') return <Navigate to="/" replace />

    return <form onSubmit={handleSubmit} noValidate>
        <h1>Register here</h1>
        <FormField
            label="First Name"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={fieldErrors.firstName}
        />

        <FormField
            label="Last Name"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={fieldErrors.lastName}
        />

        <FormField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={fieldErrors.email}
        />

        <FormField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            error={fieldErrors.password}
        />

        {formError && <p role="alert">{formError}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "Registering..." : "Register"}</button>
        <Link to="/login">Already have an account? Login here</Link>
    </form>
}