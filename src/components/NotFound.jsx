import React from 'react'
import Cookies from 'js-cookie'

function NotFound() {
  return (
    <div>
        <h1>404 Not Found</h1>
        <label>The page you're looking for does not exist.</label>
        <br/>
        <br/>
        {Cookies.get('token')
            ? <a href='/dashboard'>Back To Dashboard</a>
            : <a href='/login'>Back To Login</a>
        }
    </div>
  )
}

export default NotFound