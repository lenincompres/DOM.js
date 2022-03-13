/**
 * Creates DOM structures from a JS object (structure)
 * @author Lenin Compres <lenincompres@gmail.com>
 * @version 1.0.26
 * @repository https://github.com/lenincompres/DOM.js
 */

 Element.prototype.get = function (station) {
  if (!station && this.tagName.toLocaleLowerCase() === "input") return this.value;
  if (!station || ["content", "inner", "innerhtml", "html"].includes(station)) return this.innerHTML;
  if (["text"].includes(station)) return this.innerText;
  if (["outer", "self"].includes(station)) return this.outerHTML;
  if (DOM.attributes.includes(station)) return this.getAttribute(station);
  if (DOM.isStyle(station, this)) return this.style[station];
  let output = station ? this[station] : this.value;
  if (output !== undefined && output !== null) return output;
  if (!station) return this.innerHTML;
  output = [...this.querySelectorAll(":scope>" + station)];
  if (output.length) return output.length < 2 ? output[0] : output;
  output = [...this.querySelectorAll(station)];
  if (output.length) return output;
}

Element.prototype.set = function (model, ...args) {
  if ([null, undefined].includes(model)) return;
  let contentType = DOM.typify(model.content);
  if (contentType.p5Element || contentType.element) {
    let elt = contentType.element ? contentType.element : contentType.p5Element.elt;
    this.set(elt, ...args);
    return Object.keys(model).filter(k => k !== "content").forEach(k => elt.set(model[k], k, ...args));
  }
  if (Array.isArray(model.content)) return model.content.forEach(item => {
    if ([null, undefined].includes(item)) return;
    let individual = Object.assign({}, model);
    individual.content = item;
    this.set(individual, ...args);
  });
  let modelType = DOM.typify(model);
  const TAG = this.tagName.toLowerCase();
  const IS_HEAD = TAG === "head";
  let argsType = DOM.typify(...args);
  const IS_PRIMITIVE = modelType.isPrimitive;
  let station = argsType.string; // original style|attr|tag|inner…|on…|name
  const CLEAR = argsType.boolean === true || !station && IS_PRIMITIVE || station === "content";
  if ([undefined, "create", "assign", "model", "inner", "set"].includes(station)) station = "content";
  const STATION = station;
  station = station.toLowerCase(); // station lowercase
  if (station === "content" && TAG === "meta") station = "*content"; // disambiguate
  if (DOM.reserveStations.includes(station)) return;
  const IS_CONTENT = station === "content";
  const IS_LISTENER = DOM.listeners.includes(station);
  const p5Elem = argsType.p5Element;
  if (modelType.function) {
    if (DOM.typify(STATION).event) return this.addEventListener(STATION, e => model(e, this));
    else if (p5Elem && typeof p5Elem[STATION] === "function") return p5Elem[STATION](e => model(e, this));
    else return this[STATION] = e => model(e, this);
  }
  if (model._bonds) model = model.bind();
  if (model.binders) return model.binders.forEach(binder => binder.bind(this, STATION, model.onvalue, model.listener));
  if (station === "css") {
    const getID = elt => {
      if (elt.id) return elt.id;
      if (!window.domids) window.domids = [];
      let id = "domid" + window.domids.length;
      elt.setAttribute("id", id);
      window.domids.push(id);
      return id;
    };
    if (![document.head, document.body].includes(this)) model = {
      [`#${getID(this)}`]: model,
    };
    return document.head.set(typeof model === "string" ? model : DOM.css(model), "style");
  }
  if (["text", "innertext"].includes(station)) return this.innerText = model;
  if (["html", "innerhtml"].includes(station)) return this.innerHTML = model;
  if (IS_HEAD) {
    if (station === "font" && modelType.object) return DOM.set({
      fontFace: model
    }, "css");
    if (station === "style" && !model.content) return this.set({
      content: typeof model === "string" ? model : DOM.css(style)
    }, station);
    if (station === "keywords" && Array.isArray(model)) model = model.join(",");
    if (station === "viewport" && modelType.object) model = Object.entries(model).map(([key, value]) => `${DOM.unCamelize(key)}=${value}`).join(",");
    modelType = DOM.typify(model);
  }
  let [tag, ...cls] = STATION.split("_");
  if (STATION.includes(".")) {
    cls = STATION.split(".");
    tag = cls.shift();
  }
  cls = cls.filter(c => c !== null && isNaN(c));
  let id;
  if (tag.includes("#"))[tag, id] = tag.split("#");
  let lowTag = (model.tag ? model.tag : tag).toLowerCase();
  // camelCase tags are interpreted as id
  if (lowTag != tag && tag[0] === tag[0].toLowerCase()) {
    id = tag;
    tag = "section";
  }
  tag = lowTag;
  if (model.id) id = model.id;
  let elt = modelType.p5Element ? model.elt : modelType.element;
  if (elt) {
    if (id) DOM.addID(id, elt);
    else if (tag != elt.tagName.toLowerCase()) DOM.addID(tag, elt);
    if (CLEAR) this.innerHTML = "";
    if (cls.length) elt.classList.add(...cls);
    return this.append(elt);
  }
  if (station === "script" && IS_PRIMITIVE) return this.set({
    script: {
      src: model
    }
  });
  if (TAG === "style" && !model.content && !IS_PRIMITIVE) model = DOM.css(model);
  if (IS_CONTENT && !model.binders) {
    if (CLEAR) this.innerHTML = "";
    if (IS_PRIMITIVE) return TAG === "input" ? this.value = model : this.innerHTML += model;
    if (Array.isArray(model)) return model.forEach(m => this.set(m));
    Object.keys(model).forEach(key => this.set(model[key], key, p5Elem));
    return this;
  }
  if (modelType.array) {
    if (station === "class") return model.forEach(c => {
      if (!c) return;
      this.classList.add(c);
    });
    if (IS_LISTENER) return this.addEventListener(...model);
    let map = model.map(m => this.set(m, [tag, ...cls].join("."), p5Elem));
    if (id) DOM.addID(id, map);
    return map;
  }
  if (IS_LISTENER) {
    if (model.event) model.type = model.event;
    if (model.function) model.listener = model.function;
    if (model.method) model.listener = model.method;
    if (model.call) model.listener = model.call;
    if (model.options) return this.addEventListener(model.type, model.listener, model.options);
    return this.addEventListener(model.type, model.listener, model.useCapture, model.wantsUntrusted);
  }
  if (station === "style") {
    if (IS_PRIMITIVE && !IS_HEAD) return this.setAttribute(station, model);
    if (!model.content) {
      if (CLEAR) this.setAttribute(station, "");
      return Object.entries(model).forEach(([key, value]) => this.set(value, key));
    }
    if (DOM.typify(model.content).object) model.content = DOM.css(model.content);
  }
  if (IS_PRIMITIVE) {
    if (IS_HEAD) {
      if (station === "title") return this.innerHTML += `<title>${model}</title>`;
      if (station === "icon") return this.innerHTML += `<link rel="icon" href="${model}">`;
      if (station === "image") return this.innerHTML += `<meta property="og:image" content="${model}">`;
      if (station === "charset") return this.innerHTML += `<meta charset="${model}">`;
      if (DOM.metaNames.includes(station)) return this.innerHTML += `<meta name="${station}" content="${model}">`;
      if (DOM.htmlEquivs.includes(STATION)) return this.innerHTML += `<meta http-equiv="${DOM.unCamelize(STATION)}" content="${model}">`;
      if (station === "font") return DOM.set({
        fontFace: {
          fontFamily: model.split("/").pop().split(".")[0],
          src: model.startsWith("url") ? model : `url(${model})`
        }
      }, "css");
      const type = DOM.getDocType(model);
      if (station === "link") return this.set({
        rel: type,
        href: model
      }, station);
      if (station === "script") return this.set({
        type: type,
        src: model
      }, station);
    }
    let done = DOM.isStyle(STATION, this) ? this.style[STATION] = model : undefined;
    if (DOM.typify(STATION).attribute || station.includes("*")) done = !this.setAttribute(station.replace("*", ""), model);
    if (station === "id") DOM.addID(model, this);
    if (done !== undefined) return;
  }
  let elem = (model.tagName || model.elt) ? model : false;
  if (!elem) {
    if (tag && tag.length) tag = tag.replace("*", "");
    if (!tag || !isNaN(tag) || !tag.length) tag = "section";
    elem = p5Elem ? createElement(tag) : document.createElement(tag);
    elem.set(model, p5Elem);
  }
  elt = p5Elem ? elem.elt : elem;
  if (cls.length) elt.classList.add(...cls);
  if (id) elt.setAttribute("id", id);
  this.append(elt);
  ["ready", "onready", "done", "ondone"].forEach(f => {
    if (!model[f]) return;
    model[f](elem);
  });
  if (argsType.functions) argsType.functions.forEach(f => f(elem));
  return elem;
};

