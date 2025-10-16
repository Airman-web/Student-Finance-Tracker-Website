// scripts/search.js

/**
 * Safely compile a regex pattern
 * @param {string} input - user input pattern
 * @param {string} flags - regex flags (default 'gi')
 * @returns {RegExp|null}
 */
export function compileRegex(input, flags = 'gi') {
  if (!input || input.trim() === '') return null;
  
  try {
    return new RegExp(input, flags);
  } catch (error) {
    console.error("Invalid regex pattern:", error.message);
    return null;
  }
}

/**
 * Highlight matches in text using <mark> tags
 * @param {string} text
 * @param {RegExp} regex
 * @returns {string} HTML string with highlights
 */
export function highlight(text, regex) {
  if (!regex || !text) return text;
  
  try {
    return text.replace(regex, match => `<mark>${match}</mark>`);
  } catch (error) {
    console.error("Error highlighting text:", error);
    return text;
  }
}

/**
 * Search records by regex pattern
 * @param {Array} records
 * @param {string} pattern
 * @returns {Array} filtered records
 */
export function searchRecords(records, pattern) {
  if (!pattern || pattern.trim() === '') return records;
  
  const regex = compileRegex(pattern, 'i');
  if (!regex) return records;
  
  return records.filter(record => {
    return regex.test(record.description) || 
           regex.test(record.category) ||
           regex.test(String(record.amount));
  });
}