import Card from "./Card.js";

const rand = () => Math.random() - 0.5;
const PIE = 2 * Math.PI;
const PI = Math.PI;
const PI2 = Math.PI / 2;
const PI4 = Math.PI / 4;
const map = (value, start1, stop1, start2, stop2) =>
  ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const pixelArea = (window.innerWidth * window.innerHeight) / window.devicePixelRatio;
const cardArea = 2 * 260 * 260;
const base = Math.floor(pixelArea / cardArea);

class CardFloating extends Card {
  constructor({
    number = Card.MIN,
    suit = Card.SUIT.D,
    root = "",
    permanent = false,
  } = {}) {
    super({
      number,
      suit,
      root,
      numeral: false,
    });

    this.permanent = permanent;
    Binder.set(this, {
      t: 0
    });

    // position & rotation
    [this.x, this.y, this.z] = [Math.random(), Math.random(), 0.5];
    [this.rx, this.ry, this.rz] = [0, 0, 0];
    this.acc = 1;
    this.isStill = false;

    // velocity & rotation velocity
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.vrx = 0;
    this.vry = 0;
    this.vrz = 0;

    // tuning parameters
    this.rFactor = 300;
    this.vFactor = this.rFactor / 3000;

    // main animation loop
    this._interval = setInterval(() => this.step(), 24);

    this.set({
      position: CardFloating._forcedSuit.with(CardFloating._forcedRoyal).as((s, r) => s || r ? "fixed" : "absolute"),
      boxShadow: this._t.as(() => this.getShadow()),
      fontSize: this._t.as(() => `${map(this.z, 0, 1, 0.5, 0.7) * CardFloating.sizeScale}em`),
      zIndex: this._t.as(() => 100 + Math.round(this.z * 30)),
      left: this._t.with(CardFloating._forcedSuit, CardFloating._forcedRoyal)
        .as((t, s, r) => `calc((100vw - 5em) * ${this.x} - ${s || r ? 0 : document.body.getBoundingClientRect().left}px)`),
      top: this._t.with(CardFloating._forcedSuit, CardFloating._forcedRoyal)
        .as((t, s, r) => `calc((100% - ${s || r ? '6em' : '18em'}) * ${this.y})`),
      transform: this._t.as(() => `rotateX(${this.rx}rad) rotateY(${this.ry}rad) rotateZ(${this.rz}rad)`),
      onmouseout: (e) => this.flick(e),
      onmouseover: () => (this.isStill = true),
      onready: () => setTimeout(() => this.flick(), 1000),
    });


    // initial jerk to get things moving
    this.jerk();
    // small initial flick
    setTimeout(() => this.flick(), 100);

    CardFloating.cards.push(this);
  }

  // ---- motion helpers ----

  flip() {
    this.vrx = this.vFactor * rand();
    this.vry = this.vFactor * rand();
    this.vrz = this.vFactor * rand();
  }

  jerk() {
    this.vx = rand() / this.rFactor;
    this.vy = rand() / this.rFactor;
    this.vz = rand() / this.rFactor;
    this.flip();
  }

  flick(ev) {
    this.isStill = false;

    // If we have a mouse event, aim the velocity based on mouse position
    if (ev && ev.clientX != null && ev.clientY != null) {
      const rect = this.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Vector from card center to mouse
      let dx = ev.clientX - cx;
      let dy = ev.clientY - cy;

      // Normalize to a direction
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;

      // Tweak speed to taste; similar scale to jerk()
      const speed = -2 / this.rFactor;
      this.vx = dx * speed;
      this.vy = dy * speed;
    } else {
      // No event: just give a random jerk
      this.jerk();
    }
  }

