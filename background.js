// Smart Bookmark Classifier - Background Service Worker

// Default categories with patterns
const DEFAULT_CATEGORIES = {
  'Development': {
    domains: ['github.com', 'stackoverflow.com', 'gitlab.com', 'bitbucket.org', 'dev.to', 'hackernews.com', 'medium.com/tag/programming'],
    keywords: ['code', 'programming', 'developer', 'api', 'documentation', 'tutorial', 'github', 'development'],
    patterns: [/\b(javascript|python|java|rust|golang|nodejs|react|vue|angular)\b/i]
  },
  'Social Media': {
    domains: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'tiktok.com', 'x.com'],
    keywords: ['social', 'network', 'community', 'post', 'tweet', 'share'],
    patterns: []
  },
  'Videos & Entertainment': {
    domains: ['youtube.com', 'vimeo.com', 'twitch.tv', 'netflix.com', 'hulu.com', 'dailymotion.com'],
    keywords: ['video', 'watch', 'stream', 'movie', 'entertainment', 'show'],
    patterns: [/watch\?v=/i, /video/i]
  },
  'Shopping': {
    domains: ['amazon.com', 'ebay.com', 'etsy.com', 'aliexpress.com', 'shopify.com', 'walmart.com'],
    keywords: ['shop', 'buy', 'cart', 'product', 'store', 'price', 'deal'],
    patterns: [/product/i, /item/i, /cart/i]
  },
  'News & Media': {
    domains: ['nytimes.com', 'bbc.com', 'cnn.com', 'reuters.com', 'theguardian.com', 'news.ycombinator.com'],
    keywords: ['news', 'article', 'breaking', 'report', 'journalism', 'press'],
    patterns: [/news/i, /article/i]
  },
  'Education & Learning': {
    domains: ['coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'wikipedia.org', 'udacity.com'],
    keywords: ['course', 'learn', 'education', 'tutorial', 'study', 'lesson', 'university'],
    patterns: [/course/i, /learn/i, /tutorial/i]
  },
  'Design & Creative': {
    domains: ['dribbble.com', 'behance.net', 'figma.com', 'canva.com', 'pinterest.com', 'awwwards.com'],
    keywords: ['design', 'creative', 'ui', 'ux', 'graphics', 'art', 'inspiration'],
    patterns: [/design/i, /creative/i]
  },
  'Productivity & Tools': {
    domains: ['notion.so', 'trello.com', 'asana.com', 'slack.com', 'discord.com', 'airtable.com'],
    keywords: ['productivity', 'tool', 'workflow', 'manage', 'organize', 'task'],
    patterns: [/tool/i, /app/i]
  },
  'Finance & Crypto': {
    domains: ['coinbase.com', 'binance.com', 'investing.com', 'bloomberg.com', 'cryptopanic.com'],
    keywords: ['crypto', 'bitcoin', 'ethereum', 'finance', 'trading', 'investment', 'stock'],
    patterns: [/crypto/i, /bitcoin/i, /trading/i]
  },
  'Documentation': {
    domains: ['docs.github.com', 'developer.mozilla.org', 'docs.python.org', 'reactjs.org/docs'],
    keywords: ['documentation', 'docs', 'reference', 'guide', 'manual', 'api reference'],
    patterns: [/\/docs?\//i, /documentation/i, /reference/i]
  }
};

// Store for category folders
let categoryFolders = {};

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Smart Bookmark Classifier installed');

  // Load or create settings
  const settings = await chrome.storage.sync.get({
    autoClassify: true,
    categories: DEFAULT_CATEGORIES,
    folderName: 'Smart Bookmarks'
  });

  await chrome.storage.sync.set(settings);

  // Create root folder
  await initializeFolders();
});

// Initialize bookmark folders
async function initializeFolders() {
  const settings = await chrome.storage.sync.get(['folderName', 'categories']);
  const folderName = settings.folderName || 'Smart Bookmarks';
  const categories = settings.categories || DEFAULT_CATEGORIES;

  // Find or create root folder
  const bookmarks = await chrome.bookmarks.search({ title: folderName });
  let rootFolder;

  if (bookmarks.length === 0) {
    rootFolder = await chrome.bookmarks.create({
      title: folderName,
      parentId: '1' // Bookmarks bar
    });
  } else {
    rootFolder = bookmarks.find(b => !b.url) || bookmarks[0];
  }

  // Create category folders
  for (const categoryName of Object.keys(categories)) {
    const existingFolder = await chrome.bookmarks.search({ title: categoryName });
    const categoryFolder = existingFolder.find(f => !f.url && f.parentId === rootFolder.id);

    if (!categoryFolder) {
      const folder = await chrome.bookmarks.create({
        title: categoryName,
        parentId: rootFolder.id
      });
      categoryFolders[categoryName] = folder.id;
    } else {
      categoryFolders[categoryName] = categoryFolder.id;
    }
  }

  // Store folder IDs
  await chrome.storage.local.set({ categoryFolders, rootFolderId: rootFolder.id });
}

