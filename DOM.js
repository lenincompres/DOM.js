/**
 * Creates DOM structures from a JS object (structure)
 * @author Lenin Compres <lenincompres@gmail.com>
 * @version 1.2.10
 * @repository https://github.com/lenincompres/DOM.js
 */

/**
 * Gets the value of an element's property.
 * @param {station} string - The style|attribute|(element)tag|innerText/innetHTML|on(event)|name of an element.
 */
 Element.prototype.get = function (station) {
  let output;
  if (!station && this.tagName.toLocaleLowerCase() === "input") output = this.value;
  else if (!station || ["content", "inner", "innerhtml", "html"].includes(station)) output = this.innerHTML;
  else if (["text"].includes(station)) output = this.innerText;
  else if (["outer", "self"].includes(station)) output = this.outerHTML;
  else if (station === "classes") output = this.getAttribute(station).split(" ");
  else if (DOM.attributes.includes(station) || station.startsWith("data")) output = this.getAttribute(station);
  else if (DOM.isStyle(station, this)) output = this.style[station];
  else output = station ? this[station] : this.value;
  if (output !== undefined && output !== null) return isNaN(output) ? output : parseFloat(output);
  output = [...this.querySelectorAll(":scope>" + station)];
  if (output.length) return output.length < 2 ? output[0] : output;
  output = [...this.querySelectorAll(station)];
  if (output.length) return output;
}

/**
 * Sets the value of an element's property.
 * @param {station} string - The station of an element.
 * @param {be} - the values to be set, or function to modify its given the currentvalue 
 */
Element.prototype.let = function (station, be = () => undefined, ...args) {
  return this.set(typeof be === "function" ? be(this.get(station)) : be, station, ...args);
}


/**
 * Sets the DOM structure, creating elemtns to append and their properties.
 * @param {model} object - JSON model of the DOM structure. Is could also be an array or primitive value
 * @param {args} - in any order: 
 * {string} - the station (style|attribute|(element)tag|innerText/innetHTML|onevent|name) to be set.
 * {element} - element where the model will be applied
 * {boolean} - whether to append, prepend or replace the content
 */
