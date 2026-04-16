const fs = require('fs');
const path = require('path');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const loaderHtml = `
  <div id="loader">
    <div class="spinner"></div>
  </div>`;

files.forEach(file => {
    let cp = path.join(dir, file);
    let content = fs.readFileSync(cp, 'utf8');
    
    // Inject the loader right after <body>
    if (!content.includes('id="loader"')) {
        content = content.replace(/<body>/, `<body class="loading">\n${loaderHtml}`);
    }

    // Defer JS
    content = content.replace(/<script src="assets\/js\/site\.min\.js"><\/script>/g, '<script src="assets/js/site.min.js" defer></script>');
    
    fs.writeFileSync(cp, content);
    console.log(`Updated ${file}`);
});

// Append to CSS
const cssPath = path.join(dir, 'assets/css/style.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('#loader {')) {
    cssContent += `
/* ── Preloader ─────────────────────────────────────── */
#loader {
  position: fixed;
  inset: 0;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.4s ease;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #eee;
  border-top: 5px solid var(--navy);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

body.loading {
  overflow: hidden;
}
`;
    fs.writeFileSync(cssPath, cssContent);
}

// Append to JS
const jsPath = path.join(dir, 'assets/js/site.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');
if (!jsContent.includes('document.getElementById("loader")')) {
    jsContent += `
/* ── Preloader ───────────────────────────────────────── */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      document.body.classList.remove("loading");
    }, 400);
  }
});
`;
    fs.writeFileSync(jsPath, jsContent);
}
