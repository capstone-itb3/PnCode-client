export function handleKeyDownAssigned (event, runOutput, setLeftDisplay, setRightDisplay, setAddNewFile, setDeleteFile, room_files, displayFile) {
    if (event.altKey && event.key === 'r') {
      event.preventDefault();
      runOutput();
      return;
    }

    if (event.altKey && event.key === 'f') {
      event.preventDefault();
      setLeftDisplay('files');
      return;
    }

    if (event.altKey && event.key === 'n') {
      event.preventDefault();
      setLeftDisplay('notepad');
      return;
    }

    if (event.altKey && event.key === 'o') {
      event.preventDefault();
      setRightDisplay('output');
      return;
    }

    if (event.altKey && event.key === 'h') {
      event.preventDefault();
      setRightDisplay('history');
      return;
    }

    if (event.altKey && event.key === 'b') {
      event.preventDefault();
      setRightDisplay('feedback');
      return;
    }

    if (event.altKey && event.key === 'a') {
      event.preventDefault();
      setAddNewFile(true);
      setDeleteFile(false);
      setLeftDisplay('files');
      return;
    }

    if (event.altKey && event.key === 'x') {
      event.preventDefault();
      setDeleteFile(true);
      setAddNewFile(false);
      setLeftDisplay('files');
      return;
    }

    for (let i = 1; i <= room_files.length || i <= 10; i++) {
      if (event.altKey && event.key === i.toString()) {
        event.preventDefault();
        displayFile(room_files[i - 1]);
        break;
      }
    }
  };