// Listen for new bookmarks
chrome.bookmarks.onCreated.addListener(async (id, bookmark) => {
  const settings = await chrome.storage.sync.get(['autoClassify']);

  if (!settings.autoClassify || !bookmark.url) {
    return;
  }

  // Small delay to allow bookmark to be fully created
  setTimeout(() => classifyBookmark(bookmark), 500);
});

// Classify a bookmark
async function classifyBookmark(bookmark) {
  if (!bookmark.url) return;

  const settings = await chrome.storage.sync.get(['categories']);
  const categories = settings.categories || DEFAULT_CATEGORIES;
  const { categoryFolders } = await chrome.storage.local.get(['categoryFolders']);

  if (!categoryFolders) {
    await initializeFolders();
    return classifyBookmark(bookmark);
  }

  try {
    // Extract domain from URL
    const url = new URL(bookmark.url);
    const domain = url.hostname.replace('www.', '');
    const title = bookmark.title.toLowerCase();
    const urlPath = url.pathname.toLowerCase();
    const fullText = `${title} ${urlPath}`;

    // Score each category
    const scores = {};

    for (const [categoryName, rules] of Object.entries(categories)) {
      let score = 0;

      // Check domain match (highest weight)
      if (rules.domains && rules.domains.some(d => domain.includes(d) || d.includes(domain))) {
        score += 10;
      }

      // Check keyword matches
      if (rules.keywords) {
        const keywordMatches = rules.keywords.filter(keyword =>
          fullText.includes(keyword.toLowerCase())
        ).length;
        score += keywordMatches * 2;
      }

      // Check pattern matches
      if (rules.patterns) {
        const patternMatches = rules.patterns.filter(pattern =>
          pattern.test(fullText)
        ).length;
        score += patternMatches * 3;
      }

      scores[categoryName] = score;
    }

    // Find best matching category
    const bestCategory = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])[0];

    if (bestCategory) {
      const [categoryName] = bestCategory;
      const targetFolderId = categoryFolders[categoryName];

      if (targetFolderId && bookmark.parentId !== targetFolderId) {
        // Move bookmark to appropriate folder
        await chrome.bookmarks.move(bookmark.id, {
          parentId: targetFolderId
        });

        console.log(`Classified "${bookmark.title}" as "${categoryName}"`);

        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Bookmark Classified',
          message: `"${bookmark.title}" → ${categoryName}`
        });
      }
    }
  } catch (error) {
    console.error('Error classifying bookmark:', error);
  }
}

// Message handler for manual classification
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'classifyAll') {
    classifyAllBookmarks().then(result => sendResponse(result));
    return true; // Keep channel open for async response
  }

  if (request.action === 'reclassify') {
    chrome.bookmarks.get(request.bookmarkId).then(([bookmark]) => {
      return classifyBookmark(bookmark);
    }).then(() => sendResponse({ success: true }));
    return true;
  }

  if (request.action === 'getStats') {
    getBookmarkStats().then(stats => sendResponse(stats));
    return true;
  }
});

// Classify all existing bookmarks
async function classifyAllBookmarks() {
  const bookmarks = await chrome.bookmarks.getTree();
  let count = 0;

  async function processNode(node) {
    if (node.url) {
      await classifyBookmark(node);
      count++;
    }
    if (node.children) {
      for (const child of node.children) {
        await processNode(child);
      }
    }
  }

  await processNode(bookmarks[0]);
  return { classified: count };
}

// Get bookmark statistics
async function getBookmarkStats() {
  const { categoryFolders } = await chrome.storage.local.get(['categoryFolders']);
  const stats = {};

  if (categoryFolders) {
    for (const [category, folderId] of Object.entries(categoryFolders)) {
      try {
        const children = await chrome.bookmarks.getChildren(folderId);
        stats[category] = children.filter(c => c.url).length;
      } catch (error) {
        stats[category] = 0;
      }
    }
  }

  return stats;
}
