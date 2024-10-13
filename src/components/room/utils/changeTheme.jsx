import { oneDark } from "@codemirror/theme-one-dark";
import { clouds } from "thememirror";

export default function changeTheme (editorRef, editorTheme, themeCompartmentRef) {
    if (editorRef.current) {
        const theme = editorTheme === 'dark' ? oneDark : clouds;
        editorRef.current.dispatch({
          effects: themeCompartmentRef.current.reconfigure([theme])
        });
    }  
}