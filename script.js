const display = document.getElementById("display");
const message = document.getElementById("message");

const historyBox = document.getElementById("history");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

let expression = "";
let calculationHistory = [];


/* =========================
   DISPLAY
   ========================= */

function updateDisplay() {
  display.value = expression || "0";

  const length = display.value.length;

  if (length <= 10) {
    display.style.fontSize = "2rem";
  } else if (length <= 13) {
    display.style.fontSize = "1.7rem";
  } else if (length <= 16) {
    display.style.fontSize = "1.4rem";
  } else if (length <= 20) {
    display.style.fontSize = "1.15rem";
  } else {
    display.style.fontSize = "0.95rem";
  }
}


/* =========================
   ADD VALUE
   ========================= */

function appendValue(value) {
  message.textContent = "";

  // Prevent multiple decimal points in one number
  if (value === ".") {
    const parts = expression.split(/[+\-*/]/);
    const currentNumber = parts[parts.length - 1];

    if (currentNumber.includes(".")) {
      return;
    }
  }

  // Prevent two operators together
  if ("+-*/".includes(value)) {
    if (!expression) {
      return;
    }

    const lastCharacter = expression.slice(-1);

    if ("+-*/".includes(lastCharacter)) {
      expression = expression.slice(0, -1);
    }
  }

  if (expression === "0" && value !== ".") {
    expression = "";
  }

  expression += value;

  updateDisplay();
}


/* =========================
   CLEAR CALCULATOR
   ========================= */

function clearCalculator() {
  expression = "";
  message.textContent = "";

  updateDisplay();
}


/* =========================
   BACKSPACE
   ========================= */

function backspace() {
  expression = expression.slice(0, -1);

  message.textContent = "";

  updateDisplay();
}


/* =========================
   CALCULATE
   ========================= */

function calculate() {
  if (!expression) {
    return;
  }

  const originalExpression = expression;

  try {

    // Allow only calculator characters
    if (/[^0-9+\-*/%.() ]/.test(expression)) {
      throw new Error("Invalid input");
    }

    // Expression cannot end with an operator
    if (/[+\-*/.]$/.test(expression)) {
      throw new Error("Incomplete expression");
    }

    // Convert percentage into decimal
    const normalized = expression.replace(
      /(\d+(?:\.\d+)?)%/g,
      "($1/100)"
    );

    /*
      Calculate expression.
      The input has already been restricted
      to calculator characters only.
    */
    const result = Function(
      `"use strict"; return (${normalized})`
    )();

    // Division by zero / invalid result
    if (!Number.isFinite(result)) {
      throw new Error("Cannot divide by zero");
    }

    // Round floating-point results
    const finalResult = Number(result.toFixed(10));

    expression = String(finalResult);

    updateDisplay();

    // Add calculation to history
    calculationHistory.unshift(
      `${originalExpression} = ${finalResult}`
    );

    updateHistory();

  } catch (error) {

    message.textContent =
      "Invalid calculation or division by zero.";

    expression = "";

    updateDisplay();
  }
}


/* =========================
   HISTORY
   ========================= */

function toggleHistory() {
  historyBox.classList.toggle("show");
}


/* Display History */
function updateHistory() {

  historyList.innerHTML = "";

  if (calculationHistory.length === 0) {

    historyList.innerHTML =
      "<p>No calculations yet.</p>";

    return;
  }

  calculationHistory.forEach(item => {

    const historyItem =
      document.createElement("div");

    historyItem.className = "history-item";

    historyItem.textContent = item;

    historyList.appendChild(historyItem);
  });
}


/* Clear History */
clearHistoryButton.addEventListener("click", () => {

  calculationHistory = [];

  updateHistory();
});


/* =========================
   BUTTON EVENTS
   ========================= */

document.querySelectorAll(".keys button, .history-btn").forEach(button => {

  button.addEventListener("click", () => {

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
      appendValue(value);
    }

    if (action === "clear") {
      clearCalculator();
    }

    if (action === "backspace") {
      backspace();
    }

    if (action === "calculate") {
      calculate();
    }

    if (action === "history") {
      toggleHistory();
    }

  });

});


/* =========================
   KEYBOARD SUPPORT
   ========================= */

document.addEventListener("keydown", event => {

  // Numbers
  if (/[0-9]/.test(event.key)) {
    appendValue(event.key);
  }

  // Decimal
  else if (event.key === ".") {
    appendValue(".");
  }

  // Operators
  else if ("+-*/".includes(event.key)) {
    appendValue(event.key);
  }

  // Calculate
  else if (
    event.key === "Enter" ||
    event.key === "="
  ) {
    event.preventDefault();
    calculate();
  }

  // Backspace
  else if (event.key === "Backspace") {
    backspace();
  }

  // Clear
  else if (event.key === "Escape") {
    clearCalculator();
  }

});


/* =========================
   INITIAL STATE
   ========================= */

updateDisplay();

updateHistory();