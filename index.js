
// namespace
(function() {
  let editor;

  function load() {
    input = document.getElementById("editorContent");
    editor = document.getElementById("editorCover");

    const rehighlight = () => {
      let out = highlight(input.value, input.selectionStart, input.selectionEnd);
      editor.innerHTML = out;
    };

    input.addEventListener("input", rehighlight);

    document.addEventListener("selectionchange", rehighlight);
  }
  
  window.addEventListener("load", load);
})();