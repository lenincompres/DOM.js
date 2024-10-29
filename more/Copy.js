/*  
  This class return text from the map content given to it.
  There are several way copy can be indexed.

  map = {
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
*/

class Copy {

  constructor(map = {}) {
    this.map = map;
    this.lang = Copy.lang;
    this.key = Object.keys(this.map)[0];
    this.counter = {};
    this.KEY = {};
  }

  add(key, val) {
    if (typeof key !== "string") {
      return Object.entries(key).forEach(([k, v]) => this.add(k, v));
    }
    if (this.map[key]) {
      console.error(`Key "${key}" already exists in copy.`);
      return "sd";
    }
    this.map[key] = val;
    this.KEY[key] = key;
    return this.get(key);
  }

  // returns the text based on key, array index and language
  get(key, i) {
    if (key === undefined) {
      console.error("No key was passed to the copy.");
    };
    let val = this.map[key];
    if (val === undefined) {
      console.error(`Key "${key}" not found in copy.`);
      return "";
    }
    this.key = key;
    let lang = this.lang;
    if (val[lang]) return Copy.treat(val[lang]);
    if (typeof val === "string") return Copy.treat(val);
    if (!Array.isArray(val)) {
      console.error(`Language "${lang}" not found in copy at "${key}".`);
      return Copy.treat(val[Object.keys(val)[0]]);
    }
    if (i === undefined) i = 0;
    val = val[i];
    if (val === undefined) return "";
    this.counter[key] = i;
    if (val[lang]) return Copy.treat(val[lang]);
    if (typeof val === "string") return Copy.treat(val);
    console.error(`Language "${lang}" not found in copy at "${key}[${i}]".`);
    return Copy.treat(val[Object.keys(val)[0]]);
  }

  static treat(s) {
    if (!s) return s;
    if (Array.isArray(s)) return s.map(i => Copy.treat(i));
    //if(s.includes("\n")) return Copy.treat(s.split("\n"));
    return s.replaceAll("—", '<em class="em-dash">--</em>');
  }

  next() {
    let i = this.counter[this.key];
    i = i === undefined ? 0 : i + 1;
    return this.get(this.key, i);
  }

  static copy = new Copy();

  static add(...args) {
    return Copy.copy.add(...args);
  }

  static get(...args) {
    return Copy.copy.get(...args);
  }

  static next() {
    return Copy.copy.next();
  }

  static text(map){
    return map[Copy.lang];
  }

  static set lang(val) {
    localStorage.setItem("copy-lang", val);
    location.reload();
  }

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

  static get KEY(){
    return Copy.copy.KEY;
  }

  static addKey(...keys) {
    keys.forEach(key => {
      if(Copy.KEY[key]) console.error(`Copy KEY ${key} already exists.`);
      else Copy.copy.KEY[key] = key;
    });
  }

  static get lang() {
    let lang = "en"; //Copy.LANG.EN.code;
    if (navigator && navigator.language) {
      lang = navigator.language.split("-")[0];
    }
    let savedLang = localStorage.getItem("copy-lang");;
    if (savedLang) {
      lang = savedLang;
    }
    return lang;
  }

  static getToggleLink(...langs) {
    return langs.map(lang => ({
      display: Copy.lang !== lang.code ? "block" : "none",
      text: lang.name,
      click: () => Copy.lang = lang.code,
    }))
  }

}

export default Copy;

// set the page's html property lang to the one stored
DOM.let("lang", Copy.lang);