Element.prototype.set = function (model, ...args) {
  if ([null, undefined].includes(model)) return this;
  let contentType = DOM.typify(model.content);
  if (contentType.p5Element || contentType.element) {
    let elt = contentType.element ? contentType.element : contentType.p5Element.elt;
    this.set(elt, ...args);
    Object.keys(model).filter(k => k !== "content").forEach(k => elt.set(model[k], k, ...args));
    return this;
  }
  if (Array.isArray(model.content)) {
    model.content.forEach(item => {
      if ([null, undefined].includes(item)) return this;
      let individual = Object.assign({}, model);
      individual.content = item;
      this.set(individual, ...args);
    });
    return this;
  }
  let modelType = DOM.typify(model);
  const TAG = this.tagName.toLowerCase();
  const IS_HEAD = TAG === "head";
  let argsType = DOM.typify(...args);
  const IS_PRIMITIVE = modelType.isPrimitive;
  let station = argsType.string; // original style|attr|tag|inner…|on…|name
  const CLEAR = !station && IS_PRIMITIVE || station === "content";
  if ([undefined, "inner", "create", "assign", "model", "set"].includes(station)) station = "content";
  const STATION = station;
  station = station.toLowerCase(); // station lowercase
  // SELECT and input exception
  if (IS_PRIMITIVE && !model.binders && ["selectedIndex", "value"].includes(STATION)) return this[STATION] = model;
  // css exceptions
  if (STATION === "fontFace") {
    document.body.set({
      css: {
        [station]: model
      }
    });
    return this;
  }
  let uncamel = DOM.unCamelize(STATION);
  // needs dissambiguation for head link and pseaudoclass
  if (!["link", "target", "lang"].includes(station) && (DOM.pseudoClasses.includes(uncamel) || DOM.pseudoElements.includes(uncamel))) return this.set({
    css: {
      [uncamel]: model
    }
  });
  // element exceptions
  if (station === "id") {
    DOM.addID(model, this);
    return this;
  }
  if (DOM.reserveStations.includes(station)) return this;
  const IS_CONTENT = station === "content";
  const IS_LISTENER = DOM.listeners.includes(station);
  const p5Elem = argsType.p5Element;
  if (modelType.function) {
    if (DOM.typify(STATION).event) this.addEventListener(STATION, e => model(e, this));
    else if (p5Elem && typeof p5Elem[STATION] === "function") p5Elem[STATION](e => model(e, this));
    else this[STATION] = e => model(e, this);
    return this;
  }
  // deletes related transition/animation intervals
  if (IS_CONTENT && argsType.boolean === true) {
    while (this.firstChild) this.removeChild(parentElement.firstChild);
    this.innerHTML = "";
  }
  if (argsType.boolean === true && this.intervals && this.intervals[STATION]) {
    clearInterval(this.intervals[station]);
    DOM.transition(this, `${DOM.unCamelize(STATION)} 0s`);
  }
  if ((model.interval || model.delay) && (model.to || model.through || model.loop)) {
    model.interval = parseInt(model.interval);
    if (!model.loop && !model.through) model.through = [];
    if (model.from !== undefined) model.through.push(model.from);
    if (model.to !== undefined) model.through.push(model.to);
    if (model.through) {
      model.loop = model.through;
      model.repeat = 1;
    }
    if (model.delay === undefined) model.delay = 0;
    if (model.delay !== undefined && model.interval === undefined) model.interval = model.delay;
    if (model.repeat === undefined) model.repeat = -1;
    if (!model.while) model.while = (typeof model.repeat === "function") ? model.repeat : (() => model.repeat > 0);
    DOM.transition(this, `${DOM.unCamelize(STATION)} 0s`);
    this.set(model.loop[0], STATION);
    setTimeout(() => {
      let i = 1;
      if (model.transition) DOM.transition(this, `${DOM.unCamelize(STATION)} ${model.interval}ms ${model.transition}`);
      DOM.interval(this, () => {
        this.set(model.loop[i], STATION);
        i += 1;
        if (i >= model.loop.length) i = 0;
        if (i === 0 && !isNaN(model.repeat)) model.repeat -= 1;
      }, model.interval, model.while, STATION, () => {
        this.set(model.loop[model.loop.length - 1], STATION);
        if(model.callBack) model.callBack();
      });
    }, model.delay);
    return this;
  }
  if (model._bonds) model = model.bind();
  else {
    if (model.with && typeof model.with !== "function") model.bind = model.with;
    if (model.bind) {
      if (Array.isArray(model.bind)) model = DOM.bind(model.bind, model.as);
      else model = model.as ? model.bind.bind(model.as) : model.bind;
    }
  }
  if (model.binders) {
    if (DOM.tags.includes(STATION) && !DOM.attributes.includes(STATION)) return this.set({
      content: model,
    }, STATION);
    model.binders.forEach(binder => binder.bind(this, STATION, model.as, model.listener, ["attribute", "attributes"].includes(station) ? station : undefined));
    return this;
  }
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
    document.head.set(typeof model === "string" ? model : DOM.css(model), "style");
    return this;
  }
  if (["text", "innertext"].includes(station)) {
    this.innerText = model;
    return this;
  }
  if (["markdown", "md"].includes(station)) {
    this.innerHTML = model.replace(/^###### (.*$)/gim, '<h6>$1</h6>').replace(/^##### (.*$)/gim, '<h5>$1</h5>').replace(/^#### (.*$)/gim, '<h4>$1</h4>').replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/__(.*?)__/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>').replace(/_(.*?)_/g, '<i>$1</i>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>').replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>').replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>').replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>').replace(/^\s*([^\n]+)\s*$/gim, '<p>$1</p>').replace(/\n{2,}/g, '<br>').trim();
    return this;
  }
  if (["html", "innerhtml"].includes(station)) {
    this.innerHTML = model;
    return this;
  }
  if (TAG.toLocaleLowerCase() === "meta") {
    Object.entries(model).map(([key, value]) => this.setAttribute(key, value));
    return this;
  }
  const handleProps = (fallBack = () => null) => {
    Object.entries(model).map(([key, value]) => {
      if (value && value._bonds) value.bind(this, key, value.as, station);
      if (value && value.binders) return value.binders.forEach(binder => binder.bind(this, key, value.as, value.listener, station));
      fallBack(key, value);
    });
  };
  if (["attribute", "attributes"].includes(station)) {
    station = "attribute";
    handleProps((key, value) => this.setAttribute(key, value));
    return this;
  }
  if (station === "class") {
    if (IS_PRIMITIVE) this.setAttribute(station, model);
    else if (Array.isArray(model)) model.forEach(c => this.classList.add(c));
    else handleProps((key, value) => value ? this.classList.add(key) : this.classList.remove(key));
    return this;
  };
  if (IS_HEAD) {
    if (station === "font" && modelType.object) return DOM.set({
      fontFace: model
    }, "css");
    if (station === "style" && !model.content) return this.set({
      content: typeof model === "string" ? model : DOM.css(model)
    }, station);
    if (station === "keywords" && Array.isArray(model)) return this.set(model.join(","), ...args);
    if (station === "viewport" && modelType.object) return this.set(Object.entries(model).map(([key, value]) => `${DOM.unCamelize(key)}=${value}`).join(","), ...args);
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
    if (IS_PRIMITIVE) {
      TAG === "input" ? this.value = model : this.innerHTML += model;
      return this;
    }
    if (Array.isArray(model)) {
      model.forEach(m => this.set(m));
      return this;
    }
    Object.keys(model).forEach(key => this.set(model[key], key, p5Elem));
    return this;
  }
  if (modelType.array) {
    if (IS_LISTENER) {
      this.addEventListener(...model);
      return this;
    }
    let map = model.map(m => this.set(m, [tag, ...cls].join("."), p5Elem));
    if (id) DOM.addID(id, map);
    return map;
  }
  if (IS_LISTENER) {
    if (model.event) model.type = model.event;
    if (model.function) model.listener = model.function;
    if (model.method) model.listener = model.method;
    if (model.call) model.listener = model.call;
    if (model.options) {
      this.addEventListener(model.type, model.listener, model.options);
      return this;
    }
    this.addEventListener(model.type, model.listener, model.useCapture, model.wantsUntrusted);
    return this;
  }
  if (station === "style") {
    if (IS_PRIMITIVE && !IS_HEAD) {
      this.setAttribute(station, model);
      return this;
    }
    if (!model.content) {
      if (CLEAR) this.setAttribute(station, "");
      handleProps((key, value) => this.style[key] = value);
      return this;
    }
    if (DOM.typify(model.content).object) model.content = DOM.css(model.content);
  }
  if (IS_HEAD && !IS_PRIMITIVE) {
    if (station === "image") {
      return this.set({
        "og:image": model.src,
        "og:image:alt": model.alt,
        "twitter:image": model.src,
        "twitter:card": model.card,
      })
    }
  }
  if (IS_PRIMITIVE) {
    if (IS_HEAD) {
      const type = DOM.getDocType(model);
      if (station === "description") this.innerHTML += `<meta property="og:description" content="${model}">`;
      if (station === "title") this.innerHTML += `<title>${model}</title><meta property="og:title" content="${model}"><meta property="og:type" content="website">`;
      else if (station === "icon") this.innerHTML += `<link rel="icon" href="${model}">`;
      else if (station === "image") this.innerHTML += `<meta property="og:image" content="${model}">`;
      else if (station === "charset") this.innerHTML += `<meta charset="${model}">`;
      else if (station.includes(":")) this.innerHTML += `<meta property="${station}" content="${model}">`;
      else if (DOM.metaNames.includes(station)) this.innerHTML += `<meta name="${station}" content="${model}">`;
      else if (DOM.htmlEquivs.includes(STATION)) this.innerHTML += `<meta http-equiv="${DOM.unCamelize(STATION)}" content="${model}">`;
      else if (station === "font") DOM.set({
        fontFace: {
          fontFamily: model.split("/").pop().split(".")[0],
          src: model.startsWith("url") ? model : `url("${model}")`
        }
      }, "css");
      else if (station === "link") this.set({
        rel: type,
        href: model
      }, station);
      else if (station === "script") this.set({
        type: type,
        src: model
      }, station);
      return this;
    }
    let done = DOM.isStyle(STATION, this) ? this.style[STATION] = model : undefined;
    if (DOM.typify(STATION).attribute || STATION.startsWith("data")) done = !this.setAttribute(station, model);
    if (station === "id") DOM.addID(model, this);
    if (done !== undefined) return this;
  }
  let elem = (model.tagName || model.elt) ? model : false;
  if (!elem) {
    if (!tag || !isNaN(tag) || !tag.length) tag = "section";
    elem = p5Elem ? createElement(tag) : document.createElement(tag);
    elem.set(model, p5Elem);
  }
  elt = p5Elem ? elem.elt : elem;
  if (cls.length) elt.classList.add(...cls);
  if (id) elt.setAttribute("id", id);
  if(argsType.boolean !== false) argsType.boolean === true ? this.prepend(elt) : this.append(elt);
  ["ready", "onready", "done", "ondone"].forEach(f => {
    if (!model[f]) return this;
    model[f](elem);
  });
  ["timeout"].forEach(f => {
    if (!model[f]) return this;
    let [func, t] = Array.isArray(model[f]) ? model[f] : [model[f], 1];
    DOM.interval(this, func, t, 1);
  });
  ["interval"].forEach(f => {
    if (!model[f]) return this;
    let [func, t, end] = Array.isArray(model[f]) ? model[f] : [model[f], 1];
    DOM.interval(this, func, t, end);
  });
  if (argsType.functions) argsType.functions.forEach(f => f(elem));
  return elem;
};

