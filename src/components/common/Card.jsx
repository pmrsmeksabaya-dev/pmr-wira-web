import React from 'react'

const Card = ({ children, className = '' }) => {
  const finalClass = 'card-dark rounded-2xl p-6 ' + className
  
  return (
    React.createElement('div', { className: finalClass }, children)
  )
}

export default Card