// Adds set method to P5 elements
if (typeof p5 !== "undefined") {
  p5.set = (...args) => DOM.set(...args, createDiv());
  p5.Element.prototype.set = function (...args) {
    return this.elt.set(...args, this);
  }
}

// Adds css to the head under the element"s ID
Element.prototype.css = function (style) {
  if ([document.head, document.body].includes(this)) return typeof style === "string" ? document.head.set({
    content: style
  }, "style") : DOM.set(DOM.css(style), "css");
  let id = this.id;
  if (!id) {
    if (!window.domids) window.domids = [];
    id = "domid" + window.domids.length;
    this.setAttribute("id", id);
    window.domids.push(id);
  }
  DOM.set({
    [`#${id}`]: style,
  }, "css");
}

// Update props of bound element when its value changes. Can also update other binders.
class Binder {
  constructor(val) {
    this._value = val;
    this._bonds = [];
    this._listeners = {};
    this._listenerCount = 0;
    this.onvalue = v => v;
    this.update = bond => {
      if (!bond.target) return;
      let theirValue = bond.onvalue(this._value);
      if (bond.target.tagName) return bond.target.set(theirValue, bond.station);
      if (bond.target._bonds) bond.target.setter = this; // knowing the setter prevents co-binder"s loop
      bond.target[bond.station] = theirValue;
    }
  }
  addListener(func) {
    if (typeof func !== "function") return;
    this._listeners[this._listenerCount] = func;
    return this._listenerCount++;
  }
  removeListener(countIndex) {
    delete this._listeners[countIndex];
  }
  bind(...args) {
    let argsType = DOM.typify(...args);
    let target = argsType.element ? argsType.element : argsType.binder;
    let station = argsType.string ? argsType.string : "value";
    let onvalue = argsType.function ? argsType.function : v => v;
    let listener = argsType.number;
    let values = argsType.array;
    let model = argsType.object;
    if (values && values.length) {
      if (values.length === 2) onvalue = v => v ? values[1] : values[0];
      else onvalue = v => values[v] !== undefined ? values[v] : "";
    } else if (model && model !== target) onvalue = v => model[v] !== undefined ? model[v] : model.default !== undefined ? model.default : model.false;
    if (!target) return DOM.bind(this, onvalue, this.addListener(onvalue)); // bind() addListener if not in a model
    if (listener) this.removeListener(listener); // if in a model, removes the listener
    let bond = {
      binder: this,
      target: target,
      station: station,
      onvalue: onvalue,
    }
    this._bonds.push(bond);
    this.update(bond);
  }
  flash(values, delay = 1000, revert = true) { //Iterates through values. Reverts to the intital
    if (!Array.isArray(values)) values = [values];
    if (!Array.isArray(delay)) delay = new Array(values.length).fill(delay);
    let oldValue = this.value;
    this.value = values.shift();
    setTimeout(_ => {
      if (values.length) return this.flash(values, delay, false);
      if (revert === true) return this.value = oldValue;
    }, delay.shift());
  }
  set value(val) {
    this._value = val;
    this._bonds.forEach(bond => {
      if (bond.target === this.setter) return;
      this.update(bond);
    });
    this.onvalue(val);
    Object.values(this._listeners).forEach(func => func(val));
    this.setter = undefined;
  }
  get value() {
    return this._value;
  }
}

