// scripts/ui.js
import { loadRecords, addRecord, updateRecord, deleteRecord, saveRecords } from './storage.js';
import { renderDashboard } from './dashboard.js';
import { validateDescription, validateAmount, validateDate, validateCategory, detectDuplicateWords } from './validators.js';
import { compileRegex, highlight, searchRecords } from './search.js';
import { loadSettings, saveSettings, convertCurrency } from './settings.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded!");
  const themeToggle = document.getElementById('theme-toggle');


  function setTheme(theme) {
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  localStorage.setItem('theme', theme);
  if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark');
}

const saved = localStorage.getItem('theme') || 'light';
setTheme(saved);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    setTheme(next);
  });
}


  // ----------------- ELEMENTS -----------------
  const recordsBody = document.getElementById('records-body');
  const searchInput = document.getElementById('search');
  const form = document.getElementById('record-form');
  const navLinks = document.querySelectorAll("nav a");
  const getStartedBtn = document.querySelector(".button");  
  const learnMoreBtn = document.querySelector(".btn");
  const allSections = document.querySelectorAll("main section");
  const header = document.querySelector("header");

  console.log("Form found:", !!form);
  console.log("Get Started button:", !!getStartedBtn);
  console.log("Learn More button:", !!learnMoreBtn);

  // ----------------- FUNCTION: Show Section -----------------
  function showSection(targetId) {
    console.log("Showing:", targetId);
    
    // Hide header
    if (header) {
      header.style.display = targetId === "home" ? "block" : "none";
    }
    
    // Hide all main sections
    allSections.forEach(sec => {
      sec.style.display = "none";
    });
    
    // Show target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.style.display = "block";
    } else if (targetId === "home" && header) {
      header.style.display = "block";
    }

    // Update active nav link
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + targetId) {
        link.classList.add("active");
      }
    });
    
    // Render content based on section
    if (targetId === "dashboard") {
      renderDashboard();
    }
    
    if (targetId === "records") {
      renderRecords();
    }

    // Show/Hide Last 7 Days button only on Records page
const last7DaysBtn = document.getElementById('last-7-days-btn');
if (last7DaysBtn) {
  if (targetId === 'records') {
    last7DaysBtn.style.display = 'inline-block';
  } else {
    last7DaysBtn.style.display = 'none';
  }
}

    
    if (targetId === "settings") {
      loadAndDisplaySettings();
    }
  }

// ----------------- RECORDS TABLE ------------------
function renderRecords(records = null) {
  const data = records || loadRecords();

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6); // last 7 days including today

  // Filter records from the last 7 days
  const last7DaysRecords = data.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate >= sevenDaysAgo && recordDate <= today;
  });

  renderRecordsWithHighlight(last7DaysRecords, null);
}


function renderRecordsWithHighlight(records, regex) {
  if (!recordsBody) return;
  recordsBody.innerHTML = '';

  if (!records || records.length === 0) {
    const empty = document.createElement('tr');
    empty.innerHTML = '<td colspan="5" style="text-align:center; color:#666;">No records found</td>';
    recordsBody.appendChild(empty);
    return;
  }

  records.forEach(r => {
    const row = document.createElement("tr");
    const desc = regex ? highlight(r.description, regex) : r.description;
    
    row.innerHTML = `
      <td>${desc}</td>
      <td>${r.amount.toFixed(2)}</td>
      <td>${r.category}</td>
      <td>${r.date}</td>
      <td>
        <button class="edit" data-id="${r.id}">Edit</button>
        <button class="delete" data-id="${r.id}">Delete</button>
      </td>
    `;
    recordsBody.appendChild(row);
  });
}

  // ----------------- NAVIGATION -----------------
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      const href = this.getAttribute("href");
      const targetId = href.replace("#", "");
      console.log("Nav clicked:", targetId);
      showSection(targetId);
    });
  });

  // ----------------- BUTTONS -----------------
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", e => {
      e.preventDefault();
      console.log("Get Started clicked");
      showSection("dashboard");
    });
  }

  if (learnMoreBtn) {
    learnMoreBtn.addEventListener("click", e => {
      e.preventDefault();
      console.log("Learn More clicked");
      showSection("about");
    });
  }

  // ----------------- EDIT/DELETE -----------------
  recordsBody.addEventListener("click", e => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("edit")) {
      const record = loadRecords().find(r => r.id === id);
      if (record) {
        form.dataset.editing = id;
        form.querySelector("#description").value = record.description;
        form.querySelector("#amount").value = record.amount;
        form.querySelector("#category").value = record.category;
        form.querySelector("#date").value = record.date;
        form.querySelector("button[type='submit']").textContent = "Update";
        showSection("add");
      }
    }

    if (e.target.classList.contains("delete")) {
      if (confirm("Are you sure you want to delete this transaction?")) {
        deleteRecord(id);
        renderRecords();
        renderDashboard();
      }
    }
  });

 // ----------------- ADD/EDIT FORM (with edit support) -----------------
