// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  JSDOM
} = require("jsdom");

const app = express();
const PORT = 3000;

// Folder where your .jml pages live
const PAGES_DIR = path.join(__dirname, "pages");

// Serve static files from the pages folder
app.use(express.static(PAGES_DIR));

// Route to serve .jml pages
app.get("/:page", async (req, res) => {
  try {
    const pageName = req.params.page;
    const jmlPath = path.join(PAGES_DIR, `${pageName}.jml`);

    if (!fs.existsSync(jmlPath)) {
      return res.status(404).send("Page not found");
    }

    const jmlData = JSON.parse(fs.readFileSync(jmlPath, "utf-8"));

    // Create jsdom environment
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
      runScripts: "outside-only",
    });

    // Expose globals so DOM.min.js works
    global.window = dom.window;
    global.document = dom.window.document;
    global.Element = dom.window.Element;

    // Load your DOM.js library
    const DOM = require('./DOM.min.js'); // make sure this is required

    // apply
    DOM.set(jmlData);
    DOM.set("visible", "visibility", dom.window.document.body);

    // Send final HTML to client
    res.send(dom.serialize());

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});