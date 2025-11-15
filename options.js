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

  // Create header
  const header = document.createElement('div');
  header.className = 'category-header';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'category-name';
  nameInput.value = name;
  nameInput.placeholder = 'Category Name';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-category';
  deleteBtn.textContent = '🗑️ Delete';
  deleteBtn.addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete the "${nameInput.value}" category?`)) {
      card.remove();
    }
  });

  header.appendChild(nameInput);
  header.appendChild(deleteBtn);

  // Create domains field
  const domainsField = document.createElement('div');
  domainsField.className = 'category-field';

  const domainsLabel = document.createElement('label');
  domainsLabel.textContent = 'Domains (comma-separated):';

  const domainsTextarea = document.createElement('textarea');
  domainsTextarea.className = 'category-domains';
  domainsTextarea.placeholder = 'github.com, stackoverflow.com';
  domainsTextarea.value = domainsText;

  const domainsSmall = document.createElement('small');
  domainsSmall.textContent = 'Match these domains exactly';

  domainsField.appendChild(domainsLabel);
  domainsField.appendChild(domainsTextarea);
  domainsField.appendChild(domainsSmall);

  // Create keywords field
  const keywordsField = document.createElement('div');
  keywordsField.className = 'category-field';

  const keywordsLabel = document.createElement('label');
  keywordsLabel.textContent = 'Keywords (comma-separated):';

  const keywordsTextarea = document.createElement('textarea');
  keywordsTextarea.className = 'category-keywords';
  keywordsTextarea.placeholder = 'code, programming, developer';
  keywordsTextarea.value = keywordsText;

  const keywordsSmall = document.createElement('small');
  keywordsSmall.textContent = 'Match these keywords in title and URL';

  keywordsField.appendChild(keywordsLabel);
  keywordsField.appendChild(keywordsTextarea);
  keywordsField.appendChild(keywordsSmall);

  // Assemble card
  card.appendChild(header);
  card.appendChild(domainsField);
  card.appendChild(keywordsField);

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
      const categoryNames = new Set();

      // Validate categories
      for (const card of categoryCards) {
        const name = card.querySelector('.category-name').value.trim();
        if (!name) continue;

        // Check for duplicates
        if (categoryNames.has(name)) {
          showMessage(`Duplicate category name: "${name}". Please use unique names.`, 'error');
          return;
        }
        categoryNames.add(name);

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
      }

      // Check if at least one category exists
      if (Object.keys(newCategories).length === 0) {
        showMessage('Please add at least one category.', 'error');
        return;
      }

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