form.addEventListener("submit", e => {
    e.preventDefault();

    // --- VALIDATIONS & RECORD DATA CREATION ---
    const descInput = document.getElementById("description").value.trim();
    const amountInput = document.getElementById("amount").value;
    const dateInput = document.getElementById("date").value;
    const categoryInput = document.getElementById("category").value;

    // VALIDATE DESCRIPTION
    const descValidation = validateDescription(descInput);
    if (!descValidation.valid) { alert("❌ " + descValidation.message); return; }

    // DUPLICATE WORD CHECK
    const dupCheck = detectDuplicateWords(descInput);
    if (dupCheck.hasDuplicate) { alert("❌ " + dupCheck.message); return; }

    // VALIDATE AMOUNT, DATE, CATEGORY
    const amountValidation = validateAmount(amountInput);
    if (!amountValidation.valid) { alert("❌ " + amountValidation.message); return; }

    const dateValidation = validateDate(dateInput);
    if (!dateValidation.valid) { alert("❌ " + dateValidation.message); return; }

    const categoryValidation = validateCategory(categoryInput);
    if (!categoryValidation.valid) { alert("❌ " + categoryValidation.message); return; }

    // CREATE RECORD OBJECT
    const recordData = {
        description: descValidation.cleaned,
        amount: amountValidation.value,
        category: categoryValidation.cleaned,
        date: dateInput,
        updatedAt: new Date().toISOString()
    };

    // ADD OR UPDATE
    const isEditing = form.dataset.editing;

    if (isEditing) {
        updateRecord(isEditing, recordData);
        delete form.dataset.editing;
        form.querySelector("button[type='submit']").textContent = "Save";
        alert("✅ Transaction updated successfully!");
    } else {
        recordData.id = "txn_" + Date.now();
        recordData.createdAt = new Date().toISOString();
        addRecord(recordData);
        alert("✅ Transaction saved successfully!");
    }

    // RE-RENDER RECORDS & DASHBOARD
    renderRecords();
    renderDashboard();
    form.reset();
}); // ← CLOSE FORM SUBMIT LISTENER


  // ----------------- SETTINGS -----------------
  const baseCurrencySelect = document.getElementById('base-currency');
  const rateUSDInput = document.getElementById('rate-usd');
  const rateEURInput = document.getElementById('rate-eur');
  const saveSettingsBtn = document.getElementById('save-settings');

  // Load and display settings
  function loadAndDisplaySettings() {
    if (!baseCurrencySelect || !rateUSDInput || !rateEURInput) return;
    
    const settings = loadSettings();
    baseCurrencySelect.value = settings.baseCurrency;
    rateUSDInput.value = settings.rates.USD;
    rateEURInput.value = settings.rates.EUR;
  }

  // Save settings
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const settings = {
        baseCurrency: baseCurrencySelect.value,
        rates: {
          USD: parseFloat(rateUSDInput.value),
          EUR: parseFloat(rateEURInput.value)
        }
      };
      saveSettings(settings);
      alert('✅ Settings saved!');
      renderDashboard();
    });
  }

  // ----------------- IMPORT/EXPORT -----------------
  const exportBtn = document.getElementById('export-json');
  const importBtn = document.getElementById('import-json-btn');
  const importFile = document.getElementById('import-json');
  const importStatus = document.getElementById('import-status');

  // Export JSON
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const records = loadRecords();
      const dataStr = JSON.stringify(records, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-tracker-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert('✅ Data exported successfully!');
    });
  }

  // Import JSON
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => {
      importFile.click();
    });
    
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate structure
          if (!Array.isArray(data)) {
            throw new Error('Invalid format: data must be an array');
          }
          
          // Validate each record
          data.forEach((record, index) => {
            if (!record.id || !record.description || !record.amount || !record.category || !record.date) {
              throw new Error(`Invalid record at index ${index}: missing required fields`);
            }
          });
          
          // Save and reload
          saveRecords(data);
          renderRecords();
          renderDashboard();
          
          if (importStatus) {
            importStatus.textContent = `✅ Successfully imported ${data.length} records`;
            importStatus.style.color = 'green';
            
            setTimeout(() => {
              importStatus.textContent = '';
            }, 3000);
          }
          
        } catch (error) {
          if (importStatus) {
            importStatus.textContent = `❌ Import failed: ${error.message}`;
            importStatus.style.color = 'red';
          }
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  // ----------------- BUDGET CAP -----------------
  const budgetLimitInput = document.getElementById('budget-limit');
  const setBudgetBtn = document.getElementById('set-budget');

  let budgetLimit = parseFloat(localStorage.getItem('budgetLimit')) || null;

  if (budgetLimitInput && budgetLimit) {
    budgetLimitInput.value = budgetLimit;
  }

  if (setBudgetBtn) {
    setBudgetBtn.addEventListener('click', () => {
      const limit = parseFloat(budgetLimitInput.value);
      if (isNaN(limit) || limit <= 0) {
        alert('Please enter a valid budget limit');
        return;
      }
      budgetLimit = limit;
      localStorage.setItem('budgetLimit', budgetLimit);
      renderDashboard();
      alert('✅ Budget limit set!');
    });
  }

  // ----------------- INITIAL LOAD -----------------
  showSection("home");
  renderRecords();
  loadAndDisplaySettings();
});

