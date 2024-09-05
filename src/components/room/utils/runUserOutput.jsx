import React, { useREf } from 'react'

export default function runUserOutput (files, active, output) {
  output.contentWindow.eval("window.location.reload();");
  let newStyle = '', cssFiles, jsFiles;

  setTimeout(() => {
    if (active.type === 'html' || active.type === 'css') {
      cssFiles = files.filter(f => f.type === 'css');
      jsFiles = files.filter(f => f.type === 'js');
  
      output.contentDocument.body.innerHTML = active.content;
      
      const links = output.contentDocument.querySelectorAll('link[rel="stylesheet"]');
      links.forEach((link) => {
        if (link.href) {
          const linkUrl = new URL(link.href).pathname.split('/').pop();
          const css = cssFiles.find(f => f.name === linkUrl);
  
          if (css) {
            newStyle +=`<style>${css.content}</style>`;
          }
        }
      });
      output.contentDocument.body.innerHTML = newStyle + output.contentDocument.body.innerHTML;
  
      const scripts = output.contentDocument.querySelectorAll('script');
      scripts.forEach((script) => {
        if (script.src) {
          const scriptUrl = new URL(script.src).pathname.split('/').pop();
          const js = jsFiles.find(f => f.name === scriptUrl);
  
          if (js) {
            output.contentWindow.eval(js.content);
          }
        } else if (script.src === '') {
          output.contentWindow.eval(script.textContent);
        }
      });
    } else if (active.type === 'js') {
      output.contentDocument.body.innerHTML = '';
      output.contentWindow.eval(active.content);
    }
  }, 100);  
}