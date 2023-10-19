import React from "react"

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    children?: React.ReactNode;
    className?: string;
    autofocus?: boolean;
    label?: string;
}

const Input = ({type, id, name, label, placeholder, autofocus, onChange}: InputProps) => {
    return (
        <label className="text-gray-500 block mt-3">{label}
            <input
                required
                autoFocus={autofocus}
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                className="rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100"
                onChange={onChange}
            />
        </label>
    )
}

export default Input
