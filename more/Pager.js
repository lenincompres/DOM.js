/**
 * It's a router based on DOM.js (structure)
 * @author Lenin Compres <lenincompres@gmail.com>
 * @version 1.0.3
 * @repository https://github.com/lenincompres/DOM.js
 */

class Pager {
  /**
   * Creates a Pager instance.
   * @param {object} map - Indexed pages models.
   * @param {object} hashed - Links the static pager to the window hash.
   */
  #hashed = false;
  map = {};
  default;
  constructor(map = {}) {
    this.binderSet({
      key: undefined,
      keys: [],
      arguments: [],
    });
    if (map === true) this.#hashed = true;
    else if (map) this.add(map);
    if (this.#hashed) {
      this._key.onChange(() => this.rehash());
      this._arguments.onChange(() => this.rehash());
      window.addEventListener("hashchange", () => this.hash());
      this.hash();
    }
    this._key.onChange(val => !this.hasKey(val) && (this.key = this.default));
  }
  /**
   * Updates the hash based on a hashed page's key and parameters.
   */
  hash() {
    if (!this.#hashed) return;
    let args = location.hash.substr(1).split("/");
    this.key = args.shift();
    this.arguments = args;
  }
  rehash() {
    if (!this.#hashed) return;
    location.href = `#${this.key}/${this.arguments.join("/")}`;
  }
  /**
   * Updates the hash based on a hashed page's key and parameters.
   * @param {number} i - index position of argument to bind.
   * @param {Binder} binder - binder to have value updated.
   */
  bindArgument(i, binder) {
    this._arguments.onChange(args => binder.value = args[i]);
    binder.onChange(val => {
      let args = this.arguments.map((v, j) => j == i ? val : v);
      this.arguments.join("/") !== args.join("/") && (this.arguments = args);
    });
  }
  bindArguments(...binders) {
    binders.forEach((b, i) => this.bindArgument(i, b));
  }
  /**
   * Adds an entry of page model to the pager.
   * @param {string} key - Key index of this page.
   * @param {object} content - JS model of thepage.
   */
  add(key, content) {
    if (typeof key === "string") {
      if (!this.default) this.default = key;
      this.map[key] = content;
      this.keys = [...this.keys, key];
      return;
    }
    for (const [k, value] of Object.entries(key)) {
      this.add(k, value);
    }
  }
  async load(key, url, parser = "text") {
    if (key.includes(".")) return loadMap(key);
    if (url.endsWith("json")) parser = "json";
    let response = await fetch(url).catch(err => console.error(err));
    let data = await response[parser]();
    this.add(key, data);
    if (location.hash.substr(1).split("/").shift() === key) this.hash();
  }
  async loadMap(url) {
    let response = await fetch(url).catch(err => console.error(err));
    let map = await response.json();
    this.add(map);

  }
  /**
   * Gets the JS model of the current page.
   */
  get content() {
    return this.map[this.key];
  }
  /**
   * Gets the binder for the JS model of the current page.
   */
  get _content() {
    return this._key.as(key => this.map[key]);
  }
  /**
   * Gets the links to change the pager.
   * @param {function} aFunc - Function to be assigned to the links model.
   * @returns {object} - The JS model of a list of links (ul:li:a).
   */
  getLinkMenu(aFunc = (key, i) => {}) {
    return this._keys.as(() => DOM.linkMenu(this.keys.map((key, i) => Object.assign({
      class: {
        active: this._key.as(val => val === key),
      },
      text: key,
      onclick: () => this.key = key,
    }, aFunc(key, i)))));
  }
  /**
   * Checks if a key exists in the pager.
   * @param {string} key - Key to check. 
   * @returns {boolean} - Does the key exist?
   */
  hasKey = key => this.keys.includes(key);
  /**
   * Static instace of a pager linked to the hash, meant to be the main pager of a website.
   */
  static getDefaultInstance() {
    if (Pager._defaultInstance) return Pager._defaultInstance;
    return Pager._defaultInstance = new Pager(true);
  }
  static get map() {
    return Pager.getDefaultInstance().map;
  }
  static get key() {
    return Pager.getDefaultInstance().key;
  }
  static set key(val) {
    Pager.getDefaultInstance().key = val;
  }
  static get _key() {
    return Pager.getDefaultInstance()._key;
  }
  static get keys() {
    return Pager.getDefaultInstance().keys;
  }
  static get _keys() {
    return Pager.getDefaultInstance()._keys;
  }
  static get arguments() {
    return Pager.getDefaultInstance().arguments;
  }
  static set arguments(val) {
    Pager.getDefaultInstance().arguments = val;
  }
  static get _arguments() {
    return Pager.getDefaultInstance()._arguments;
  }
  static get default() {
    return Pager.getDefaultInstance().default;
  }
  static get content() {
    return Pager.getDefaultInstance().content;
  }
  static get _content() {
    return Pager.getDefaultInstance()._content;
  }
  static add = (...args) => Pager.getDefaultInstance().add(...args);
  static load = (...args) => Pager.getDefaultInstance().load(...args);
  static hasKey = (key) => Pager.getDefaultInstance().hasKey(key);
  static _map = (...args) => Pager.getDefaultInstance()._map(...args);
  static getLinkMenu = (...args) => Pager.getDefaultInstance().getLinkMenu(...args);
  static bindArgument = (...args) => Pager.getDefaultInstance().bindArgument(...args);
  static bindArguments = (...args) => Pager.getDefaultInstance().bindArguments(...args);
}

export default Pager;
