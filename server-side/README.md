# DOM.js Server-Side Setup

This repository contains a server-side implementation of [DOM.js](https://github.com/lenincompres/DOM.js) allowing `.dom.json` and `.dom.js` pages to be pre-rendered into HTML and served via Express.

---

## Folder Structure

```
/repo-root
├─ build/              # Generated HTML and copied static assets
├─ src/                # Source .dom.js, .dom.json pages, CSS, JS, images
├─ DOM.min.js          # Minified DOM.js library
├─ build.js            # Script to generate build/
├─ server.js           # Express server to serve pages
├─ package.json
└─ README.md
```

* `src/` contains your page definitions and static assets.
* `build/` is automatically created by `build.js` and contains rendered HTML and copied assets.

---

## Installation

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/DOM.js-server.git
cd DOM.js-server
```

2. **Install dependencies**:

```bash
npm install express jsdom
```

---

## Build Pages

To render all `.dom.json` and `.dom.js` pages in `src/` into HTML in `build/`:

```bash
node build.js
```

This will:

* Convert `.dom.json` and `.dom.js` pages into `.html`.
* Copy all other static assets (CSS, JS, images) from `src/` to `build/`.

---

## Run Server

Start the Express server to serve pages from `src/`:

```bash
node server.js
```

By default, the server runs on [http://localhost:3000](http://localhost:3000).

* Pages are served at `http://localhost:3000/<page-name>`
* For example, `src/home.dom.json` → `http://localhost:3000/home`

---

## Development Notes

* **Server vs. Client**: DOM.js will detect if it is running server-side and skip unnecessary visibility toggling.
* **Globals**: `window`, `document`, and DOM-related classes are exposed for server-side rendering.
* **Static Assets**: Any CSS, JS, or images in `src/` are automatically copied to `build/`.

---

## Adding Pages

* `.dom.json`: JSON representation of your page elements.
* `.dom.js`: JavaScript code that manipulates the DOM using DOM.js.
* All generated pages will become `.html` files in `build/`.

---

## Example

`src/home.dom.js`:

```js
const pageTitle = "Home Page";

DOM.set({
  title: pageTitle,
  h1: "Welcome to DOM.js Server",
  p: "This page was rendered server-side.",
});

console.log("Built with DOM.js");
```

## Example

`src/home.dom.json`:

```json
{
  "title": "Home Page",
  "h1": "Welcome to DOM.js Server",
  "p": "This page was rendered server-side."
}
```

Build and serve:

```bash
node build.js
node server.js
```

Visit [http://localhost:3000/home](http://localhost:3000/home) to see the page.

---

## License

MIT License
