const SELECTORS = {
  display: 'display',
  buttons: '.buttons',
};

const ACTIONS = {
  NUMBER: 'number',
  OPERATOR: 'operator',
  EQUALS: 'equals',
  CLEAR: 'clear',
  DECIMAL: 'decimal',
};

const KEYBOARD_MAP = {
  Enter: ACTIONS.EQUALS,
  '=': ACTIONS.EQUALS,
  Escape: ACTIONS.CLEAR,
  '.': ACTIONS.DECIMAL,
};

function createInitialState() {
  return {
    currentValue: '0',
    previousValue: null,
    currentOperator: null,
    shouldResetDisplay: false,
    errorState: false,
  };
}

class Calculator {
  constructor(displayElement) {
    this.displayElement = displayElement;
    this.state = createInitialState();
    this.updateDisplay(this.state.currentValue);
  }

  updateDisplay(value) {
    this.displayElement.value = value;
  }

  resetState() {
    this.state = createInitialState();
    this.updateDisplay(this.state.currentValue);
  }

  get hasPendingOperation() {
    return this.state.currentOperator !== null && this.state.previousValue !== null;
  }

  appendNumber(number) {
    if (this.state.errorState) {
      this.resetState();
    }

    if (this.state.shouldResetDisplay) {
      this.state.currentValue = number;
      this.state.shouldResetDisplay = false;
      this.updateDisplay(this.state.currentValue);
      return;
    }

    this.state.currentValue =
      this.state.currentValue === '0' ? number : this.state.currentValue + number;

    this.updateDisplay(this.state.currentValue);
  }

  addDecimalPoint() {
    if (this.state.errorState) {
      this.resetState();
    }

    if (this.state.shouldResetDisplay) {
      this.state.currentValue = '0.';
      this.state.shouldResetDisplay = false;
      this.updateDisplay(this.state.currentValue);
      return;
    }

    if (!this.state.currentValue.includes('.')) {
      this.state.currentValue += '.';
      this.updateDisplay(this.state.currentValue);
    }
  }

  applyOperator(operator) {
    if (this.state.errorState) {
      return;
    }

    if (this.state.currentOperator && !this.state.shouldResetDisplay) {
      this.calculate();
      if (this.state.errorState) return;
    }

    this.state.previousValue = this.state.currentValue;
    this.state.currentOperator = operator;
    this.state.shouldResetDisplay = true;
  }

  calculate() {
    if (!this.hasPendingOperation || this.state.errorState) {
      return;
    }

    const previous = Number(this.state.previousValue);
    const current = Number(this.state.currentValue);
    const result = this.performOperation(previous, current, this.state.currentOperator);

    if (result === null) {
      return;
    }

    this.state.currentValue = this.formatResult(result);
    this.state.previousValue = null;
    this.state.currentOperator = null;
    this.state.shouldResetDisplay = true;
    this.updateDisplay(this.state.currentValue);
  }

  performOperation(previous, current, operator) {
    switch (operator) {
      case '+':
        return previous + current;
      case '-':
        return previous - current;
      case '*':
        return previous * current;
      case '/':
        if (current === 0) {
          this.showError('Error: división por cero');
          return null;
        }
        return previous / current;
      default:
        return null;
    }
  }

  formatResult(result) {
    return String(Number.isInteger(result) ? result : Number(result.toFixed(8)));
  }

  showError(message) {
    this.state.errorState = true;
    this.updateDisplay(message);
  }

  handleAction(action, value) {
    switch (action) {
      case ACTIONS.NUMBER:
        if (value) this.appendNumber(value);
        break;
      case ACTIONS.OPERATOR:
        if (value) this.applyOperator(value);
        break;
      case ACTIONS.EQUALS:
        this.calculate();
        break;
      case ACTIONS.CLEAR:
        this.resetState();
        break;
      case ACTIONS.DECIMAL:
        this.addDecimalPoint();
        break;
      default:
        break;
    }
  }
}

function mapKeyboardEventToAction(key) {
  if (/^[0-9]$/.test(key)) {
    return { action: ACTIONS.NUMBER, value: key };
  }

  if (['+', '-', '*', '/'].includes(key)) {
    return { action: ACTIONS.OPERATOR, value: key };
  }

  if (key.toLowerCase() === 'c') {
    return { action: ACTIONS.CLEAR };
  }

  const mappedAction = KEYBOARD_MAP[key];
  if (mappedAction) {
    return { action: mappedAction };
  }

  return null;
}

function initializeCalculator() {
  const display = document.getElementById(SELECTORS.display);
  const buttons = document.querySelector(SELECTORS.buttons);
  const calculator = new Calculator(display);

  buttons.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    calculator.handleAction(target.dataset.action, target.dataset.value);
  });

  document.addEventListener('keydown', (event) => {
    const mapping = mapKeyboardEventToAction(event.key);

    if (!mapping) {
      return;
    }

    if (mapping.action === ACTIONS.EQUALS) {
      event.preventDefault();
    }

    calculator.handleAction(mapping.action, mapping.value);
  });
}

initializeCalculator();
