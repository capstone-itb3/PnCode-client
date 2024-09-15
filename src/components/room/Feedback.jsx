import React from 'react'

function Feedback({ rightDisplay }) {
  return (
    <div id='feedback-div' className={`${rightDisplay !== 'feedback' && 'inactive'}`}>
      Feedback
    </div>
  )
}

export default Feedback