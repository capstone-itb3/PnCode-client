export function nonEditingKey(e) {
    const isModifierKey = e.altKey || e.ctrlKey || e.metaKey;
    const isNavigationKey = e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End' || e.key === 'PageUp' || e.key === 'PageDown';
    const isFunctionKey = e.key.startsWith('F') && e.key.length > 1;
    
    return isModifierKey || isNavigationKey || isFunctionKey;
}

export function editingKey(e) {
    return e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || e.key === 'Enter';
}

export function unknownKey(e) {
    return String(e.key) === 'Unidentified';
}
  