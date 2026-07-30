import React from 'react'

export function SimpleButton({ children, dtype, link, ...rest }) {
  if (link)
    return <a href={link}
      className={'btn btn-' + dtype}
      {...rest} >    
      
    {children}</a>
  return (
      <button type="button" className={'btn btn-' + dtype}
      {...rest} >{children}</button>
  )
}


export function FormButton({ children, dtype, link, ...rest }) {
  return (
      <button type='submit' className={'btn btn-' + dtype}
      {...rest} >{children}</button>
  )
}
