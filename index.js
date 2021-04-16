
// namespace
(function() {
  const load = () => {
    // Bind elements
    let input = document.getElementById("editorContent");
    let editor = document.getElementById("editorCover");
    let cellContainer = document.getElementById("cellsBar");
    let output = document.getElementById("output");
    let programmeInput = document.getElementById("input");

    let cells = [];
    let env = null;
    let inputBuffer = [];

    const callbacks = {
      input: () => inputBuffer.pop(),
      output: (x) => {
        output.textContent += x;
      }
    }

    const { highlight } = Highlighter();
    const { setCode, newEnv } = Fuckterpreter();

    const onInput = () => {
      rehighlight();
      
      try {
        setCode(input.value);
        env = null;
      } catch (e) {
        console.error(e);
      }
    }

    const rehighlight = () => {
      let out = highlight(input.value, {
        selectionStart: input.selectionStart, 
        selectionEnd: input.selectionEnd,
        highlight: env ? env.getPreviousTextPos() : null,
      });
      editor.innerHTML = out;
    };
  
    const syncScroll = () => {
      editor.scrollTop = input.scrollTop;

      if (editor.scrollTop !== input.scrollTop) {
        input.scrollTop = editor.scrollTop;
      }
    }

    const updateCells = () => {
      if (!env) return;
      const { getCells, getCurrentCell } = env;

      const values = getCells();
      const cur = getCurrentCell();

      for (let i = 0; i < cells.length; i++) {
        if (i === cur) {
          cells[i].classList.add("currentCell");
        } else {
          cells[i].classList.remove("currentCell");
        }

        cells[i].textContent = values[i];
      }
    }

    const envCheck = () => {
      if (!env || env.finished()) {
        resetInputBuffer();
        output.textContent = "";
        env = newEnv(callbacks);
      } 
    }

    const run = async () => {
      env = null;
      envCheck();
      const { finished } = env;
      while (!finished()) {
        step();
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    }

    const step = () => {
      envCheck();
      const { executeNext } = env;
      executeNext();
      updateCells();
      rehighlight();
    }

    const selectionChange = () => {
      if (document.getSelection().anchorNode !== input.parentNode) return;

      rehighlight();
    }

    const resetInputBuffer = () => {
      inputBuffer = (programmeInput.value + "\x00").split("").reverse();
    }

    const updateInputBuffer = () => {
      resetInputBuffer();

      if (input.selectionStart !== input.selectionEnd) return;
      env = null;
      envCheck();
      const { executeUntilTextPos } = env;
      executeUntilTextPos(input.selectionStart);
      updateCells();
    }
  
    // Bind events
    input.addEventListener("input", onInput);
    input.addEventListener("scroll", syncScroll);
    input.addEventListener("blur", rehighlight);
    document.addEventListener("selectionchange", selectionChange);
    document.getElementById("runCode").addEventListener("click", run);
    document.getElementById("stepForward").addEventListener("click", step);
    document.getElementById("input").addEventListener("input", updateInputBuffer);

    input.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        var start = input.selectionStart;
        var end = input.selectionEnd;  
        input.value = input.value.substring(0, start) + "\t" + input.value.substring(end);
        input.selectionStart = input.selectionEnd = start + 1;

        onInput();
      }
    });

    // Populate cells
    for (let i = 0; i < 20; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      const cellContent = document.createElement("div");
      cellContent.classList.add("cellContent");
      cellContent.textContent = "0";

      const cellIndex = document.createElement("div");
      cellIndex.classList.add("cellIndex");
      cellIndex.textContent = i;

      cell.appendChild(cellContent);
      cell.appendChild(cellIndex);
      cellContainer.appendChild(cell);

      cells.push(cellContent);
    }

    // Update from whatever is initially in the textarea
    onInput();
  }
  
  window.addEventListener("load", load);
})();