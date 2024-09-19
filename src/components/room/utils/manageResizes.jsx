export default function manageResizes(leftDisplay = '', rightDisplay = '') {
    const center = document.getElementById('center-body');
    if (leftDisplay === '' && center) {
      center.style.width = '100%';
      
    } else if (leftDisplay !== '' && center) {
      center.style.width = 'calc(100% - 227px)';
    }
    
    const editor_cont = document.getElementById('editor-container');
    if (rightDisplay === '' && editor_cont) {
      editor_cont.style.width = '100%';

    } else if (rightDisplay !== '' && editor_cont) {
      editor_cont.style.width = '55%';
    }
}