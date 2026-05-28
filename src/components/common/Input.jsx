import React from 'react'

const Input = ({ label, name, type = 'text', required = false, className = '', ...props }) => {
  const inputClass = 'w-full ' + className
  
  return (
    React.createElement('div', { className: 'w-full' },
      label && React.createElement('label', {
        htmlFor: name,
        className: 'block text-gray-300 mb-2 text-sm font-medium'
      }, label, required && React.createElement('span', { className: 'text-red-500' }, ' *')),
      React.createElement('input', {
        id: name,
        name: name,
        type: type,
        required: required,
        className: inputClass,
        ...props
      })
    )
  )
}

export default Input
