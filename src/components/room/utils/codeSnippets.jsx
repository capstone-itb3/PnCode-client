
import { snippetCompletion } from '@codemirror/autocomplete'
// import { html5Snippet, jquerySnippet, bootstrapLinkSnippet, bootstrapScriptSnippet } from './utils/codeSnippets';

const html5Snippet = snippetCompletion('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title></title>\n</head>\n<body>\n</body>\n</html>', {
    label: 'html:5',
    detail: 'HTML5 boilerplate'
});

const linkTagSnippet = snippetCompletion('<link rel="stylesheet" href="style.css">', {
    label: 'link stylesheet',
    detail: 'stylesheet boilerplate'
});

// const jquerySnippet = snippetCompletion('<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>', {
//     label: 'jQuery',
//     detail: 'Script tag for JQuery'        
// });

// const bootstrapLinkSnippet = snippetCompletion('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">', {
//     label: 'Bootstrap',
//     detail: 'Link tag for Bootstrap'
// });

// const bootstrapScriptSnippet = snippetCompletion('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>', {
//     label: 'Bootstrap',
//     detail: 'Script tag for Bootstrap'
// });

export {    
            html5Snippet,
            linkTagSnippet,
            // jquerySnippet, 
            // bootstrapLinkSnippet, 
            // bootstrapScriptSnippet 
        };