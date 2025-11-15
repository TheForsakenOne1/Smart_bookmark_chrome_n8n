// Popup script for Smart Bookmark Classifier

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadSettings();
  setupEventListeners();
});

// Load bookmark statistics
async function loadStats() {
  const statsContainer = document.getElementById('stats-container');

  try {
    const stats = await chrome.runtime.sendMessage({ action: 'getStats' });

    statsContainer.innerHTML = '';

    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);

    if (sortedStats.length === 0) {
      statsContainer.innerHTML = '<div class="loading">No categories yet</div>';
      return;
    }

    sortedStats.forEach(([category, count]) => {
      const statCard = document.createElement('div');
      statCard.className = 'stat-card';
      statCard.innerHTML = `
        <h3>${category}</h3>
        <div class="count">${count}</div>
      `;
      statsContainer.appendChild(statCard);
    });
  } catch (error) {
    console.error('Error loading stats:', error);
    statsContainer.innerHTML = '<div class="loading">Error loading stats</div>';
  }
}

// Load settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get(['autoClassify']);
  const autoClassify = settings.autoClassify !== false; // Default to true

  const toggle = document.getElementById('auto-classify-toggle');
  const status = document.getElementById('auto-status');

  toggle.checked = autoClassify;
  status.textContent = autoClassify ? 'Enabled' : 'Disabled';
  status.style.color = autoClassify ? '#10b981' : '#ef4444';
}

// Setup event listeners
function setupEventListeners() {
  // Classify all bookmarks button
  document.getElementById('classify-all').addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    const originalText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = '<span class="icon">⏳</span> Classifying...';

    try {
      const result = await chrome.runtime.sendMessage({ action: 'classifyAll' });

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.textContent = `✓ Successfully classified ${result.classified} bookmarks!`;
      document.querySelector('.container').insertBefore(
        successMsg,
        document.querySelector('.stats-section')
      );

      setTimeout(() => successMsg.remove(), 3000);

      // Reload stats
      await loadStats();
    } catch (error) {
      console.error('Error classifying bookmarks:', error);
      alert('Error classifying bookmarks. Please try again.');
    } finally {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  });

  // Open options page
  document.getElementById('open-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Auto-classify toggle
  document.getElementById('auto-classify-toggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;

    await chrome.storage.sync.set({ autoClassify: enabled });

    const status = document.getElementById('auto-status');
    status.textContent = enabled ? 'Enabled' : 'Disabled';
    status.style.color = enabled ? '#10b981' : '#ef4444';
  });
}
