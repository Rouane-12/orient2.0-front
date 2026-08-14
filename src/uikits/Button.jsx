import React from 'react'
import { motion } from 'framer-motion'

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  danger: 'btn-danger',
  success: 'btn-success',
  ghost: 'btn-ghost',
}

const buttonSizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  type = 'button', 
  link, 
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  className = '',
  fullWidth = false,
  ...rest 
}) {
  const baseClasses = 'btn'
  const variantClass = buttonVariants[variant] || buttonVariants.primary
  const sizeClass = buttonSizes[size] || buttonSizes.md
  const fullWidthClass = fullWidth ? 'btn-full-width' : ''
  const allClasses = `${baseClasses} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`

  const content = (
    <>
      {loading && <span className="btn-spinner">⟳</span>}
      {icon && iconPosition === 'left' && <span className="btn-icon-left">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="btn-icon-right">{icon}</span>}
    </>
  )

  if (link) {
    return (
      <a href={link} className={allClasses} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <motion.button
      type={type}
      className={allClasses}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...rest}
    >
      {content}
    </motion.button>
  )
}

export function SimpleButton({ children, dtype, link, ...rest }) {
  return <Button variant={dtype} link={link} {...rest}>{children}</Button>
}

export function FormButton({ children, dtype, link, ...rest }) {
  return <Button variant={dtype} type="submit" link={link} {...rest}>{children}</Button>
}