// Adds set method to P5 elements

/**
 * Adds set method to P5 elements
 */
if (typeof p5 !== "undefined") {
  p5.set = (...args) => DOM.set(...args, createDiv());
  p5.Element.prototype.set = function (...args) {
    return this.elt.set(...args, this);
  }
}

/**
 * Adds css to the head under the element"s ID
 * @param {style} object - CSS in JSON notation.
 */
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
  return DOM.set({
    [`#${id}`]: style,
  }, "css");
}

/**
 * Updates stations of element when its value changes. Can also update other binders.
 */
class Binder {
  #value;

  /**
   * creates a new instance of a Binder.
   * @param {val} - Initial value for the Binder to hold.
   */
  constructor(val) {
    this.#value = val;
    this._bonds = [];
    this._listeners = {};
    this._listenerCount = 0;
    this.onvalue = v => v;
    this.update = bond => {
      if (!bond.target) return;
      let theirValue = bond.as(this.#value);
      if (bond.target.tagName) {
        if (!bond.type) return bond.target.set(theirValue, bond.station);
        return bond.target.set({
          [bond.type]: {
            [bond.station]: theirValue,
          }
        });
      }
      if (bond.target._bonds) bond.target.setter = this; // knowing the setter prevents co-binder"s loop
      bond.target[bond.station] = theirValue;
    }
  }
  /**
   * Keeps track of other Binders or binds that may be tracking value changes.
   * @param {func} - 
   */
  onChange(func) {
    if (typeof func !== "function") return;
    this._listeners[this._listenerCount] = func;
    return this._listenerCount++;
  }
  removeListener(countIndex) {
    delete this._listeners[countIndex];
  }
  /**
   * Creates a binding object inside a model to be set().
   */
  as(...args) {
    if (args.length === 1) return this.bind(args[0]);
    if (typeof args[0] === "function") {
      if (args.length === 2) return this.bind(...args);
      return this.bind(args.shift(), args);
    }
    return this.bind(args);
  }
  /**
   * Returns the approriate value from an array or map based on the binder's value.
   * @param {format} object - values to be selected from and array or object (map).
   * @param {as} function name(value) - logic to be applied given the current value in the binder.
   */
  getAs(format, as = val => val) {
    if (typeof format == 'function') return () => format(val => as(val));
    if (Array.isArray(format) && format.length) {
      let test = as;
      as = val => {
        val = test(val);
        if (typeof val === "boolean" || isNaN(val)) val = val ? 1 : 0;
        return format[val];
      };
    } else if (!format.tagName) {
      let test = as;
      as = val => {
        val = test(val);
        return [format[val], format.default, format.false].filter(v => v !== undefined)[0];
      };
    }
    return as;
  }
  /**
   * Creates a bind.
   * @param {target} element - element to bind
   * @param {station} string - station (prop) to bind
   * @param {listeners} number - any other binders of the same prop
   * @param {values} array - value to select based on numeric result ot the bind
   * @param {map} object - value to select based on key result ot the bind
   * @param {as} function - logic to be applied to the value in the binder
   * @param {type} string - not sure what this is
   */
  bind(...args) {
    let argsType = DOM.typify(...args);
    let target = argsType.element ? argsType.element : argsType.binder;
    let station = argsType.string ? argsType.string : "value";
    let listener = argsType.number;
    let values = argsType.array;
    let map = argsType.object;
    let type = argsType.strings ? argsType.strings[1] : undefined;
    let as = argsType.function ? argsType.function : val => val;
    if (values && values.length) as = this.getAs(values, as);
    else if (map && map !== target) as = this.getAs(map, as);
    if (!target) return DOM.bind([this], as, listener); // binding in a model
    if (listener) this.removeListener(listener); // if in a model, removes the listener
    let bond = {
      binder: this,
      target: target,
      station: station,
      as: as,
      type: type,
    }
    this._bonds.push(bond);
    this.update(bond);
  }
  /**
   * Creates a binding object inside a model to be set(), if multiple binders are to be applied. Expected to be called followed by a "as()" call: myBinder.with(otherBinder).as((val1, val2) => ...).
   * @param {binders} array - binders to consides in the binding.
   */
  with(...binders) {
    binders.unshift(this);
    return {
      as: func => DOM.bind(binders, func),
    };
  }
  /**
   * Iterates through values. Reverts to the intital.
   * @param {values} array - values to iterate through.
   * @param {interval} number - miliseconds to wait betwee values.
   * @param {revert} boolean - is it supposed to return to the first value?
   * @param {callback} function - to be called once the iteration is over.
   */
  //Iterates through values. Reverts to the intital
  through(values, interval = 1000, revert = false, callback = () => null) {
    if (!Array.isArray(values)) values = [values];
    if (!Array.isArray(interval)) interval = new Array(values.length).fill(interval);
    let oldValue = this.value;
    this.value = values.shift();
    if (revert === false) {
      values.push(oldValue);
      interval.push(interval[0]);
    }
    setTimeout(_ => {
      if (values.length) return this.through(values, interval, revert);
      if (revert === true) return this.value = oldValue;
      callback();
    }, interval.shift());
  }
  /**
   * Loops through values.
   * @param {values} array - values to iterate through.
   * @param {interval} number - miliseconds to wait betwee values.
   */
  loop(values, interval) {
    if (!Array.isArray(values)) return;
    this.value = values.shift();
    setTimeout(() => this.through(values, interval, false), interval);
  }
  /**
   * Sets the value in the binder.
   * @param {val} - value to hold.
   */
  apply(val) {
    this.value = val;
  }
  static set(...args) {
    binderSet(...args);
  }
  /**
   * Sets the value in the binder.
   * @param {val} - value to hold.
   */
  set value(val) {
    this.#value = val;
    this._bonds.forEach(bond => {
      if (bond.target === this.setter) return;
      this.update(bond);
    });
    this.onvalue(val);
    Object.values(this._listeners).forEach(func => func(val));
    this.setter = undefined;
  }
  /**
   * Gets the value in the binder.
   */
  get value() {
    return this.#value;
  }
  /**
   * Creates a bind, given one of more binders.
   * @param {binders} array - binders to bind
   * @param {target} element - element to bind
   * @param {station} string - station (prop) to bind
   * @param {listeners} number - any other binders of the same prop
   * @param {values} array - value to select based on numeric result ot the bind
   * @param {map} object - value to select based on key result ot the bind
   * @param {as} function - logic to be applied to the value in the binder
   * @param {type} string - not sure what this is
   */
  static with(...args) {
    return DOM.bind(...args);
  }
}

/**
 * Creates a bind to a specific element.
 * @param {binders} array - binders to bind
 * @param {station} string - station (prop) to bind
 * @param {listeners} number - any other binders of the same prop
 * @param {values} array - value to select based on numeric result ot the bind
 * @param {map} object - value to select based on key result ot the bind
 * @param {as} function - logic to be applied to the value in the binder
 * @param {type} string - not sure what this is
 */
Element.prototype.bind = function (...args) {
  let argsType = DOM.typify(...args);
  if (argsType.strings === args) return args.forEach(a => this.bind(a));
  if (args.length == 1) return {
    with: (...binders) => ({
      as: func => this.set({
        [args[0]]: DOM.bind(...binders).as(func)
      })
    })
  }
  return DOM.bind(...args, this);
}

/**
 * Creates binders and it's setters and getters in an object.
 * @param {name} string - name of the binder
 * @param {name} object - key:value pairs of binders to be created
 * @param {value} string - initial value in the binder
 */
Object.prototype.binderSet = function (name, value) {
  if (typeof name == 'string') {
    const _name = '_' + name;
    const _ = new Binder(value);
    Object.defineProperty(this, _name, {
      get() {
        return _;
      },
      set(val) {
        console.error(`Error: This (${_name}) is a read-only binder and cannot be reassigned. Use: ${name}, or: ${_name}.value. to change its value.`);
      },
      configurable: false, // Prevents deletion of the property
      enumerable: true,
    });
    Object.defineProperty(this, name, {
      get() {
        return this[_name].value;
      },
      set(val) {
        this[_name].value = val;
      },
    });
    return;
  }
  for (const [key, value] of Object.entries(name)) {
    this.binderSet(key, value);
  }
}

/**
 * Creates a objects that holds several binders.
 */
class BinderSet {
  /**
   * Creates a BinderSet instance
   */
  constructor(...args) {
    this.binderSet(...args);
  }
  /**
   * Creates a binding object inside a model to be set() applying one of multiple binders in the set. Expected to be called followed by a "as()" call: myBinderSet.with("binderName").as(func).
   * @param {args} array - binders to consides in the binding.
   */
  with(...args) {
    if (Array.isArray(args[0])) return this.with(...args[0]).as(args[1]);
    return DOM.bind(...BinderSet.validate(args));
  }
  /**
   * Binds binders in the set to an element's property.
   * @param {binders} array - binders to bind
   * @param {target} element - element to bind
   * @param {station} string - station (prop) to bind
   * @param {listeners} number - any other binders of the same prop
   * @param {values} array - value to select based on numeric result ot the bind
   * @param {map} object - value to select based on key result ot the bind
   * @param {as} function - logic to be applied to the value in the binder
   */
  bind(...args) {
    let argsType = DOM.typify(...args);
    if (argsType.element) return {
      with: (...binders) => ({
        as: func => argsType.element.set({
          [argsType.string]: DOM.bind(BinderSet.validate(binders), func),
        })
      })
    }
    if (args[0].target) return args[0].target.set({
      [args[0].station]: DOM.bind(BinderSet.validate(args[0].with), args[0].as),
    });
    if (args[0].with) return this.with(args[0].with, args[0].as);
    return this.with(...args);
  }
  /**
   * Given a string name returnd the appropriate binder in the set.
   * @param {args} array - binders to be returned.
   */
  static validate(...args) {
    if (Array.isArray(args[0])) return BinderSet.validate(...args[0]);
    return args.map(a => typeof a === 'string' ? this["_" + a] : a);
  }
}

/**
 * Class for global static methods to handle the DOM
 */
class DOM {
  /**
   * Gets the value of a property from the document body or head.
   * @param {station} station - propety to get.
   */
  static get(station) {
    DOM.headTags.includes(station.toLowerCase()) ? document.head.get(station) : document.body.get(station);
  }
  /**
   * Sets the value of a property from the document body or head.
   * @param {station} station - propety to get.
   * @param {be} func - logic to be applied based on the current value of the station.
   */
  static let (station, ...args) {
    return DOM.headTags.includes(station.toLowerCase()) ? document.head.let(station, ...args) : document.body.let(station, ...args);
  }
  /**
   * Sets the value of a property and creates elements in the document head and body based on an object model. Also resets the css.
   * @param {model} object - JSON model of the DOM structure. Is could also be an array or primitive value
   * @param {args} - in any order: 
   * {string} - the station (style|attribute|(element)tag|innerText/innetHTML|onevent|name) to be set.
   * {element} - element where the model will be applied
   * {boolean} - whether to append, prepend or replace the content
   */
  static set(model = "", ...args) {
    if (!args.includes("css") && !window.DOM_RESETTED) window.DOM_RESETTED = !!document.head.set({
      charset: "UTF-8",
      viewport: "width=device-width, initial-scale=1.0",
      meta: {
        "http-equiv": "X-UA-Compatible",
        content: "IE=edge",
      },
      style: DOM.css(DOM.RESET),
    });
    // checks if the model is meant for an element
    let argsType = DOM.typify(...args);
    if(Array.isArray(model) && !argsType.string) return DOM.set(model, 'section', ...args);
    let elt = argsType.element ? argsType.element : argsType.p5Element;
    if (elt) return elt.set(model, ...args);
    // hidden models with css for a split second 
    if (model.css) {
      DOM.set(model.css, "css");
      delete model.css;
      if (document.body) {
        DOM.set("none", "display");
        setTimeout(() => DOM.set("block", "display"), 50);
      }
    }
    // checks if the model is meant for the head
    if (model.head) {
      document.head.set(model.head);
      delete model.head;
    }
    if (model.lang) {
      document.documentElement.set(model.lang, "lang");
      delete model.lang;
    }
    let headModel = {};
    Object.keys(model).forEach(key => {
      if (!DOM.headTags.includes(key.toLowerCase())) return;
      headModel[key] = model[key];
      delete model[key];
    });
    document.head.set(headModel);
    if (Array.isArray(model)) return model.map(m => DOM.set(m, ...args));
    // checks if the model should replace the DOM
    if (argsType.boolean) document.body.innerHTML = "";
    // checks if the body is loaded
    if (!document.body) return window.addEventListener("load", _ => document.body.set(model, ...args));
    document.body.set(model, ...args);
    document.body.let("visibility", "hidden");
    setTimeout(() => document.body.let("visibility", "visible"), 0);
  }
  /**
   * Returns a new element without appending it to the DOM.
   * @param {model} object - model to be set to create the structure and properties of the element.
   * @param {tag} string - tag.
   */
  static element = (model, tag) => {
    if (tag === undefined && typeof model === "string") {
      tag = model;
      model = {};
    }
    if (tag === undefined) tag = "section";
    if (model && model.tag) {
      tag = model.tag;
      delete model.tag;
    }
    return document.createElement(tag).set(model);
  }
  /**
   * Creates and returns a new binder.
   * @param {value} object - initial value to hold.
   * @param {args} array - arguments to create a bind right away.
   */
  static binder(value, ...args) {
    let binder = new Binder(value);
    if (args.length) binder.bind(...args);
    return binder;
  }
  /**
   * Creates bind between a given element's station and a binder or binders.
   */
  static bind(...args) {
    const argsType = DOM.typify(...args);
    let [binder, as, listener, binders] = [argsType.binder, argsType.function, argsType.number, argsType.binders];
    if (binders && binders.length === args.length) {
      binder = binders.shift();
      return !binders.length ? binder : binder.with(...binders);
    }
    args = args.filter(a => a != argsType.binder);
    binders = Array.isArray(args[0]) ? args[0] : undefined;
    if (binder) return binder.as(...args);
    if (!binders) return console.error("No binders found in bind.");
    if (binders.some(binder => !Array.isArray(binder._bonds))) return console.error(binders, "Non-binder found in compound bind.");
    return { // binding in a model
      listener: listener,
      binders: binders,
      as: () => as(...binders.map(b => b.value)),
    }
  }
  /**
   * Creates bind between a given element's station and a binder or binders.
   */
  static with(...args) {
    return DOM.bind(...args);
  }
  /**
   * converts JSON to CSS. Supports nesting. Turns "_" in selectors into ".". Preceding "__" assumes class on previous selector. Trailing "_" assumes immediate children (>).
   * @param {sel} strings - selector.
   * @param {model} object - CSS in JSON format.
   */
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
    if (sel === "h" || sel.endsWith(" h")) {
      cls = cls.length ? ("." + cls.join(".")) : "";
      sel = Array(6).fill().map((_, i) => sel + (i + 1) + cls).join(", ");
      cls = [];
    }
    if (sel.toLowerCase() === "fontface") sel = "@font-face";
    if (sel === "src" && !model.startsWith("url")) model = `url("${model}")`;
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
  /**
   * Adds styles to the head as global CSS.
   * @param {model} object - CSS in JSON format.
   */
  static style = model => DOM.set(model, "css");
  /**
   * Returns html based on a JSON model.
   * @param {model} object - HTML in JSON format.
   * @param {tag} string - tag of the object to create.
   */
  static html = (model, tag = "section") => !!model && (model.tagName ? model : DOM.element(model, tag)).outerHTML;
  /**
   * Returns querystring as an object 
   */
  static get queryString() {
    return DOM.querystring();
  }
  /**
   * Returns querystring as an object 
   */
  static querystring = () => {
    var qs = location.search.substring(1);
    if (!qs) return Object();
    if (qs.includes("=")) {
      qs = "{\"" + decodeURI(location.search.substring(1)).replace(/"/g, "\\\"").replace(/&/g, "\",\"", "").replace(/=/g, "\":\"") + "\"}";
      return JSON.parse(qs);
    }
    return qs.split("/");
  }
  /**
   * @param {array} - model of items in the list
   * @return {object} - Model of ul with li
   */
  static list = (...items) => Array.isArray(items[0]) ? DOM.list(...items[0]) : ({
    ul: {
      li: items,
    }
  });
  /**
   * @param {array} - model of links in the menu list
   * @return {object} - Model of ul with li with links in it
   */
  static linkMenu = (...links) => Array.isArray(links[0]) ? DOM.linkMenu(...links[0]) : DOM.list(links.map(link => ({
    a: link,
  })));
  /**
   * Sets and interval tied to an element and station 
   * @param {elem} element - element related to the interval.
   * @param {func} function - action to take on interval.
   * @param {ms} number - miliseconds or interval.
   * @param {station} string - station related to the interval.
   * @param {callback} function - action to be takend when done.
   */
  static interval(elem, func, ms, end, station = "none", callback = () => null) {
    if (!elem.intervals) elem.intervals = {};
    else if (elem.intervals[station]) clearInterval(elem.intervals[station]);
    let iId = setInterval(() => {
      let go = typeof end === "function" ? end() : end || end === undefined;
      if (!go) {
        callback();
        delete elem.intervals[station];
        return clearInterval(iId);
      }
      func(elem);
      if (!isNaN(end)) end -= 1;
    }, ms);
    elem.intervals[station] = iId;
  }
  /**
   * Gets and sets proper format fo rtransition css calue
   * @param {elem} element - element with transition to retrieve.
   * @param {trn} string - transition to change.
   */
  static transition(elem, trn) { // 
    let prop = trn.split(' ')[0].trim();
    let trns = elem.get("transition");
    if (trns) trns = trns.split(",").map(t => t.trim()).filter(t => t !== "NaN").map(t => t.startsWith(prop) ? trn : t).join(", ");
    else trns = trn;
    if (!trns.includes(trn)) trns += ", " + trn;
    elem.set(trns, "transition");
  }
  /**
   * Ads a new global variable for elements with an id
   * @param {id} string - id for var name of the element.
   * @param {elt} element - element to name globally.
   */
  static addID = (id, elt) => {
    if (!isNaN(id)) return console.error("ID's should not be numeric. id: " + id);
    if (elt.tagName) elt.setAttribute("id", id);
    if (Array.isArray(elt)) return elt.forEach(e => DOM.addID(id, e));
    if (!window[id]) return window[id] = elt;
    if (Array.isArray(window[id])) return window[id].push(elt);
    window[id] = [window[id], elt];
  };
  /**
   * Returns objects with all value types
   * @param {args} array - objects to type.
   */
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
  /**
   * Returns the camelcase version of a string separated with dashes
   * @param {str} string
   */
  static camelize = str => str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
  /**
   * Returns the dash separated version of a string in camelCase
   * @param {str} string
   */
  static unCamelize = (str, char = "-") => str.replace(/([A-Z])/g, char + "$1").toLowerCase();
  /**
   * Lets you know is a string is css style prop of elements
   * @param {str} string - name of the styles prop
   * @param {elt} element - specific element to check 
   */
  static isStyle = (str, elt) => ((elt ? elt : document.body ? document.body : document.createElement("section")).style)[str] !== undefined;
  static tags = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"];
  static events = ["abort", "afterprint", "animationend", "animationiteration", "animationstart", "beforeprint", "beforeunload", "blur", "canplay", "canplaythrough", "change", "click", "contextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "durationchange", "ended", "error", "focus", "focusin", "focusout", "fullscreenchange", "fullscreenerror", "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata", "loadstart", "message", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "offline", "online", "open", "pagehide", "pageshow", "paste", "pause", "play", "playing", "progress", "ratechange", "resize", "reset", "scroll", "search", "seeked", "seeking", "select", "show", "stalled", "submit", "suspend", "timeupdate", "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "unload", "volumechange", "waiting", "wheel"];
  static attributes = ["accept", "accept-charset", "accesskey", "action", "align", "alt", "async", "autocomplete", "autofocus", "autoplay", "bgcolor", "border", "charset", "checked", "cite", "class", "color", "cols", "colspan", "content", "contenteditable", "controls", "coords", "data", "datetime", "default", "defer", "dir", "dirname", "disabled", "download", "draggable", "enctype", "for", "form", "formaction", "headers", "height", "hidden", "high", "href", "hreflang", "http-equiv", "id", "ismap", "kind", "lang", "list", "loop", "low", "max", "maxlength", "media", "method", "min", "multiple", "muted", "name", "novalidate", "open", "optimum", "pattern", "placeholder", "poster", "preload", "readonly", "rel", "required", "reversed", "rows", "rowspan", "sandbox", "scope", "selected", "shape", "size", "sizes", "spellcheck", "src", "srcdoc", "srclang", "srcset", "start", "step", "style", "tabindex", "target", "title", "translate", "type", "usemap", "value", "wrap", "width"];
  static pseudoClasses = ["active", "checked", "disabled", "empty", "enabled", "first-child", "last-child", "first-of-type", "focus", "hover", "in-range", "invalid", "last-of-type", "link", "only-of-type", "only-child", "optional", "out-of-range", "read-only", "read-write", "required", "root", "target", "valid", "visited", "lang", "not", "nth-child", "nth-last-child", "nth-last-of-type", "nth-of-type"];
  static pseudoElements = ["after", "before", "first-letter", "first-line", "selection"];
  static metaNames = ["viewport", "keywords", "description", "author", "refresh", "application-name", "generator"];
  static htmlEquivs = ["contentSecurityPolicy", "contentType", "defaultStyle", "content-security-policy", "content-type", "default-style", "refresh"];
  static headTags = ["meta", "link", "title", "font", "icon", "image", ...DOM.metaNames, ...DOM.htmlEquivs];
  static reserveStations = ["tag", "id", "bind", "with", "as", "binders", "_bonds"];
  static listeners = ["addevent", "addeventlistener", "eventlistener", "listener", "on"];
  /**
   * Gets the doctype of a docs name based on its extension
   * @param {str} string - socument name
   */
  static getDocType = str => typeof str === "string" ? ({
    css: "stylesheet",
    sass: "stylesheet/sass",
    scss: "stylesheet/scss",
    less: "stylesheet/less",
    js: "text/javascript",
    ico: "icon"
  })[str.split(".").pop()] : undefined;
  static RESET = {
    "*": {
      boxSizing: "border-box",
      verticalAlign: "baseline",
      lineHeight: "inherit",
      margin: 0,
      padding: 0,
      border: 0,
      borderSpacing: 0,
      borderCollapse: "collapse",
      listStyle: "none",
      quotes: "none",
      content: "none",
      backgroundColor: "transparent",
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
      fontSize: "1.85em",
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
      fontSize: "1.15em",
    }
  }
}
