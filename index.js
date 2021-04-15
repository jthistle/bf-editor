
// namespace
(function() {
  function load() {
    let input = document.getElementById("editorContent");
    let editor = document.getElementById("editorCover");

    let { highlight } = Highlighter();

    let { setCode, execute } = Fuckterpreter();

    const onInput = () => {
      onUpdate();
      
      try {
        setCode(input.value);
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
    }

    input.addEventListener("input", onInput);
    input.addEventListener("scroll", syncScroll);
    input.addEventListener("blur", onUpdate);
    document.addEventListener("selectionchange", onUpdate);

    document.getElementById("runCode").addEventListener("click", () => {
      output.textContent = "";

      try {
        execute(
          () => "a",
          (x) => {
            output.textContent += x;
          }
        )
      } catch (e) {
        console.error(e);
      }
    });
  }
  
  window.addEventListener("load", load);
})();