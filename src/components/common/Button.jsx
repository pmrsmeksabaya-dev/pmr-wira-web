import React from 'react'

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-outline'
  const finalClass = baseClass + ' ' + className
  
  return (
    React.createElement('button', { className: finalClass, ...props }, children)
  )
}

export default Button
