// state.js
// Main logic for managing application state

import { loadRecords, saveRecords, addRecord, updateRecord, deleteRecord } from './storage.js';

// In-memory array of transactions
let transactions = loadRecords();

// Generate unique ID
function generateId() {
  return "txn_" + Math.floor(Math.random() * 1000000);
}

// Get all transactions
export function getTransactions() {
  return transactions;
}

// Add a new transaction
export function addTransaction({ description, amount, category, date }) {
  const now = new Date().toISOString();
  const newTx = {
    id: generateId(),
    description,
    amount: parseFloat(amount),
    category,
    date,
    createdAt: now,
    updatedAt: now
  };
  transactions.push(newTx);
  saveRecords(transactions);
  return newTx;
}

// Edit transaction
export function editTransaction(id, updates) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return null;
  Object.assign(tx, updates, { updatedAt: new Date().toISOString() });
  saveRecords(transactions);
  return tx;
}

// Delete transaction
export function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveRecords(transactions);
}
