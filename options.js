// Options page script

let categories = {};

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const settings = await chrome.storage.sync.get(['folderName', 'autoClassify', 'categories']);

  // Set form values
  document.getElementById('folder-name').value = settings.folderName || 'Smart Bookmarks';
  document.getElementById('auto-classify').checked = settings.autoClassify !== false;

  // Load categories
  categories = settings.categories || {};
  renderCategories();
}

// Render categories
function renderCategories() {
  const container = document.getElementById('categories-container');
  container.innerHTML = '';

  Object.entries(categories).forEach(([name, config]) => {
    const categoryCard = createCategoryCard(name, config);
    container.appendChild(categoryCard);
  });
}

// Create category card element
function createCategoryCard(name, config) {
  const card = document.createElement('div');
  card.className = 'category-card';
  card.dataset.categoryName = name;

  const domainsText = config.domains ? config.domains.join(', ') : '';
  const keywordsText = config.keywords ? config.keywords.join(', ') : '';

  card.innerHTML = `
    <div class="category-header">
      <input type="text" class="category-name" value="${name}" placeholder="Category Name">
      <button class="delete-category">🗑️ Delete</button>
    </div>

    <div class="category-field">
      <label>Domains (comma-separated):</label>
      <textarea class="category-domains" placeholder="github.com, stackoverflow.com">${domainsText}</textarea>
      <small>Match these domains exactly</small>
    </div>

    <div class="category-field">
      <label>Keywords (comma-separated):</label>
      <textarea class="category-keywords" placeholder="code, programming, developer">${keywordsText}</textarea>
      <small>Match these keywords in title and URL</small>
    </div>
  `;

  // Delete button handler
  card.querySelector('.delete-category').addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete the "${name}" category?`)) {
      card.remove();
    }
  });

  return card;
}

// Setup event listeners
function setupEventListeners() {
  // Add category button
  document.getElementById('add-category').addEventListener('click', () => {
    const newName = `New Category ${Object.keys(categories).length + 1}`;
    const newConfig = {
      domains: [],
      keywords: [],
      patterns: []
    };

    const card = createCategoryCard(newName, newConfig);
    document.getElementById('categories-container').appendChild(card);
  });

  // Save settings button
  document.getElementById('save-settings').addEventListener('click', async () => {
    try {
      // Collect settings
      const folderName = document.getElementById('folder-name').value.trim() || 'Smart Bookmarks';
      const autoClassify = document.getElementById('auto-classify').checked;

      // Collect categories
      const newCategories = {};
      const categoryCards = document.querySelectorAll('.category-card');

      categoryCards.forEach(card => {
        const name = card.querySelector('.category-name').value.trim();
        if (!name) return;

        const domainsText = card.querySelector('.category-domains').value.trim();
        const keywordsText = card.querySelector('.category-keywords').value.trim();

        const domains = domainsText
          ? domainsText.split(',').map(d => d.trim()).filter(d => d)
          : [];

        const keywords = keywordsText
          ? keywordsText.split(',').map(k => k.trim()).filter(k => k)
          : [];

        newCategories[name] = {
          domains,
          keywords,
          patterns: [] // Patterns are complex, keeping simple for now
        };
      });

      // Save to storage
      await chrome.storage.sync.set({
        folderName,
        autoClassify,
        categories: newCategories
      });

      categories = newCategories;

      // Reinitialize folders in background script
      await chrome.runtime.sendMessage({ action: 'reinitialize' });

      showMessage('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('Error saving settings. Please try again.', 'error');
    }
  });

  // Reset to defaults button
  document.getElementById('reset-defaults').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      // Clear storage and reload
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();

      // Reload extension background
      await chrome.runtime.reload();

      showMessage('Settings reset to defaults!', 'success');

      // Reload page after a delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Error resetting settings:', error);
      showMessage('Error resetting settings. Please try again.', 'error');
    }
  });
}

// Show message to user
function showMessage(text, type = 'success') {
  const container = document.getElementById('message-container');
  container.innerHTML = '';

  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;

  container.appendChild(message);

  setTimeout(() => message.remove(), 3000);
}
