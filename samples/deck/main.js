// general variables

const palette = {
  base: "lightGray",
  light: "white",
  dark: "#222",
  darkened: "rgba(0,0,0,0.6)",
  accent: "#46a",
}

const _CARD_DECK = new Binder([]);

//DOM setup

DOM.set({
  head: {
    title: "Deck of Cards",
    charset: 'UTF-8',
    icon: 'icon.ico',
    keywords: 'javaScript, frameworks, gallery, sample',
    description: 'Card deck inspired sample for DOM.js',
    viewport: {
      width: 'device-width',
      initialScale: 1,
    },
    font: 'IrishGrover.ttf',
  },

  css: {
    h: {
      fontFamily: "serif",
    },
    button: {
      backgroundColor: palette.accent,
      color: palette.light,
      margin: "0 0.25em",
      fontSize: "1.2em",
      borderColor: palette.accent,
      boxShadow: "none",
      hover: {
        borderColor: palette.light,
      },
      active: {
        borderColor: palette.base,
      }
    },
  },

  color: palette.dark,
  display: "flex",
  flexDirection: "column",
  backgroundColor: palette.base,

  header: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    padding: "1em",
    H1: "Deck of Cards",
    p: "Click the cards to flip them.",
  },

  main: {
    margin: "0 auto 1em",
    width: "fit-content",
    menu: {
      padding: "0.5em",
      marginTop: "1em",
      display: "flex",
      justifyContent: "center",
      button: [{
        text: "Show all",
        click: showAll,
      }, {
        text: "Hide all",
        click: hideAll,
      }, {
        text: "Toggle all",
        click: toggleAll,
      }, {
        text: "Shuffle",
        click: shuffle,
      }, {
        text: "Random",
        input: {
          id: "randomInput",
          type: "number",
          margin: "0 -0.8em 0 .5em",
          width: "3em",
          min: 1,
          max: 10,
          value: 1,
          click: evt => evt.stopPropagation(),
        },
        click: randomFlip,
      }],
    },
    section: {
      display: "flex",
      flexWrap: "wrap",
      fontSize: "1.2em",
      backgroundColor: palette.darkened,
      margin: "1em auto",
      padding: "1em",
      maxWidth: "41em",
      minHeight: "10em",
      content: _CARD_DECK,
    }
  },

  footer: {
    textAlign: "center",
    padding: "1em",
    p: "Created by Lenin Compres using DOM.js",
  }

});

// Creating cards

const CARD_CHARS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const CARD_SUITS = ["♠", "♥", "♣", "♦"];
const CARD_COLOR = {
  "♠": " darkblue",
  "♥": "darkred",
  "♣": "darkgreen",
  "♦": "darkgoldenrod"
};
let cards = [];
for (suit of CARD_SUITS) {
  for (char of CARD_CHARS) {
    const _FLIPPED = new Binder(true);
    let card = DOM.set({
      width: "2.5em",
      height: "3.4em",
      textAlign: "center",
      padding: "1em 0.5em",
      margin: "0.25em",
      fontFamily: "IrishGrover",
      color: CARD_COLOR[suit],
      backgroundColor: _FLIPPED.as(palette.accent, palette.light),
      borderRadius: "0.25em",
      boxShadow: "1px 1px 3px black",
      cursor: "pointer",
      span: {
        opacity: _FLIPPED.as(0, 1),
        text: char + suit,
      },
      click: e => card.toggle(),
    }, "section", false);
    card.show = () => _FLIPPED.value = true;
    card.hide = () => _FLIPPED.value = false;
    card.toggle = () => _FLIPPED.value ? card.hide() : card.show();
    cards.push(card);
  }
};
_CARD_DECK.value = cards;


//Actions

function hideAll() {
  cards.forEach(card => card.hide());
}

function showAll() {
  cards.forEach(card => card.show());
}

function toggleAll() {
  cards.forEach(card => card.toggle());
}

function shuffle() {
  cards.sort((a, b) => Math.random() - 0.5);
  _CARD_DECK.value = cards;
}

function randomFlip() {
  hideAll();
  shuffle();
  for (let i = 0; i < randomInput.value; i++) {
    cards[i].show();
  }
  shuffle();
}