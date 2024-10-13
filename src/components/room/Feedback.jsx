import React, { useState, useEffect }  from 'react'
import { BsTrash } from 'react-icons/bs';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import converToReadable from './utils/convertToReadable';

function Feedback({ room, user, socket, rightDisplay, setRightDisplay }) {
  const [feedback, setFeedback] = useState([]);
  const [new_feedback, setNewFeedback] = useState('');

  useEffect(() => {  
    function getFeedback() {
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

    socket.on('submit_feedback_result', ({ status, action }) => {
      getFeedback();

      if (status === 'ok' && action === 'add') {
        setRightDisplay('feedback');
      }
    });

    return () => {
      socket.off('feedback_loaded');
      socket.off('submit_feedback_result');
    }
  }, []);

  function submitFeedback(e) {
    e.preventDefault();

    room.submitFeedback(socket, new_feedback, user.uid);
    setNewFeedback('');
  }

  function reactToFeedback(feed) {
    if (user.position === 'Student') {
      if (!feed.reacts.some((u) => u.uid === user.uid)) {
        room.reactToFeedback(socket, feed.createdAt, user.uid);
      }
    }
  }

  function deleteFeedback(createdAt) {
    const result = confirm('Are you sure you want to delete this feedback?');
    if (result) {
      room.deleteFeedback(socket, createdAt);
    }
  }

  return (
    <div id='feedback-div' className={`${rightDisplay !== 'feedback' && 'inactive'}`}>
      <div id='feedback-container' className='flex-column'>
        <h3>Feedback</h3>
        {user.position === 'Professor' &&
          <form className='flex-column' id='feedback-form' onSubmit={(e) => submitFeedback(e)}>
            <label className='name'>{user.first_name} {user.last_name}</label>
            <div className='flex-row'>
              <textarea
                value={new_feedback} 
                placeholder='Enter feedback here...' 
                onChange={e => setNewFeedback(e.target.value)}
                required/>
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
          const reacted = feed.reacts?.some((u) => u.uid === user.uid);

          return (
            <div className='feedback-item flex-column' key={index}>
              <label className='name'>
                {feed.first_name} {feed.last_name}
                {index === 0 && <span>•<span>New</span></span>}
              </label>
              <label className='date'>{date}</label>
              <label className='feedback-body'>{feed.feedback_body}</label>
              {user.position === 'Professor' &&
                <button className='delete' onClick={() => deleteFeedback(feed.createdAt)}>
                  <BsTrash size={20} />
                </button>
              }
              <div className='flex-row items-center react-div'> 
                <div className='count'>
                  {feed.reacts.length} 
                  {feed.reacts.length > 0 &&
                    <div className='reacted-list flex-column'>
                      {feed.reacts.map((u, index) => (
                        <label key={index} className='reacted-user'>
                          {u.first_name} {u.last_name}
                        </label>
                      ))}
                    </div>
                  }
                </div>
                <button className='react items-center' onClick={() => reactToFeedback(feed)}>
                  {user.position === 'Student' && reacted && 
                    <FaHeart size={18} color={'#dc3545'} />
                  }
                  {user.position === 'Student' && !reacted &&
                    <FaRegHeart size={18} color={'var(--gray-dark)'}/>
                  }
                  {user.position === 'Professor' && 
                    <FaHeart size={18} color={'#dc3545'}/>
                  }
                </button>
              </div>
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