
const Highlighter = () => {
  const replacements = [
    /([<>])/g, "<span class='movement'>$1</span>",
    /([\[\]])/g, "<span class='bracket'>$1</span>",
    /([\+-])/g, "<span class='operator'>$1</span>",
    /([\.,])/g, "<span class='iostream'>$1</span>",
    /\xfc(<span.+?span>|.)/g, "<span class='highlighted'>$1</span>",
    /\xfe/g, "<span class='selected'>",
    /\xff/g, "</span>",
    /\n\xfd\n/g, "\n<span class='caretContainer'><span id='caret' class='caret'></span></span> \n",
    /\xfd/g, "<span class='caretContainer'><span id='caret' class='caret'></span></span>",
  ];

  let caretHandle = null;

  const insertIntoText = (text, items) => {
    items = items.sort((a, b) => a[1] - b[1]);
    
    let last = 0;
    let acc = "";
    for (let i = 0; i < items.length; i++) {
      acc += text.slice(last, items[i][1]) + items[i][0];
      last = items[i][1];
    }
    acc += text.slice(last)
    return acc;
  }

  const insertAnchors = (text, { selectionStart, selectionEnd, highlight }) => {
    let replacements = [];

    if (highlight) {
      replacements.push(["\xfc", highlight]);
    }

    // We mark out the area that needs to have selection styling applied with unicode characters that are
    // pretty much never going to be input by the user (\xfd, \xfe etc.)
    if (selectionStart !== selectionEnd) {
      replacements.push(["\xfe", selectionStart]);
      replacements.push(["\xff", selectionEnd]);
    } else if (selectionStart !== null) {
      replacements.push(["\xfd", selectionStart]);

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

    return insertIntoText(text, replacements);
  }

  const highlight = (text, hooks) => {
    text = text + " \n\n\n";
    text = insertAnchors(text, hooks);

    for (let i = 0; i < replacements.length; i += 2) {
      text = text.replace(replacements[i], replacements[i + 1]);
    }

    return text;
  }

  return {
    highlight,
  };
};