  step() {
    let [sx, sy] = [Math.cos(this.rx), Math.cos(this.ry)];
    this.flippedX = sx < 0;
    this.flippedY = sy < 0;
    this.flipped =
      (this.flippedX && !this.flippedY) || (this.flippedY && !this.flippedX);

    if (this.flipped && !this.permanent) this.random();

    const [aMax, aMin] = [5, 1];
    this.acc =
      this.acc > aMax ? aMax : this.acc < aMin ? aMin : 0.98 * this.acc;

    // clamp velocities
    [this.vx, this.vy, this.vz, this.vrx, this.vry, this.vrz] = [
      this.vx,
      this.vy,
      this.vz,
      this.vrx,
      this.vry,
      this.vrz,
    ].map((v) => (Math.abs(v) > 1 ? v / Math.abs(v) : v));

    let drag = this.isStill ? 0.1 : 1.6;

    if (this.isStill) {
      this.rx = this.ry = PI;
      this.z = 1;
    } else {
      let sd = 1.05;
      if (
        (CardFloating._forcedSuit.value &&
          CardFloating._forcedSuit.value !== this.suit) ||
        (CardFloating._forcedRoyal.value && this.number < 10)
      ) {
        sd = 2;
      }

      [sx, sy] = [sx, sy].map((s) => 2 * (s + sd));
      this.rx += this.vrx * drag * sx;
      this.ry += this.vry * drag * sy;
      this.z += this.vz * this.acc * drag;

      if (this.z < 0) {
        this.z = 0;
        this.vz *= -1;
      }

      if (this.rx > PI || this.rx < -PI) this.vrx *= -1;
      if (this.ry > PI || this.ry < -PI) this.vry *= -1;
    }

    // apply rotation around Z
    this.rz += this.vrz * this.acc * drag;
    if (this.rz > PIE) this.rz -= PIE;
    else if (this.rz < -PIE) this.rz += PIE;

    if (Math.abs(this.vx) > 0.001) this.vx *= 0.99;
    if (Math.abs(this.vy) > 0.001) this.vy *= 0.99;

    this.x += this.vx * this.acc * drag;
    this.y += this.vy * this.acc * drag;

    // handle bounds
    if (this.z > 1 || this.z < 0) {
      this.r = Math.round(this.r);
      this.vz *= -1;
    }
    let getNudge = d => this.vFactor * ((d < 0 ? 0 : 0.8) - d) / 100;
    if (this.x > 1 || this.x < 0) this.vx += getNudge(this.x);
    if (this.y > 1 || this.y < 0) this.vy += getNudge(this.y);

    this.t += 1;
  }

  getShadow() {
    const z = this.z;
    let ang = PI4;

    if (this.flippedX && this.flippedY) ang = -3 * PI4;
    else if (this.flippedX) ang = 3 * PI4;
    else if (this.flippedY) ang = -PI4;

    const xProj = Math.sin(ang + this.rz);
    const yProj = Math.cos(ang + this.rz);
    const x = z * xProj;
    const y = z * yProj;

    return `${map(x, 0, 1, 0.4, 6)}em ${map(y, 0, 1, 0.4, 5)}em 3px rgba(0,0,0,${map(z, 0, 1, 0.4, 0.1)})`;
  }

  // ---- existing logic ----

  random(min = 1, max = 13) {
    if (CardFloating._forcedRoyal.value) min = 11;
    else if (CardFloating._forcedRoyal.value === false) max = 10;
    this.number = min + Math.round(Math.random() * (max - min));

    if (CardFloating._forcedSuit.value && CardFloating._forcedSuit.value.image) {
      this.suit = CardFloating._forcedSuit.value;
    } else {
      this.suit =
        Card.SUIT[Object.keys(Card.SUIT)[Math.floor(Math.random() * 4)]];
    }

    if (
      CardFloating.cards.filter(
        (c) => c !== this & c.number === this.number && this.suit === c.suit
      ).length
    ) {
      this.random();
    }
  }

  static _forcedSuit = new Binder();
  static _forcedRoyal = new Binder();
  static cards = [];

  static CardNum = Math.max(
    1,
    Math.min(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 2 : 3, base)
  );

  static sizeScale = Math.max(1.25, Math.min(base / 4.5, 2));

  static set(num) {
    if (num === undefined) num = CardFloating.CardNum;
    document.body.set({
      div: Array(num).fill().map(() => new CardFloating({
        root: 'suityourself/',
      })),
    });
  }

  static force(suit, royals){
    CardFloating._forcedRoyal.value = undefined;
    if (typeof suit === "boolean") {
      CardFloating._forcedRoyal.value = suit;
      suit = undefined;
    }
    if (typeof royals === "boolean") CardFloating._forcedRoyal.value = royals;
    CardFloating._forcedSuit.value = suit;
  }
}

customElements.define("jk-card-float", CardFloating);


export default CardFloating;
