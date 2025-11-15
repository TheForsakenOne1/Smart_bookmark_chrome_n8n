# Smart Bookmark Classifier

An intelligent Chrome extension that automatically classifies and organizes your bookmarks into categories using AI-powered pattern matching and domain recognition.

## Features

- **Automatic Classification**: Bookmarks are automatically categorized based on domain, keywords, and URL patterns
- **10 Pre-configured Categories**: Development, Social Media, Videos & Entertainment, Shopping, News & Media, Education & Learning, Design & Creative, Productivity & Tools, Finance & Crypto, and Documentation
- **Real-time Organization**: New bookmarks are classified instantly as you save them
- **Bulk Classification**: Classify all existing bookmarks with one click
- **Customizable Categories**: Add, edit, or remove categories to match your needs
- **Smart Matching**: Uses multiple signals (domains, keywords, URL patterns) for accurate classification
- **Beautiful UI**: Clean, modern interface with gradient design and smooth animations

## Installation

### From Source

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd Smart_bookmark_chrome_n8n
   ```

2. **Create Extension Icons** (Required before loading)

   You need to create icon files in the `icons/` directory. You can:
   - Use any image editor to create PNG files in sizes: 16x16, 48x48, and 128x128
   - Use an online icon generator
   - Or run this command to create simple placeholder icons:

   ```bash
   # If you have ImageMagick installed:
   convert -size 128x128 -gravity center -background "#667eea" \
     -fill white -font Arial-Bold -pointsize 72 label:"SB" \
     icons/icon128.png
   convert icons/icon128.png -resize 48x48 icons/icon48.png
   convert icons/icon128.png -resize 16x16 icons/icon16.png
   ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `Smart_bookmark_chrome_n8n` directory

4. **Start using!**
   - The extension will create a "Smart Bookmarks" folder in your bookmarks bar
   - New bookmarks will be automatically classified
   - Click the extension icon to view statistics and settings

## Usage

### Automatic Classification

Once installed, the extension automatically classifies new bookmarks:

1. Save any bookmark as you normally would
2. The extension analyzes the URL, title, and content
3. The bookmark is moved to the appropriate category folder
4. You'll see a notification confirming the classification

### Manual Classification

To classify existing bookmarks:

1. Click the extension icon in the toolbar
2. Click "Classify All Bookmarks"
3. Wait for the process to complete
4. Check the statistics to see your organized bookmarks

### Customizing Categories

1. Click the extension icon
2. Click "Settings"
3. Edit existing categories or add new ones:
   - **Category Name**: The folder name in your bookmarks
   - **Domains**: Website domains to match (e.g., `github.com, gitlab.com`)
   - **Keywords**: Words to look for in titles and URLs (e.g., `code, programming`)
4. Click "Save Settings"

### Toggle Auto-Classification

- Click the extension icon
- Use the toggle switch to enable/disable automatic classification
- When disabled, bookmarks won't be automatically moved

## Category Structure

The extension creates the following default categories:

| Category | Example Domains | Keywords |
|----------|----------------|----------|
| Development | github.com, stackoverflow.com | code, programming, api |
| Social Media | twitter.com, linkedin.com | social, post, tweet |
| Videos & Entertainment | youtube.com, netflix.com | video, watch, stream |
| Shopping | amazon.com, ebay.com | shop, buy, product |
| News & Media | nytimes.com, bbc.com | news, article, breaking |
| Education & Learning | coursera.org, udemy.com | course, learn, tutorial |
| Design & Creative | dribbble.com, figma.com | design, ui, ux |
| Productivity & Tools | notion.so, trello.com | productivity, workflow |
| Finance & Crypto | coinbase.com, binance.com | crypto, bitcoin, trading |
| Documentation | docs.github.com, mdn | documentation, docs, reference |

## How It Works

The extension uses a multi-factor scoring system:

1. **Domain Matching** (Highest priority): Checks if the bookmark's domain matches known domains
2. **Keyword Matching**: Searches for category keywords in the title and URL
3. **Pattern Matching**: Uses regex patterns to identify specific URL structures

Each bookmark is scored against all categories, and the highest-scoring category wins!

## Configuration

Settings are stored in Chrome's sync storage, so they'll sync across your Chrome browsers.

### Settings File Structure

```javascript
{
  "folderName": "Smart Bookmarks",  // Root folder name
  "autoClassify": true,              // Enable/disable auto-classification
  "categories": {
    "Category Name": {
      "domains": ["example.com"],
      "keywords": ["keyword1", "keyword2"],
      "patterns": []
    }
  }
}
```

## Permissions

The extension requires the following permissions:

- **bookmarks**: Read and organize your bookmarks
- **storage**: Save settings and preferences
- **tabs**: Access page information for better classification
- **activeTab**: Read the current tab for context
- **host_permissions** (`<all_urls>`): Analyze page content for improved classification

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Settings are stored in Chrome's secure storage
- The extension only accesses bookmark data and page URLs

## Troubleshooting

### Bookmarks aren't being classified

1. Check if auto-classification is enabled (toggle in popup)
2. Verify the bookmark URL matches a category's domains or keywords
3. Try manually classifying with the "Classify All Bookmarks" button

### Extension icon not showing

1. Make sure you created the icon files (see Installation step 2)
2. Reload the extension from `chrome://extensions/`

### Categories not appearing

1. Open the extension settings
2. Click "Reset to Defaults"
3. Save settings

### Want to add more categories?

1. Open Settings
2. Click "Add New Category"
3. Enter domains and keywords
4. Save settings

## Development

### Project Structure

```
Smart_bookmark_chrome_n8n/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (classification logic)
├── popup.html            # Popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup logic
├── options.html          # Settings page
├── options.css           # Settings styles
├── options.js            # Settings logic
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Add new default categories

## Future Enhancements

- [ ] Machine learning-based classification
- [ ] Integration with n8n workflows for advanced automation
- [ ] Import/export category configurations
- [ ] Browser history analysis for better classification
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Bookmark tagging system
- [ ] Search and filter classified bookmarks
- [ ] Statistics and insights dashboard

## License

MIT License - Feel free to use and modify as needed!

## Support

If you encounter any issues or have questions:

1. Check the Troubleshooting section above
2. Open an issue on GitHub
3. Review the extension's console logs in `chrome://extensions/`

---

Made with ❤️ for better bookmark organization
