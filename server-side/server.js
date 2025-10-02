// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  JSDOM
} = require("jsdom");
const vm = require("vm");

const app = express();
const PORT = 3000;

// Folder where your .jml/.dom.js pages live
const SRC_DIR = path.join(__dirname, "src");

// Serve static files from the src folder (e.g., style.css, main.js)
app.use(express.static(SRC_DIR));

// Route to serve .jml or .dom.js pages
app.get("/:page", async (req, res) => {
  try {
    const pageName = req.params.page;
    const domJsonPath = path.join(SRC_DIR, `${pageName}.dom.json`);
    const domJsPath = path.join(SRC_DIR, `${pageName}.dom.js`);

    // Create jsdom environment
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
      runScripts: "outside-only",
    });

    // Expose globals BEFORE requiring DOM.min.js
    global.window = dom.window;
    global.document = dom.window.document;
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;
    global.HTMLElement = dom.window.HTMLElement;

    // Now load DOM.js (safe, because globals exist)
    const DOM = require("./DOM.min.js");

    if (fs.existsSync(domJsonPath)) {
      // Handle .dom.json
      const domJsonData = JSON.parse(fs.readFileSync(domJsonPath, "utf-8"));
      const headData = {};
      const bodyData = {};
      for (const key in domJsonData) {
        if (DOM.headTags.includes(key.toLowerCase())) {
          headData[key] = domJsonData[key];
        } else {
          bodyData[key] = domJsonData[key];
        }
      }
      DOM.set(headData, dom.window.document.head);
      DOM.set(bodyData, dom.window.document.body);
      DOM.let("visibility", "visible");
      res.send(dom.serialize());
      
    } else if (fs.existsSync(domJsPath)) {
      // Handle .dom.js
      const code = fs.readFileSync(domJsPath, "utf-8");

      // Inject DOM into context so page scripts can use it
      dom.window.DOM = DOM;

      // Run page-specific script inside this dom's VM context
      const script = new vm.Script(code);
      script.runInContext(dom.getInternalVMContext());
      DOM.let("visibility", "visible");
      res.send(dom.serialize());
    } else {
      res.status(404).send("Page not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});