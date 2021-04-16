
function ParseError (msg) {
  return {
    type: "ParseError",
    message: msg,
  }
}

function RuntimeError (msg) {
  return {
    type: "RuntimeError",
    message: msg,
  }
}


const Fuckterpreter = (initCode) => {
  const CELL_MAX_VAL = 255;
  const DATA_ARRAY_SIZE = 30000;
  
  const ALLOWED_TOKENS = ["+", "-", ">", "<", ",", ".", "[", "]"];
  let code;
  let ast;
  
  // Parse code
  const parse = (code) => {
    const ast = [];
    for (let i = 0; i < code.length; i++) {
      let char = code[i]; 
      if (ALLOWED_TOKENS.includes(char)) {
        ast.push({
          tk: char,
          textPos: i,
        })
      }
    }

    // Work out which loops jump to where to prevent having to walk entire
    // ast during execution.
    const loop_stack = [];
    for (let i = 0; i < ast.length; i++) {
      let node = ast[i];
      if (node.tk === "[") {
        loop_stack.push(i);
      } else if (node.tk === "]") {
        if (loop_stack.length === 0) {
          throw ParseError("Unmatched ]");
        }

        node.jmp = loop_stack.pop();
        ast[node.jmp].jmp = i;
      }
    }

    if (loop_stack.length > 0) {
      throw ParseError("Unmatched ]");
    }

    return ast;
  }

  // Creates a new execution environment and returns API functions to 
  // access it.
  const newEnv = (ast, callbacks) => {
    if (!ast) return null;

    const { input, output } = callbacks;
    const data = Array(DATA_ARRAY_SIZE).fill(0);
    let data_pointer = 0;
    let instruction_pointer = 0;
    const ast_size = ast.length;

    // Carry out the next instruction. Returns true if more instructions
    // can be executed, otherwise returns false.
    const next = () => {
      if (instruction_pointer >= ast_size) {
        // End of programme
        return false;
      }

      let node = ast[instruction_pointer];
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
            throw RuntimeError("Data pointer out of bounds - too far right");
          }
          break;
        case "<":
          data_pointer -= 1;
          if (data_pointer < 0) {
            throw RuntimeError("Data pointer out of bounds - too far left");
          }
          break;
        case ".":
          output(String.fromCharCode(data[data_pointer]));
          break;
        case ",":
          let char = input();
          if (char !== undefined && char !== null && char.length === 1) {
            data[data_pointer] = char.charCodeAt(0);
          } else {
            // No more input! End programme
            console.warn("Ran out of input to read from, ending execution");
            instruction_pointer = ast.length + 1;
            return false;
          }
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
        case "s":
          // s is an optimizer token that sets a cell to a value
          data[data_pointer] = node.value;
          break;
      }
      instruction_pointer += 1;

      return true;
    }
    
    const all = () => {
      while (next()) {}
    }

    const untilTextPos = (pos) => {
      while (instruction_pointer < ast.length && ast[instruction_pointer].textPos < pos && next()) {}
    }

    return {
      executeAll: all,
      executeNext: next,
      executeUntilTextPos: untilTextPos,
      getCells: () => data,
      getCurrentCell: () => data_pointer,
      getCurrentTextPos: () => ast[instruction_pointer].textPos,
      getPreviousTextPos: () => instruction_pointer > 0 ? ast[instruction_pointer - 1].textPos : 0,
      finished: () => instruction_pointer >= ast.length,
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
    newEnv: (callbacks) => newEnv(ast, callbacks),
  }
}
