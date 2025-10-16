// scripts/validators.js

/**
 * Validate description: no leading/trailing spaces, no double spaces
 */
export function validateDescription(desc) {
  const trimmed = desc.trim();

  // Reject leading/trailing spaces
  if (desc !== trimmed) {
    return { valid: false, message: "Description cannot have leading or trailing spaces" };
  }

  // Reject empty description
  if (trimmed.length === 0) {
    return { valid: false, message: "Description cannot be empty" };
  }

  // Reject double spaces
  if (/\s{2,}/.test(trimmed)) {
    return { valid: false, message: "Description cannot have consecutive spaces" };
  }

  return { valid: true, cleaned: trimmed };
}

/**
 * Validate amount: positive number with up to 2 decimals
 */
export function validateAmount(amount) {
  const amountStr = String(amount);

  // Reject leading/trailing spaces
  if (amountStr !== amountStr.trim()) {
    return { valid: false, message: "Amount cannot have leading or trailing spaces" };
  }

  // Regex for positive numbers with up to 2 decimals
  const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
  if (!pattern.test(amountStr)) {
    return { valid: false, message: "Amount must be a positive number with up to 2 decimals" };
  }

  const num = parseFloat(amountStr);
  if (num < 0) {
    return { valid: false, message: "Amount cannot be negative" };
  }

  return { valid: true, value: num };
}

/**
 * Validate date: YYYY-MM-DD format
 */
export function validateDate(date) {
  // Reject leading/trailing spaces
  if (date !== date.trim()) {
    return { valid: false, message: "Date cannot have leading or trailing spaces" };
  }

  const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!pattern.test(date)) {
    return { valid: false, message: "Date must be in YYYY-MM-DD format" };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: "Invalid date" };
  }

  return { valid: true };
}

/**
 * Validate category: letters, spaces, hyphens only
 */
export function validateCategory(category) {
  const trimmed = category.trim();

  // Reject leading/trailing spaces
  if (category !== trimmed) {
    return { valid: false, message: "Category cannot have leading or trailing spaces" };
  }

  const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
  if (!pattern.test(trimmed)) {
    return { valid: false, message: "Category can only contain letters, spaces, and hyphens" };
  }

  return { valid: true, cleaned: trimmed };
}

/**
 * Detect duplicate consecutive words
 */
/**
 * Detect any duplicate word in the text (case-insensitive)
 */
export function detectDuplicateWords(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g);
  if (!words) return { hasDuplicate: false };

  const seen = new Set();
  for (const word of words) {
    if (seen.has(word)) {
      return {
        hasDuplicate: true,
        word,
        message: `Duplicate word detected: "${word}"`
      };
    }
    seen.add(word);
  }
  return { hasDuplicate: false };
}

/**
 * Check if amount has cents
 */
export function hasCents(amountStr) {
  const pattern = /\.\d{2}\b/;
  return pattern.test(String(amountStr));
}

/**
 * Detect beverage keywords
 */
export function isBeverage(description) {
  const pattern = /(coffee|tea|juice|soda|drink|beverage)/i;
  return pattern.test(description);
}

/**
 * FORCE USER INPUT LOOP
 * Example usage for any input field:
 */
export async function promptUntilValid(promptFn, validatorFn) {
  while (true) {
    const input = await promptFn();
    const result = validatorFn(input);

    if (result.valid) {
      return result.cleaned ?? result.value ?? input;
    } else {
      alert(result.message); // tell the user what's wrong
    }
  }
}


// scripts/regexTester.js

/**
 * Handle user-entered regex safely with:
 * - Try/catch compilation
 * - Case-insensitive toggle
 * - Highlighting matches using <mark>
 * - Accessibility-friendly updates
 */

/**
 * Safely compile regex from user input.
 * Returns a RegExp object or an error message.
 */
export function compileUserRegex(pattern, isCaseInsensitive = false) {
  try {
    // Build regex with optional 'i' flag
    const flags = isCaseInsensitive ? 'gi' : 'g';
    const regex = new RegExp(pattern, flags);
    return { valid: true, regex };
  } catch (error) {
    return { valid: false, message: error.message };
  }
}

/**
 * Highlight regex matches in text using <mark>
 * This preserves accessibility and ensures text is readable for screen readers.
 */
export function highlightMatches(text, regex) {
  if (!regex || !regex.global) {
    // Always use global regex for multiple matches
    regex = new RegExp(regex.source, regex.flags.includes('i') ? 'gi' : 'g');
  }

  // Escape HTML to avoid injecting unwanted code
  const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Replace all matches with <mark>
  const highlighted = safeText.replace(regex, (match) => `<mark>${match}</mark>`);

  return highlighted;
}

/**
 * Update a container’s innerHTML with highlighted text,
 * using aria-live for accessibility (so screen readers announce updates).
 */
export function updateHighlightedOutput(containerId, text, regexResult) {
  const container = document.getElementById(containerId);
  
  if (!regexResult.valid) {
    container.innerHTML = `<p style="color:red;">Invalid regex: ${regexResult.message}</p>`;
    return;
  }

  const highlighted = highlightMatches(text, regexResult.regex);
  container.innerHTML = highlighted;
  container.setAttribute('aria-live', 'polite'); // announces change for accessibility
}

/**
 * Setup event listeners for regex tester UI
 */
export function setupRegexUI() {
  const patternInput = document.getElementById('regexPattern');
  const caseToggle = document.getElementById('caseToggle');
  const testText = document.getElementById('testText');
  const outputDiv = document.getElementById('output');

  function runRegex() {
    const pattern = patternInput.value;
    const isCaseInsensitive = caseToggle.checked;
    const regexResult = compileUserRegex(pattern, isCaseInsensitive);
    updateHighlightedOutput('output', testText.value, regexResult);
  }

  patternInput.addEventListener('input', runRegex);
  caseToggle.addEventListener('change', runRegex);
  testText.addEventListener('input', runRegex);
}
