// scripts/dashboard.js
import { loadRecords } from './storage.js';

let trendChart = null;
let categoryChart = null;

export function renderDashboard() {
  const records = loadRecords();
  
  // Total records
  const totalRecordsEl = document.getElementById('total-records');
  if (totalRecordsEl) {
    totalRecordsEl.textContent = records.length;
  }
  
  // Total amount
  const total = records.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const totalAmountEl = document.getElementById('total-amount');
  if (totalAmountEl) {
    totalAmountEl.textContent = total.toFixed(2);
  }
  
  // Top category
  const categoryCount = {};
  records.forEach(r => {
    categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
  });
  
  let topCategory = 'N/A';
  if (Object.keys(categoryCount).length > 0) {
    topCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b
    );
  }
  
  const topCategoryEl = document.getElementById('top-category');
  if (topCategoryEl) {
    topCategoryEl.textContent = topCategory;
  }
  
  // Render charts
  renderTrendChart(records);
  renderCategoryChart(records);
  
  // Update budget status
  updateBudgetStatus();
}

function renderTrendChart(records) {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const today = new Date();
  const last7Days = [];
  const labels = [];
  const data = [];
  
  // Get last 7 days data
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTotal = records
      .filter(r => r.date === dateStr)
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    
    // Format label (MM/DD)
    const label = `${date.getMonth() + 1}/${date.getDate()}`;
    labels.push(label);
    data.push(dayTotal);
  }
  
  // Destroy existing chart if it exists
  if (trendChart) {
    trendChart.destroy();
  }
  
  // Create new chart
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Spending',
        data: data,
        borderColor: '#6528e8',
        backgroundColor: 'rgba(101, 40, 232, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2c14c6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return 'Amount: ' + context.parsed.y.toFixed(2);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toFixed(0);
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function renderCategoryChart(records) {
  const canvas = document.getElementById('category-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Calculate spending by category
  const categoryTotals = {};
  records.forEach(r => {
    if (!categoryTotals[r.category]) {
      categoryTotals[r.category] = 0;
    }
    categoryTotals[r.category] += parseFloat(r.amount || 0);
  });
  
  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  
  // Color palette
  const colors = [
    '#2c14c6',
    '#6528e8',
    '#9b59b6',
    '#3498db',
    '#1abc9c',
    '#f39c12',
    '#e74c3c',
    '#95a5a6'
  ];
  
  // Destroy existing chart if it exists
  if (categoryChart) {
    categoryChart.destroy();
  }
  
  // Create pie chart
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12
            },
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label}: ${value.toFixed(2)} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function updateBudgetStatus() {
  const budgetStatus = document.getElementById('budget-status');
  if (!budgetStatus) return;
  
  const budgetLimit = parseFloat(localStorage.getItem('budgetLimit'));
  if (!budgetLimit) {
    budgetStatus.innerHTML = '<p style="color: #666; font-size: 0.9rem;">No budget limit set. Set one above to track your spending.</p>';
    budgetStatus.style.background = 'transparent';
    budgetStatus.style.border = 'none';
    budgetStatus.style.padding = '0.5rem';
    return;
  }
  
  const records = loadRecords();
  const total = records.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const remaining = budgetLimit - total;
  const percentage = (total / budgetLimit) * 100;
  
  budgetStatus.style.padding = '1rem';
  budgetStatus.style.borderRadius = '8px';
  budgetStatus.style.marginTop = '1rem';
  
  if (remaining >= 0) {
    budgetStatus.style.background = '#d4edda';
    budgetStatus.style.color = '#155724';
    budgetStatus.style.border = '1px solid #c3e6cb';
    budgetStatus.setAttribute('aria-live', 'polite');
    budgetStatus.innerHTML = `
      <strong>Under Budget</strong><br>
      Spent: ${total.toFixed(2)} / ${budgetLimit.toFixed(2)}<br>
      Remaining: ${remaining.toFixed(2)} (${(100 - percentage).toFixed(1)}%)
      <div style="background: #fff; height: 20px; border-radius: 10px; margin-top: 8px; overflow: hidden;">
        <div style="background: #28a745; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
      </div>
    `;
  } else {
    budgetStatus.style.background = '#f8d7da';
    budgetStatus.style.color = '#721c24';
    budgetStatus.style.border = '1px solid #f5c6cb';
    budgetStatus.setAttribute('aria-live', 'assertive');
    budgetStatus.innerHTML = `
      <strong> Over Budget!</strong><br>
      Spent: ${total.toFixed(2)} / ${budgetLimit.toFixed(2)}<br>
      Overage: ${Math.abs(remaining).toFixed(2)} (${(percentage - 100).toFixed(1)}% over)
      <div style="background: #fff; height: 20px; border-radius: 10px; margin-top: 8px; overflow: hidden;">
        <div style="background: #dc3545; height: 100%; width: 100%; transition: width 0.3s ease;"></div>
      </div>
    `;
  }
}