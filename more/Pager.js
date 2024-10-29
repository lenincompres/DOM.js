/**
 * It's a router based on DOM.js (structure)
 * @author Lenin Compres <lenincompres@gmail.com>
 * @version 1.0.0
 * @repository https://github.com/lenincompres/DOM.js
 */

class Pager {
  map = {};
  default;

  constructor(map = {}, linkHash = false) {
    this.binderSet("key");
    this.add(map);
    if (linkHash) window.addEventListener("hashchange", (() => {
      let hash = location.hash.substr(1);
      let key = hash.split("-")[0];
      if (!key) key = this.default;
      if (this.key === key) return;
      if (!this.map[key]) return;
      this.key = key;
      if (key !== hash) setTimeout(location.href = `#${hash}`, 500);
    })());
  }

  add(key, content) {
    if (typeof key === "string") {
      if (!this.default) this.key = this.default = key;
      this.map[key] = content;
      return;
    }
    for (const [k, value] of Object.entries(key)) {
      this.add(k, value);
    }
  }

  get keys() {
    return Object.keys(this.map);
  }

  /* Methods and getters that return binder models */
  get _content() {
    return this._key.as(key => this.map[key]);
  }

  hasKey(key) {
    return this.keys.includes(key);
  }

  /* Not sure what this does */
  _map(key, func = val => val) {
    return this._key.as(key => func(this.map[key]));
  }

}

export default Pager;
