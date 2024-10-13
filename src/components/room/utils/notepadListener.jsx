export default function notepadListener (event, updateNotes) {
    const isEditingKey = event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || event.key === 'Enter';
    
    try {  
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            updateNotes();

            return;
        }

        if (event.key.length === 1 || isEditingKey) {
            updateNotes();
        }
    } catch (e) {
      console.error(e);
    }
  };    