// global static methods to handle the DOM
class DOM {
  // returns value based on 
  static get(station, ...args) {
    // checks if meant to get from an element
    let argsType = DOM.typify(...args);
    let elt = argsType.element ? argsType.element : argsType.p5Element;
    if (elt) return elt.get(model);
    // checks if the station belongs to the head
    DOM.headTags.includes(station.toLowerCase()) ? document.head.get(station) : document.body.get(station);
  }
  // create elements based on an object model
  static set(model = "", ...args) {
    // checks if the model is meant for an element
    let argsType = DOM.typify(...args);
    let elt = argsType.element ? argsType.element : argsType.p5Element;
    if (elt) return elt.set(model, ...args);
    // hidden models with css for a split second 
    if (model.css) {
      DOM.set(model.css, "css");
      delete model.css;
      model.visibility = "hidden";
      setTimeout(() => DOM.set("visible", "visibility"), 600);
    }
    // checks if the model is meant for the head
    let headModel = {};
    Object.keys(model).forEach(key => {
      if (!DOM.headTags.includes(key.toLowerCase())) return;
      headModel[key] = model[key];
      delete model[key];
    });
    document.head.set(headModel);
    // checks if the model requires a new element
    if (DOM.typify(model).isPrimitive || Array.isArray(model) && !argsType.string) args.push("section");
    if (model.tag) args.push(model.tag);
    // checks if the model should replace the DOM
    if (argsType.boolean) document.body.innerHTML = "";
    // checks if the body is loaded
    if (document.body) return document.body.set(model, ...args);
    // waits for the body to load
    window.addEventListener("load", _ => document.body.set(model, ...args));
  }
  // returns a new element without appending it to the DOM
  static element = (model, tag = "section") => DOM.set(model, tag, elt => elt.remove());
  // returns a new binder
  static binder(value, ...args) {
    let binder = new Binder(value);
    if (args.length) binder.bind(...args);
    return binder;
  }
  // returns a bind for element"s props to use ONLY in a set() model
  static bind(binders, onvalue = v => v, listener) {
    if (!Array.isArray(binders)) binders = [binders];
    if (binders.some(binder => !Array.isArray(binder._bonds))) return console.log(binders, "Non-binder found.");
    return {
      listener: listener,
      binders: binders,
      onvalue: _ => onvalue(...binders.map(binder => binder.value))
    }
  }
  // converts JSON to CSS. Supports nesting. Turns "_" in selectors into ".". Preceding "__" assumes class on previous selector. Trailing "_" assumes immediate children (>).
  static css(sel, model) {
    if (!sel) return;
    const assignAll = (arr = [], dest = {}) => {
      arr.forEach(prop => Object.assign(dest, prop));
      return dest;
    }
    if (typeof sel !== "string") {
      if (!sel) return;
      if (Array.isArray(sel)) sel = assignAll(sel);
      if (sel.tag || sel.id || sel.class) return DOM.css(sel.tag ? sel.tag : "", sel);
      return Object.entries(sel).map(([key, value]) => DOM.css(key, value)).join(" ");
    }
    let extra = [];
    let cls = sel.split("_");
    sel = cls.shift();
    if (sel === "h") {
      cls = cls.length ? ("." + cls.join(".")) : "";
      sel = Array(6).fill().map((_, i) => "h" + (i + 1) + cls).join(", ");
      cls = [];
    }
    if (sel.toLowerCase() === "fontface") sel = "@font-face";
    if (sel === "src" && !model.startsWith("url")) model = `url(${model})`;
    if (DOM.typify(model).isPrimitive) return `${DOM.unCamelize(sel)}: ${model};\n`;
    if (Array.isArray(model)) return model.map(m => DOM.css(sel, m)).join(" ");
    if (model.class) cls.push(...model.class.split(" "));
    if (model.id) sel += "#" + model.id;
    delete model.class;
    delete model.id;
    if (cls.length) sel += "." + cls.join(".");
    let css = Object.entries(model).map(([key, style]) => {
      if (style === undefined || style === null) return;
      if (DOM.typify(style).isPrimitive) return DOM.css(key, style);
      let sub = DOM.unCamelize(key.split("(")[0]);
      let xSel = `${sel} ${key}`;
      let subType = DOM.typify(sub);
      if (subType.pseudoClass) xSel = `${sel}:${sub}`;
      else if (subType.pseudoElement) xSel = `${sel}::${sub}`;
      else {
        if (key.startsWith("__")) xSel = `${sel}${sub.substring(1)}`;
        else if (key.startsWith(">")) xSel = `${sel}>${sub.substring(1)}`;
        else if (key.endsWith("_")) xSel = `${sel}>${sub.substring(0,sub.length-1)}`;
      }
      delete style.all;
      extra.push(DOM.css(xSel, style));
    }).join(" ");
    return (css ? `\n${sel} {\n ${css}}` : "") + extra.join(" ");
  }
  // adds styles to the head as global CSS
  static style = model => DOM.set(model, "css");
  // returns html based on a model
  static html = (model, tag = "section") => !model ? null : (model.tagName ? model : DOM.element(model, tag)).outerHTML;
  // returns querystring as a structural object 
  static querystring = () => {
    var qs = location.search.substring(1);
    if (!qs) return Object();
    if (qs.includes("=")) return JSON.parse("{\"" + decodeURI(location.search.substring(1)).replace(/"/g, "\\\"").replace(/&/g, "", "").replace(/=/g, "\":\"") + "\"}");
    return qs.split("/");
  }
  static addID = (id, elt) => {
    if (Array.isArray(elt)) return elt.forEach(e => DOM.addID(id, e));
    if (!window[id]) return window[id] = elt;
    if (Array.isArray(window[id])) return window[id].push(elt);
    window[id] = [window[id], elt];
  };
  // returns objects with all value types
  static typify = (...args) => {
    if (args === undefined) return;
    let output = {};
    args.forEach(item => {
      let type = typeof item;
      if (type === "string") {
        output.strings ? output.strings.push(item) : output.strings = [item];
        if (DOM.events.includes(item)) output.events ? output.events.push(item) : output.events = [item];
        if (DOM.attributes.includes(item)) output.attributes ? output.attributes.push(item) : output.attributes = [item];
        if (DOM.pseudoClasses.includes(item)) output.pseudoClasses ? output.pseudoClasses.push(item) : output.pseudoClasses = [item];
        if (DOM.pseudoElements.includes(item)) output.pseudoElements ? output.pseudoElements.push(item) : output.pseudoElements = [item];
        if (DOM.isStyle(item)) output.styles ? output.styles.push(item) : output.styles = [item];
      }
      if (type === "number") output.numbers ? output.numbers.push(item) : output.numbers = [item];
      if (type === "boolean") output.booleans ? output.booleans.push(item) : output.booleans = [item];
      if (["boolean", "number", "string"].includes(type)) return output.primitives ? output.primitives.push(item) : output.primitives = [item];
      if (type === "function") return output.functions ? output.functions.push(item) : output.functions = [item];
      if (Array.isArray(item)) return output.arrays ? output.arrays.push(item) : output.arrays = [item];
      if (item) {
        output.objects ? output.objects.push(item) : output.objects = [item];
        if (item.tagName) return output.elements ? output.elements.push(item) : output.elements = [item];
        if (item.elt) return output.p5Elements ? output.p5Elements.push(item) : output.p5Elements = [item];
        if (item._bonds) return output.binders ? output.binders.push(item) : output.binders = [item];
      }
    });
    output.isPrimitive = !!output.primitives;
    if (output.strings) output.string = output.strings[0];
    if (output.numbers) output.number = output.numbers[0];
    if (output.booleans) output.boolean = output.booleans[0];
    if (output.primitives) output.primitive = output.primitives[0];
    if (output.arrays) output.array = output.arrays[0];
    if (output.functions) output.function = output.functions[0];
    if (output.objects) output.object = output.objects[0];
    if (output.elements) output.element = output.elements[0];
    if (output.p5Elements) output.p5Element = output.p5Elements[0];
    if (output.binders) output.binder = output.binders[0];
    if (output.events) output.event = output.events[0];
    if (output.attributes) output.attribute = output.attributes[0];
    if (output.pseudoClasses) output.pseudoClass = output.pseudoClasses[0];
    if (output.pseudoElements) output.pseudoElement = output.pseudoElements[0];
    if (output.styles) output.style = output.styles[0];
    return output;
  };
  static camelize = str => str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
  static unCamelize = (str, char = "-") => str.replace(/([A-Z])/g, char + "$1").toLowerCase();
  static isStyle = (str, elt) => ((elt ? elt : document.body ? document.body : document.createElement("section")).style)[str] !== undefined;
  static events = ["abort", "afterprint", "animationend", "animationiteration", "animationstart", "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change", "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended", "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "offline", "online", "open", "pagehide", "pageshow", "paste", "pause", "play", "playing", "progress", "ratechange", "resize", "reset", "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "unload", "volumechange", "waiting", "wheel"];
  static attributes = ["accept", "accept-charset", "accesskey", "action", "align", "alt", "async", "autocomplete", "autofocus", "autoplay", "bgcolor", "border", "charset", "checked", "cite", "class", "color", "cols", "colspan", "content", "contenteditable", "controls", "coords", "data", "datetime", "default", "defer", "dir", "dirname", "disabled", "download", "draggable", "enctype", "for", "form", "formaction", "headers", "height", "hidden", "high", "href", "hreflang", "http-equiv", "id", "ismap", "kind", "lang", "list", "loop", "low", "max", "maxlength", "media", "method", "min", "multiple", "muted", "name", "novalidate", "open", "optimum", "pattern", "placeholder", "poster", "preload", "readonly", "rel", "required", "reversed", "rows", "rowspan", "sandbox", "scope", "selected", "shape", "size", "sizes", "spellcheck", "src", "srcdoc", "srclang", "srcset", "start", "step", "style", "tabindex", "target", "title", "translate", "type", "usemap", "value", "wrap", "width"];
  static pseudoClasses = ["active", "checked", "disabled", "empty", "enabled", "first-child", "last-child", "first-of-type", "focus", "hover", "in-range", "invalid", "last-of-type", "link", "only-of-type", "only-child", "optional", "out-of-range", "read-only", "read-write", "required", "root", "target", "valid", "visited", "lang", "not", "nth-child", "nth-last-child", "nth-last-of-type", "nth-of-type"];
  static pseudoElements = ["after", "before", "first-letter", "first-line", "selection"];
  static metaNames = ["viewport", "keywords", "description", "author", "refresh", "application-name", "generator"];
  static htmlEquivs = ["contentSecurityPolicy", "contentType", "defaultStyle", "content-security-policy", "content-type", "default-style", "refresh"];
  static headTags = ["meta", "link", "title", "font", "icon", "image", ...DOM.metaNames, ...DOM.htmlEquivs];
  static reserveStations = ["tag", "id", "onready", "ready", "done", "ondone"];
  static listeners = ["addevent", "addeventlistener", "eventlistener", "listener", "on"];
  static getDocType = str => typeof str === "string" ? new Object({
    css: "stylesheet",
    sass: "stylesheet/sass",
    scss: "stylesheet/scss",
    less: "stylesheet/less",
    js: "text/javascript",
    ico: "icon"
  })[str.split(".").pop()] : undefined;
}

