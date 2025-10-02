const fs = require("fs");
const path = require("path");
const vm = require("vm");
const {
  JSDOM
} = require("jsdom");

// Source and output folders
const SRC_DIR = path.join(__dirname, "src");
const BUILD_DIR = path.join(__dirname, "build");

// Make build folder if it doesn't exist
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR);

// Load DOM.min.js code
const DOMcode = fs.readFileSync(path.join(__dirname, "DOM.min.js"), "utf-8");

// Get all source files
const pageFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith(".dom.js") || f.endsWith(".dom.json"));

pageFiles.forEach(file => {
  const pageName = path.basename(file, path.extname(file));
  const filePath = path.join(SRC_DIR, file);

  // Create JSDOM environment
  const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
    runScripts: "outside-only",
  });

  // Expose globals for DOM.min.js
  global.window = dom.window;
  global.document = dom.window.document;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.HTMLElement = dom.window.HTMLElement;

  // Load DOM.min.js into this VM
  vm.runInContext(DOMcode, dom.getInternalVMContext());

  if (file.endsWith(".dom.json")) {
    const domJsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const headData = {};
    const bodyData = {};
    for (const key in domJsonData) {
      if (dom.window.DOM.headTags.includes(key.toLowerCase())) {
        headData[key] = domJsonData[key];
      } else {
        bodyData[key] = domJsonData[key];
      }
    }
    dom.window.DOM.set(headData, dom.window.document.head);
    dom.window.DOM.set(bodyData, dom.window.document.body);
  } else if (file.endsWith(".dom.js")) {
    const code = fs.readFileSync(filePath, "utf-8");
    dom.window.DOM = dom.window.DOM; // inject DOM into window
    const script = new vm.Script(code);
    script.runInContext(dom.getInternalVMContext());
  }
  dom.window.document.body.let("visibility", "visible");

  // Serialize and write HTML (both .dom.json and .dom.js produce .html)
  const htmlContent = dom.serialize();
  const fileName = pageName.replace(/\.dom$/, '') + '.html';
  fs.writeFileSync(path.join(BUILD_DIR, fileName), htmlContent, "utf-8");
  console.log(`Built ${fileName}`);
});

console.log("Build complete.");