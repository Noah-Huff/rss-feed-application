import { type ChangeEvent } from "react";

interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    autoComplete?: string;
}

export function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    autoComplete
}: FormFieldProps) {
    return <div className="form-field">
        <label htmlFor={name}>{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
        />
        {error && <p id={`${name}-error`} role="alert">{error}</p>}
    </div>;
}

