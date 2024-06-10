

// general variables

const palette = {
  base: "lightGray",
  light: "white",
  dark: "#222",
  neutral: "#a97",
  accent: "#46a",
}


//DOM setup

DOM.set({
  title: "Deck of Cards",

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

  style: {
    color: palette.dark,
    display: "flex",
    flexDirection: "column",
    backgroundColor: palette.base,
  },

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
        click: randomFlip,
      }],
      input: {
        id: "randomInput",
        type: "number",
        margin: "0 -0.8em 0 .5em",
        width: "3em",
        min: 1,
        max: 10,
        value: 1,
      },
    },

    section: {
      id: "cardDeck",
      display: "flex",
      flexWrap: "wrap",
      fontSize: "1.2em",
      backgroundColor: palette.neutral,
      margin: "1em auto",
      padding: "0.5em",
      maxWidth: "40em",
      minHeight: "10em",
    }

  },

  footer: {
    textAlign: "center",
    padding: "1em",
    p: "Created by Lenin Compres using DOM.js",
    menu: {
      label: "Palette: ",
      input: {
        id: "colorChooser",
        type: "color",
        change: e => DOM.set({
          backgroundColor: colorChooser.value
        }),
      }
    }
  }

});

// Creating cards

const CARD_SUITS = ["♠", "♥", "♣", "♦"];

const CARD_CHARS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

let cards = [];
for (suit of CARD_SUITS) {
  for (char of CARD_CHARS) {
    let card = getNewCard(suit, char);
    cards.push(card);
  }
};

function getNewCard(suit, char) {
  let card = {};
  card._FLIPPED = new Binder(true);
  card.show = () => card._FLIPPED.value = true;
  card.hide = () => card._FLIPPED.value = false;
  card.toggle = () => card._FLIPPED.value ? card.hide() : card.show();
  card.elt = DOM.element({
    width: "2.5em",
    height: "3.4em",
    textAlign: "center",
    padding: "1em 0.5em",
    margin: "0.25em",
    color: (suit === "♥" || suit === "♦") ? "darkred" : "black",
    backgroundColor: card._FLIPPED.as(palette.accent, palette.light),
    borderRadius: "0.25em",
    boxShadow: "1px 1px 3px black",
    cursor: "pointer",
    p: {
      opacity: card._FLIPPED.as(0, 1),
      text: char + suit,
    },
    click: e => card.toggle(),
  });
  return card;
}

//Actions

function addCards(){
  for (let card of cards) {
    cardDeck.set(card.elt);
  }
}

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
  addCards();
}

function randomFlip() {
  hideAll();
  shuffle();
  for (let i = 0; i < randomInput.value; i++) {
    cards[i].show();
  }
  shuffle();
}

addCards(cardDeck);