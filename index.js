
// namespace
(function() {
  let inputBuffer;
  let input, editor, cellContainer, output, env;
  let cells = [];

  const load = () => {
    // Bind elements
    input = document.getElementById("editorContent");
    editor = document.getElementById("editorCover");
    cellContainer = document.getElementById("cellsBar");
    output = document.getElementById("output");

    const callbacks = {
      input: () => inputBuffer.pop(),
      output: (x) => {
        output.textContent += x;
      }
    }

    const { highlight } = Highlighter();
    const { setCode, newEnv } = Fuckterpreter();

    const onInput = () => {
      onUpdate();
      
      try {
        setCode(input.value);
        env = null;
      } catch (e) {
        console.error(e);
      }
    }

    const onUpdate = () => {
      let out = highlight(input.value, input.selectionStart, input.selectionEnd);
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
        inputBuffer = "hello world".split("").reverse();
        output.textContent = "";
        env = newEnv(callbacks);
      } 
    }

    const run = () => {
      env = null;
      envCheck();
      const { executeAll } = env;
      executeAll();
      updateCells();
    }

    const step = () => {
      envCheck();
      const { executeNext } = env;
      executeNext();
      updateCells();
    }

    const selectionChange = () => {
      onUpdate();
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
    input.addEventListener("blur", onUpdate);
    document.addEventListener("selectionchange", selectionChange);
    document.getElementById("runCode").addEventListener("click", run);
    document.getElementById("stepForward").addEventListener("click", step);

    // Populate cells
    for (let i = 0; i < 10; i++) {
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
  }
  
  window.addEventListener("load", load);
})();