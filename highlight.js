
const Highlighter = () => {
  const replacements = [
    / /g, "&nbsp;",
    /\t/g, "&#09;",
    /([<>])/g, "<span class='movement'>$1</span>",
    /([\[\]])/g, "<span class='bracket'>$1</span>",
    /([\+-])/g, "<span class='operator'>$1</span>",
    /([\.,])/g, "<span class='iostream'>$1</span>",
    /\n/g, "<br>",
    /\xfe/g, "<span class='selected'>",
    /\xff/g, "</span>",
    /\xfd/g, "<span id='caret' class='caret'></span>",
  ];

  let caretHandle = null;

  const insertAnchors = (text, selectionStart, selectionEnd) => {
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

    return text;
  }

  const highlight = (text, selectionStart, selectionEnd) => {
    text = insertAnchors(text, selectionStart, selectionEnd);

    for (let i = 0; i < replacements.length; i += 2) {
      text = text.replace(replacements[i], replacements[i + 1]);
    }

    return text;
  }

  return {
    highlight,
  };
};
