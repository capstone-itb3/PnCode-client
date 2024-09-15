import React, { useState, useEffect }  from 'react'
import converToReadable from './utils/convertToReadable';

function Feedback({ room, user, socket, rightDisplay, setRightDisplay }) {
  const [feedback, setFeedback] = useState(null);
  const [new_feedback, setNewFeedback] = useState('');
  const [feedback_range, setFeedbackRange] = useState('This room');

  useEffect(() => {  
    function getFeedback() {
      setFeedback(null)

      socket.emit('load_feedback', {
        room_id: room.room_id,
      });
    }
    getFeedback();

    socket.on('feedback_loaded', ({ feedback }) => {
      setFeedback(feedback);

      if (feedback.length !== 0) {
        setRightDisplay('feedback');
      }
    });

    socket.on('submit_feedback_result', ({ feedback }) => {
      getFeedback();
      setRightDisplay('feedback');
    });

    return () => {
      socket.off('feedback_loaded');
      socket.off('submit_feedback_result');
    }
  }, []);

  function submitFeedback(e) {
    e.preventDefault();

    room.submitFeedback(socket, room.room_id, new_feedback, feedback_range, user.uid);
    setNewFeedback('');
  }

  return (
    <div id='feedback-div' className={`${rightDisplay !== 'feedback' && 'inactive'}`}>
      <div id='feedback-container' className='flex-column'>
        <h3>Feedback</h3>
        {user.position === 'Professor' &&
          <form className='flex-column' id='feedback-form' onSubmit={(e) => submitFeedback(e)}>
            <label className='name'>{user.last_name}, {user.first_name}</label>
            <div className='flex-row'>
              <textarea
                value={new_feedback} 
                placeholder='Enter feedback here...' 
                onChange={e => setNewFeedback(e.target.value)}
                required/>
              <div className='items-center'>
                <select value={feedback_range} className='items-start' onChange={e => setFeedbackRange(e.target.value)}>
                  <option value='This room'>This room</option>
                  <option value='All rooms'>All rooms</option>
                </select>
              </div>  
            </div>
            <div>
              <input type='submit' value='Add Feedback'/>
            </div>
         </form>
        }
        {!feedback &&
            <div className='loading-line'>
              <div></div>
            </div>
        }
        {feedback && feedback.length > 0 && feedback.map((feed, index) => {
          const date = converToReadable(new Date(feed.createdAt), 'short');

          return (
            <div className='feedback-item flex-column' key={index}>
              <label className='name'>
                {feed.last_name}, {feed.first_name} 
                {index === 0 && <span>•<span>New</span></span>}
              </label>
              <label className='date'>{date}</label>
              <label className='feedback-body'>{feed.feedback_body}</label>
            </div>
          )
        })}
        {feedback && feedback.length === 0 && user.position === 'Student' &&
          <label className='length-0'>Feedback by your professor will appear here.</label>
        }
        {feedback && feedback.length === 0 && user.position === 'Professor' &&
          <label className='length-0'>Your feedback will be seen by your students here.</label>
        }
      </div>
    </div>
  )
}

export default Feedback