import { useState } from "react"
import { PhEyeBold, PhEyeClosedBold } from "./Icons"

const inputVariants = {
  default: 'input-default',
  outlined: 'input-outlined',
  filled: 'input-filled',
  underlined: 'input-underlined',
}

const inputSizes = {
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
}

export function Input({ 
  label,
  type = 'text',
  name,
  placeholder,
  onChange,
  value,
  variant = 'default',
  size = 'md',
  disabled = false,
  required = false,
  error,
  helperText,
  icon,
  className = '',
  ...rest 
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const isTextarea = type === 'textarea'

  const baseClasses = 'input'
  const variantClass = inputVariants[variant] || inputVariants.default
  const sizeClass = inputSizes[size] || inputSizes.md
  const errorClass = error ? 'input-error' : ''
  const allClasses = `${baseClasses} ${variantClass} ${sizeClass} ${errorClass} ${className}`

  const inputElement = isTextarea ? (
    <textarea
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      disabled={disabled}
      required={required}
      className={allClasses}
      {...rest}
    />
  ) : (
    <input
      type={isPassword ? (showPassword ? 'text' : 'password') : type}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      disabled={disabled}
      required={required}
      className={allClasses}
      {...rest}
    />
  )

  return (
    <div className="input-wrapper">
      {label && <label htmlFor={name}>{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon-left">{icon}</span>}
        {inputElement}
        {isPassword && (
          <span 
            className="input-icon-right input-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <PhEyeBold /> : <PhEyeClosedBold />}
          </span>
        )}
      </div>
      {helperText && <span className="input-helper">{helperText}</span>}
      {error && <span className="input-error-text">{error}</span>}
    </div>
  )
}

export function InputType({label,type,name,placeholder,onChange,value }){
      return(
            <Input label={label} type={type} name={name} placeholder={placeholder} onChange={onChange} value={value} />
      )
}

export function InpuTypePassword({label,name,placeholder,onChange }){
      return(
           <Input label={label} type="password" name={name} placeholder={placeholder} onChange={onChange} />
      )
}
      
