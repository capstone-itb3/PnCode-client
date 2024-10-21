export default function updateFeedbackReacts(setFeedback, feedback_id, react) {
    setFeedback(prev => {
        const new_feedback_list = [...prev];
        const feed = new_feedback_list.find(f => f.feedback_id === feedback_id);
  
        if (feed) {        
            feed.reacts.push(react);
        }
        return new_feedback_list;
    });
}