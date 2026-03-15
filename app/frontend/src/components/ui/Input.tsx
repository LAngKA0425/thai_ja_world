"use client";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const inputBase =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            {label}
          </label>
        )}
        <input ref={ref} className={`${inputBase} ${error ? "border-danger-500 focus:ring-danger-500/20" : ""} ${className}`} {...props} />
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${inputBase} resize-none ${error ? "border-danger-500 focus:ring-danger-500/20" : ""} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export default Input;
