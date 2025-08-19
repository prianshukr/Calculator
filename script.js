const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const clearBtn = document.getElementById('clear');
const equalsBtn = document.getElementById('equals');
const decimalBtn = document.getElementById('decimal');
const backspaceBtn = document.getElementById('backspace');
const historyToggleBtn = document.getElementById('toggle-history');
const historyDiv = document.getElementById('history');

let currentInput = '0';
let resultCalculated = false;
let history = [];

// Update display with current input
function updateDisplay() {
  display.textContent = currentInput;
}

// Append number to input
function appendNumber(num) {
  if (resultCalculated) {
    currentInput = num;
    resultCalculated = false;
  } else if (currentInput === '0') {
    currentInput = num;
  } else {
    currentInput += num;
  }
}

// Append operator or parentheses
function appendOperator(op) {
  if (resultCalculated) {
    resultCalculated = false;
  }

  // Prevent multiple operators (except parentheses)
  if ('+-*/'.includes(op)) {
    if (/[+\-*/]$/.test(currentInput)) {
      currentInput = currentInput.slice(0, -1) + op;
      return;
    }
  }

  currentInput += op;
}

// Append decimal, only one per number segment
function appendDecimal() {
  if (resultCalculated) {
    currentInput = '0.';
    resultCalculated = false;
    return;
  }

  const parts = currentInput.split(/[\+\-\*\/\(\)]/);
  const lastPart = parts[parts.length - 1];
  if (!lastPart.includes('.')) {
    currentInput += '.';
  }
}

// Clear input
function clearInput() {
  currentInput = '0';
  resultCalculated = false;
}

// Backspace: remove last character
function backspace() {
  if (resultCalculated) {
    clearInput();
    return;
  }

  if (currentInput.length === 1) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
  }
}

// Calculate expression safely with parentheses and operators
function calculate() {
  try {
    // Replace multiplication/division symbols for eval
    let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');

    // Check for balanced parentheses
    if (!areParenthesesBalanced(expression)) {
      currentInput = 'Error: Unbalanced parentheses';
      resultCalculated = true;
      return;
    }

    // Evaluate expression safely
    let evalResult = Function(`"use strict"; return (${expression})`)();

    if (evalResult === Infinity || evalResult === -Infinity || isNaN(evalResult)) {
      currentInput = 'Error';
    } else {
      currentInput = evalResult.toString();
      addToHistory(expression, currentInput);
    }
    resultCalculated = true;
  } catch {
    currentInput = 'Error';
    resultCalculated = true;
  }
}

// Check if parentheses are balanced
function areParenthesesBalanced(expr) {
  let stack = [];
  for (let char of expr) {
    if (char === '(') stack.push(char);
    else if (char === ')') {
      if (stack.length === 0) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}

// Add calculation to history
function addToHistory(expression, result) {
  history.unshift({ expression, result });
  if (history.length > 20) history.pop();
  renderHistory();
}

// Render history in the panel
function renderHistory() {
  historyDiv.innerHTML = '';
  history.forEach(({ expression, result }, index) => {
    const div = document.createElement('div');
    div.classList.add('history-item');
    div.textContent = `${expression} = ${result}`;
    div.title = "Click to reuse";
    div.addEventListener('click', () => {
      currentInput = result;
      updateDisplay();
      historyDiv.classList.add('hidden');
      historyToggleBtn.textContent = 'Show History';
      resultCalculated = true;
    });
    historyDiv.appendChild(div);
  });
}

// Toggle history panel visibility
historyToggleBtn.addEventListener('click', () => {
  historyDiv.classList.toggle('hidden');
  if (historyDiv.classList.contains('hidden')) {
    historyToggleBtn.textContent = 'Show History';
  } else {
    historyToggleBtn.textContent = 'Hide History';
  }
});

// Button click events
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.classList.contains('number')) {
      appendNumber(button.getAttribute('data-num'));
    } else if (button.classList.contains('operator')) {
      appendOperator(button.getAttribute('data-op'));
    } else if (button.classList.contains('clear')) {
      clearInput();
    } else if (button.classList.contains('decimal')) {
      appendDecimal();
    } else if (button.classList.contains('equals')) {
      calculate();
    } else if (button.classList.contains('backspace')) {
      backspace();
    }
    updateDisplay();
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    appendNumber(e.key);
  } else if (['+', '-', '*', '/'].includes(e.key)) {
    appendOperator(e.key);
  } else if (e.key === '(' || e.key === ')') {
    appendOperator(e.key);
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculate();
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    backspace();
  } else if (e.key === '.') {
    appendDecimal();
  } else if (e.key.toLowerCase() === 'c') {
    clearInput();
  }
  updateDisplay();
});

updateDisplay();
// Dark/Light Mode Toggle
const toggleThemeBtn = document.getElementById('toggle-theme');

function applyTheme(mode) {
  if (mode === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  localStorage.setItem('theme', mode);
  toggleThemeBtn.textContent = `Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`;
}

// Load saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

// Handle button click
toggleThemeBtn.addEventListener('click', () => {
  const currentMode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  applyTheme(newMode);
});
