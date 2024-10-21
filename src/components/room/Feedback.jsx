import React, { useState, useEffect }  from 'react'
import { BsTrash } from 'react-icons/bs';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import converToReadable from './utils/convertToReadable';
import updateFeedbackReacts from './utils/updateFeedbackReacts';
import { showConfirmPopup } from '../reactPopupService';

function Feedback({ room, user, socket, socketId, rightDisplay, setRightDisplay }) {
  const [feedback, setFeedback] = useState([]);
  const [new_feedback, setNewFeedback] = useState('');

  useEffect(() => {  
    try {
      function getFeedback() {
        socket.emit('load_feedback', {
            room_id: room.room_id,
        });
      }
      getFeedback();

      socket.on('feedback_loaded', ({ feedback }) => {
        setFeedback(feedback);

        if (feedback.length > 0) {
          setRightDisplay('feedback');
        }
      });

      socket.on('submit_feedback_result', ({ new_feedback }) => {
        setFeedback((prev) => {
          const new_feedback_list = [...prev, new_feedback];
          return new_feedback_list.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        });
        
        console.log('new_feedback_list', new_feedback);
        setRightDisplay('feedback');
      });

      socket.on('delete_feedback_result', ({ feedback_id }) => {
        setFeedback(prev => prev.filter(item => item.feedback_id !== feedback_id));
      });

      socket.on('new_feedback_react', ({ feedback_id, react, socket_id }) => {
        console.log(socket_id);
        console.log(socketId);

        if (socket_id !== socketId) {
          updateFeedbackReacts(setFeedback, feedback_id, react);
        }
      });
    } catch (e) {
      alert('An error occured while rendering feedback.');
      console.error(e);
    }

    return () => {
      socket.off('feedback_loaded');
      socket.off('submit_feedback_result');
      socket.off('delete_feedback_result');
      socket.off('new_feedback_react');
    }
  }, [room, socketId]);

  useEffect(() => {
    console.log(socketId);

  }, [socketId])

  function submitFeedback(e) {
    e.preventDefault();
    if (user.position === 'Professor') {
      room.submitFeedback(socket, new_feedback, user.uid, user.first_name, user.last_name);
    }
    setNewFeedback('');
  }

  function reactToFeedback(feed) {
    console.log(feed.feedback_id);
    if (user.position === 'Student') {
      if (!feed.reacts.some((u) => u.uid === user.uid)) {
        const react = {
          uid: user.uid,
          first_name: user.first_name,
          last_name: user.last_name,
        };
  
        room.reactToFeedback(socket, feed.feedback_id, react);


        updateFeedbackReacts(setFeedback, feed.feedback_id, react);
      }
    }
  }
  
  async function deleteFeedback(feedback_id) {
    const result = await showConfirmPopup({
      title: 'Delete Feedback',
      message: 'Do you want to delete your feedback?',
      confirm_text: 'Delete',
      cancel_text: 'Cancel',
    });

    if (result) {
      room.deleteFeedback(socket, feedback_id);
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
                <button className='delete' onClick={() => deleteFeedback(feed.feedback_id)}>
                  <BsTrash size={20} />
                </button>
              }
              <div className='flex-row items-center react-div'> 
                <div className='count'>
                  {feed.reacts.length > 0 && feed.reacts.length} 
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