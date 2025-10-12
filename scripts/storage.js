// storage.js
    
// Function to save data to localStorage
export function loadtransactions() {
    const data = localStorage.getItem(STORAGE_KEY);
    try {
        return data ? JSON.parse(data) : [];
    }   catch (error) {
        console.error("Error parsing data from localStorage", error);
        return [];
    }
}

/**
 * Function to save transaction arrays to localStorage
 * @param {Array} transactions
 */
export function savetransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
