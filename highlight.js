
const highlight = (function(){
  const newline = /\n/g;
  const space = / /g;
  const tab = /\t/g;
  const brackets = /([\[\]])/g;
  const operators = /([\+-])/g;
  const iostreams = /([\.,])/g;
  const movement = /([<>])/g;
  const startSelect = /\xfe/g;
  const endSelect = /\xff/g;
  const caret = /\xfd/g;

  let caretHandle = null;

  function highlight(text, selectionStart, selectionEnd) {
    // We mark out the area that needs to have selection styling applied with unicode characters that are
    // pretty much never going to be input by the user (\xfd, \xfe etc.)
    if (selectionStart !== selectionEnd) {
      text = text.slice(0, selectionStart) + "\xfe" + text.slice(selectionStart, selectionEnd) + "\xff" + text.slice(selectionEnd);
    } else if (selectionStart !== null) {
      text = text.slice(0, selectionStart) + "\xfd" + text.slice(selectionStart);

      if (caretHandle) {
        clearInterval(caretHandle);
      }

      // cache reference to caret here
      let caret = null;
      caretHandle = setInterval(() => {
        if (!caret) {
          caret = document.getElementById('caret');
          if (!caret) {
            return;
          }
        };
        
        if (caret.classList.contains("hide")) {
          caret.classList.remove("hide");
        } else {
          caret.classList.add("hide");
        }
      }, 500);
    }

    return text
        .replace(space, "&nbsp;")
        .replace(tab, "&#09;")
        .replace(movement, "<span class='movement'>$1</span>")
        .replace(brackets, "<span class='bracket'>$1</span>")
        .replace(operators, "<span class='operator'>$1</span>")
        .replace(iostreams, "<span class='iostream'>$1</span>")
        .replace(newline, "<br>")
        .replace(startSelect, "<span class='selected'>")
        .replace(endSelect, "</span>")
        .replace(caret, "<span id='caret' class='caret'></span>");
  }

  return highlight;
})();
