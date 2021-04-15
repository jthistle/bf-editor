
const Fuckterpreter = (initCode) => {
  const CELL_MAX_VAL = 255;
  const DATA_ARRAY_SIZE = 30000;
  
  const ACTION_TOKENS = ["+", "-", ">", "<", ",", "."];
  let code;
  let ast;
  
  // Parse code
  const parse = (code) => {
    const ast = [];
    for (let char of code) { 
      if (ACTION_TOKENS.includes(char)) {
        ast.push({
          tk: char,
        })
      } else if (char === "[" || char === "]") {
        ast.push({
          tk: char,
          jmp: -1,
        })
      }
    }

    const loop_stack = [];
    for (let i = 0; i < ast.length; i++) {
      let node = ast[i];
      if (node.tk === "[") {
        loop_stack.push(i);
      } else if (node.tk === "]") {
        if (loop_stack.length === 0) {
          throw Error("Too many ]");
        }

        node.jmp = loop_stack.pop();
        ast[node.jmp].jmp = i;
      }
    }

    if (loop_stack.length > 0) {
      throw Error("Unclosed ]");
    }

    return ast;
  }

  const execute = (ast, inputCallback, outputCallback) => {
    const data = Array(DATA_ARRAY_SIZE).fill(0);
    let data_pointer = 0;
    let instruction_pointer = 0;
    const ast_size = ast.length;
    let node;

    while (1) {
      node = ast[instruction_pointer];
      switch (node.tk) {
        case "+":
          data[data_pointer] += 1;
          if (data[data_pointer] > CELL_MAX_VAL) {
            data[data_pointer] = 0;
          }
          break;
        case "-":
          data[data_pointer] -= 1;
          if (data[data_pointer] < 0) {
            data[data_pointer] = CELL_MAX_VAL;
          }
          break;
        case ">":
          data_pointer += 1;
          if (data_pointer > DATA_ARRAY_SIZE) {
            throw Error("Data pointer out of bounds - too far right");
          }
          break;
        case "<":
          data_pointer -= 1;
          if (data_pointer < 0) {
            throw Error("Data pointer out of bounds - too far left");
          }
          break;
        case ".":
          outputCallback(String.fromCharCode(data[data_pointer]));
          break;
        case ",":
          data[data_pointer] = inputCallback().charCodeAt(0);
          break;
        case "[":
          if (data[data_pointer] === 0) {
            instruction_pointer = node.jmp;
          }
          break;
        case "]":
          if (data[data_pointer] !== 0) {
            instruction_pointer = node.jmp;
          }
          break;
      }
      instruction_pointer += 1;

      if (instruction_pointer >= ast_size) {
        // End of programme
        break;
      }
    }
  }

  const setCode = (newCode) => {
    code = newCode;
    ast = parse(code);
  }

  if (initCode) {
    setCode(initCode);
  }

  return {
    setCode,
    execute: (inputCallback, outputCallback) => {
      execute(ast, inputCallback, outputCallback);
    },
  }
}
