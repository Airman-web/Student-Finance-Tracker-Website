// storage.js
// Functions to interact with localStorage

const STORAGE_KEY = 'finance:data';

/**
 * Load all records from localStorage
 * @returns {Array} records
 */
export function loadRecords() {
  const data = localStorage.getItem(STORAGE_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error parsing data from localStorage", error);
    return [];
  }
}

/**
 * Save records array to localStorage 
 * @param {Array} records
 */
export function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * Add a new record
 * @param {Object} record
 */
export function addRecord(record) {
  const records = loadRecords();
  records.push({
    ...record,
    id: record.id || "txn_" + Date.now(),
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt || new Date().toISOString()
  });
  saveRecords(records);
}

/**
 * Update an existing record by ID
 * @param {string} id
 * @param {Object} updatedData
 */
export function updateRecord(id, updatedData) {
  const records = loadRecords();
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    records[index] = {
      ...records[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    saveRecords(records);
  }
}

/**
 * Delete a record by ID
 * @param {string} id
 */
export function deleteRecord(id) {
  const records = loadRecords().filter(r => r.id !== id);
  saveRecords(records);
}


function recordsToCSV(records) {
  if (!records || !records.length) return '';
  const headers = ['id','description','amount','category','date','createdAt','updatedAt'];
  const rows = records.map(r =>
    headers.map(h => {
      const v = r[h] === undefined || r[h] === null ? '' : String(r[h]);
      // escape quotes
      return `"${v.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return headers.join(',') + '\n' + rows.join('\n');
}

const exportCsvBtn = document.getElementById('export-csv');
if (exportCsvBtn) {
  exportCsvBtn.addEventListener('click', () => {
    const csv = recordsToCSV(loadRecords());
    if (!csv) return alert('No records to export.');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_records_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    announce('CSV exported', 'polite');
  });
}
