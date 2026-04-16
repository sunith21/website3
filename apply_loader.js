const fs = require('fs');
const path = require('path');

const dir = '.';
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.html'));

const loaderHtml = `
  <div id="loader" aria-live="polite" aria-label="Loading website">
    <div class="loader-inner">
      <div class="loader-logo-wrap">
        <div class="loader-logo">ROS</div>
      </div>
      <div class="spinner" aria-hidden="true"></div>
      <p class="loader-text">Loading ROS Mortgages...</p>
    </div>
  </div>`;

files.forEach((file) => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('<body class="loading')) {
        content = content.replace(/<body(?![^>]*class=)([^>]*)>/, '<body class="loading"$1>');
        content = content.replace(/<body([^>]*)class="([^"]*)"/, '<body$1class="loading $2"');
    }

    if (!content.includes('id="loader"')) {
        content = content.replace(/<body[^>]*>/, (match) => `${match}\n${loaderHtml}`);
    } else {
        content = content.replace(/<div id="loader"[\s\S]*?<\/div>\s*<\/div>/, loaderHtml.trim());
    }

    content = content.replace(
        /<script src="assets\/js\/site\.min\.js"><\/script>/g,
        '<script src="assets/js/site.min.js" defer></script>'
    );

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
