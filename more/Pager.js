/*
  This is essentially a router
*/

class Pager {

  constructor(map) {
    this.map = map;
    this.default = Object.keys(map)[0];
    this._key = new Binder(this.default);
    window.addEventListener("hashchange", () => this.refresh());
    this.refresh();
  }

  refresh() {
    let hash = location.hash.substr(1);
    let key = hash.split("-")[0];
    if (!key) key = this.default;
    if (this.key === key) return;
    if (!this.map[key]) return;
    this.key = key;
    if (key !== hash) setTimeout(location.href = `#${hash}`, 500);
  }

  set key(val){
    if(val === undefined) return this.hey = this.default
    this._key.value = val;
  }

  get key(){
    return this._key.value;
  }

  get keys() {
    return Object.keys(this.map);
  }

  get entries() {
    return Object.entries(this.map);
  }

  hasKey(key) {
    return this.keys.includes(key);
  }

  /* Methods and getters that return binder models */

  get _content() {
    return this._key.as(key => this.map[key]);
  }

  _map(key, func = val => val) {
    return this._key.as(key => func(this.map[key]));
  }

}

export default Pager;
