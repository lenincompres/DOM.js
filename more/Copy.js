/**
 * Class that stores the copy text and retrieves the appropriate language copy (text) from a map given a key.
 * @author Lenin Compres <lenincompres@gmail.com>
 * @version 1.0.4
 * @repository https://github.com/lenincompres/DOM.js
 */

 class Copy {
  #map = {};
  #key;
  #indexMap = {};
  #KEY = {};
  at = {};

  /** 
   * Creates an instance of a copy.
   * @param {object} map - {
      key0: Text in only language,
      key1: {
        en: "Text in English",
        es: "Texto en español",
      },
      key2: [{
        en: "Text in English",
        es: "Texto en español",
      }, {
        en: "Next text in English",
        es: "Texto siguiente en español",
      }]
    }
   * */
  constructor(map = {}) {
    this.#map = map;
    this.#key = this.keys[0];
  }

  /**
   * @return {array} - All the keys in the copy.
   */
  get keys() {
    return Object.keys(this.#map);
  }

  /**
   * @return {array} - All the languages in the copy.
   */
  get langs() {
    let langs = [];
    let values = [];
    Object.values(this.#map).forEach(entry => Array.isArray(entry) ? entry.forEach(e => values.push(e)) : values.push(entry));
    values = values.filter(entry => typeof entry !== "string")
    values.forEach(entry => Object.keys(entry).forEach(code => !langs.includes(code) && langs.push(code)));
    return langs.map(code => Copy.LANG[code]);
  }

  /**
   * Adds an entry to the copy map
   * @param {string} key - Key to access this text.
   * @param {string} val - Text.
   * @returns {string} - Text added, in the appropriate language, if any.
   */
  add(key, val) {
    if (typeof key !== "string") return Object.entries(key).forEach(([k, v]) => this.add(k, v));
    if (this.#map[key]) return console.error(`Key "${key}" already exists in copy.`);
    this.#map[key] = val;
    this.#KEY[key] = key;
    this.at[key] =  this.get(key);
    return this;
  }

  /**
   * Gets the text based on key, array index and language.
   * @param {string} key - Key of text to retrieve.
   * @param {number} i - Index to retrieve, if that key has an array.
   * @return {string} - Text copy in the appropriate key and index.
   */
  get(...args) {
    let argsType = DOM.typify(...args);
    let key = argsType.string;
    let i = argsType.number ? argsType.number : 0;
    let vars = argsType.array;
    if (key === undefined) return console.error("No key was passed to the copy.");
    let val = this.#map[key];
    if (val === undefined) return console.error(`Key "${key}" not found in copy.`);
    this.#key = key;
    let lang = Copy.lang;
    if (val[lang]) return Copy.treat(val[lang], vars);
    if (typeof val === "string") return Copy.treat(val, vars);
    if (!Array.isArray(val)) {
      console.error(`Language "${lang}" not found in copy at "${key}".`);
      return Copy.treat(val[Object.keys(val)[0]], vars);
    }
    val = val[i];
    if (val === undefined) return console.error(`No copy text found at: ${key}[${i}].`);
    this.#indexMap[key] = i;
    if (val[lang]) return Copy.treat(val[lang], vars);
    if (typeof val === "string") return Copy.treat(val, vars);
    console.error(`Language "${lang}" not found in copy at: ${key}[${i}].`);
    return Copy.treat(val[Object.keys(val)[0]], vars);
  }

  /**
   * @return {Object} - The next text of the last key retrieved, if it has an array.
   */
  next = () => this.get(this.#key, this.#indexMap[this.#key] + 1);

  /**
   * @return {Object} - JS model of links to toggle the page's language.
   */
  getToggleLink = (...langs) => (langs ? langs : this.langs).map(lang => ({
    display: Copy.lang !== lang.code ? "block" : "none",
    text: lang.name,
    href: "#",
    onclick: () => Copy.lang = lang.code,
  }));

  /**
   * @return {Object} - JS model with a ul of li's with links to toggle the page's language.
   */
  getLinkMenu = (...langs) => DOM.linkMenu((langs ? langs : this.langs).map(lang => ({
    class: {
      selected: Copy.lang === lang.code,
    },
    text: lang.name,
    href: "#",
    onclick: () => Copy.lang = lang.code,
  })));

  /**
   * @return {Object} - JS model to select with options to change the page's language.
   */
  getSelect = () => ({
    option: this.langs.map(lang => ({
      selected: Copy.lang === lang.code ? true : undefined,
      value: lang.code,
      text: lang.name,
    })),
    onchange: e => Copy.lang = e.target.value,
  });

  /**
   * Treats the text as to add any fixes. So 
   * @param {string} str - Text to be treated.
   * @param {array} str - Texts to be treated.
   * @param {array} vars - values to replace $0, $1, $2...
   * @return {str} - Treated text.
   * @return {array} - Array of treated texts.
   */
  static treat(str, vars = []) {
    if (!str) return str;
    if (Array.isArray(str)) return str.map(i => Copy.treat(i));
    str = str.replaceAll("—", '<em class="em-dash">--</em>');
    if (vars.length) vars.forEach((v, i) => str = str.replaceAll(`%${i}`, v));
    return str;
  }

  /**
   * Selects the text from the given map in the appropriate language.
   * @param {object} map - A map the copy text from which to select the one in the appropriate language.
   */
  static text = (map) => Copy.treat(map[Copy.lang]);

  /**
   * Name to be used to saves chosen language in the local storage.
   */
  static storageKey = "DOM-copy-lang";

  /**
   * Access to languages codes and proper keys.
   */
  static LANG = {
    es: {
      code: "es",
      name: "Español",
    },
    en: {
      code: "en",
      name: "English",
    },
  }

  /**
   * Sets the language to be used when retrieving copy, and saves it in the local storage.
   */
  static set lang(val) {
    localStorage.setItem(Copy.storageKey, val);
    location.reload();
  }

  /**
   * Gets the current language code from the logal storage ot navigator.
   */
  static get lang() {
    let lang = "en"; //Copy.LANG.en.code;
    if (navigator && navigator.language) lang = navigator.language.split("-")[0];
    let savedLang = localStorage.getItem(Copy.storageKey);;
    if (savedLang) lang = savedLang;
    return lang;
  }

  /**
   *  This is a static instance of Copy, that can be used if you site only need one copy instance to hodl it's text.
   */
  static getDefaultInstance() {
    if (Copy._defaultInstance) return Copy._defaultInstance;
    return Copy._defaultInstance = new Copy();
  }
  static get keys() {
    return Copy.getDefaultInstance().keys;
  }
  static get KEY() {
    return Copy.getDefaultInstance().#KEY;
  }
  static get at() {
    return Copy.getDefaultInstance().at;
  }
  static add = (...args) => Copy.getDefaultInstance().add(...args);
  static get = (...args) => Copy.getDefaultInstance().get(...args);
  static next = () => Copy.getDefaultInstance().next();
  static getToggleLink = (...langs) => Copy.getDefaultInstance().getToggleLink(...langs);
  static getLinkMenu = (...langs) => Copy.getDefaultInstance().getLinkMenu(...langs);
  static getSelect = () => Copy.getDefaultInstance().getSelect();
}

/**
 * Browser readers don't handle em-dashes(—) correctly. This css, together with the treat method, allows writting copy with double dashes (--) and displays them as em-dashes, having readers read appropriately.
 */
DOM.css({
  "em.em-dash": {
    display: "inline-block",
    width: "0.7em",
    height: "1em",
    overflow: "hidden",
    before: {
      content: "—",
    },
  },
});

/**
 * Sets the page's html property lang to the one stored
 */
document.documentElement.let("lang", Copy.lang);

export default Copy;