// resets the CSS
DOM.set({
  "*": {
    boxSizing: "border-box",
    verticalAlign: "baseline",
    lineHeight: "1.25em",
    margin: 0,
    padding: 0,
    border: 0,
    borderSpacing: 0,
    borderCollapse: "collapse",
    listStyle: "none",
    quotes: "none",
    content: "none",
    backgroundColor: "transparent",
    fontSize: "100%",
    font: "inherit"
  },
  "article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section": {
    display: "block",
  },
  body: {
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  },
  "b, strong": {
    fontWeight: "bold",
  },
  "i, em": {
    fontStyle: "italic",
  },
  a: {
    textDecoration: "none",
    cursor: "pointer",
  },
  "input, button, select": {
    padding: "0.2em",
    borderRadius: "0.25em",
    border: "solid 1px gray",
    backgroundColor: "white",
  },
  "button, input[type=\"button\"], input[type=\"submit\"]": {
    cursor: "pointer",
    borderColor: "gray",
    paddingLeft: "1em",
    paddingRight: "1em",
    backgroundColor: "#eee",
    boxShadow: "0.5px 0.5px 1px black",
  },
  "button:active, input[type=\"button\"]:active, input[type=\"submit\"]:active": {
    boxShadow: "none",
  },
  "ol, ul": {
    listStyle: "none",
  },
  "blockquote, q": {
    quotes: "none",
    before: {
      content: "",
    },
    after: {
      content: "",
    }
  },
  table: {
    borderCollapse: "collapse",
    borderSpacing: 0,
  },
  h1: {
    fontSize: "2em",
  },
  h2: {
    fontSize: "1.82em",
  },
  h3: {
    fontSize: "1.67em",
  },
  h4: {
    fontSize: "1.5em",
  },
  h5: {
    fontSize: "1.33em",
  },
  h6: {
    fontSize: "1.17em",
  }
}, "css");
