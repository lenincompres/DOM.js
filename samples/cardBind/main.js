const CARD_NUMS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CARD_SUITS = ['♠', '♥', '♣', '♦'];
const CARD_COLOR = {
  '♠': 'darkblue',
  '♥': 'darkred',
  '♣': 'darkgreen',
  '♦': 'darkgoldenrod'
};

// Binders hold a 'value' that can be bound to elements' properties and change them as they change
const _SELECTED_SUIT = new Binder();
const _SELECTED_NUM = new Binder(CARD_NUMS[0]); // you may give them an initial value
const _SELECTED_COLOR = new Binder();

// You may add (or bind) listeners to be executed when their value changes
_SELECTED_SUIT.bind((suit) => _SELECTED_COLOR.value = CARD_COLOR[suit]);
_SELECTED_SUIT.bind((suit) => _SELECTED_NUM.value = _SELECTED_NUM.value);

_SELECTED_SUIT.value = CARD_SUITS[0];

const CSS_MODEL = {
  h: {
    fontFamily: 'Serif',
  },
  a: {
    color: 'skyblue',
    hover: {
      color: 'gold',
      textDecoration: 'underline',
    }
  },
  p: {
    marginBottom: "1em",
  },
  select: {
    minWidth: '3em',
  }
};

DOM.set({
  title: 'Deck of Cards',
  charset: 'UTF-8',
  icon: 'icon.ico',
  keywords: 'javaScript, frameworks, gallery, sample',
  description: 'Card deck inspired sample for DOM.js',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  font: 'IrishGrover.ttf',
  css: CSS_MODEL, // You may declare a JS model and assign it with DOM.set later
  backgroundColor: 'silver',
  backgroundImage: 'url(bg.png)',
  textAlign: 'center',
  maxWidth: '30em',
  margin: '1em auto',
  border: '1em solid white',
});

// You may set models separately
DOM.set({
  header: {
    backgroundColor: _SELECTED_COLOR, // The background color changes with the binder's value
    color: 'white',
    padding: '1em',
    h1: {
      id: 'mainTitle',
      color: 'wheat',
      text: 'Pick a card',
    },
    p: 'Simple sample created with <a href="#">DOM.js</a>',
  }
});

// Providing DOM.set a tag (string) argument returns an element
let footerElement = DOM.set({
  backgroundColor: '#ccc',
  padding: '1em',
  p: "Choose a number and suit",
  menu: {
    span: [{
      label: 'Number: ',
      select: {
        value: _SELECTED_NUM,
        option: CARD_NUMS,
        change: (evt) => _SELECTED_NUM.value = evt.target.value,
      }
    }, {
      padding: '0.5em',
      label: 'Suit: ',
      select: {
        value: _SELECTED_SUIT,
        option: CARD_SUITS,
        change: (evt) => _SELECTED_SUIT.value = evt.target.value,
      }
    }, {
      button: {
        text: 'Random',
        click: (evt) => {
          let randomNum = Math.floor(Math.random() * CARD_NUMS.length);
          let randomSuit = Math.floor(Math.random() * CARD_SUITS.length);
          _SELECTED_NUM.value = CARD_NUMS[randomNum];
          _SELECTED_SUIT.value = CARD_SUITS[randomSuit];
        },
      }
    }],
  }
}, 'footer', false);
// This string argument (or "station") indicates WHERE the model is going to be set
// An optional false argument tells it to create but not append this element

const MAIN_MODEL = {
  tag: 'main',
  backgroundColor: 'white',
  padding: '2em',
  section: {
    backgroundColor: 'white',
    verticalAlign: 'center',
    fontFamily: 'IrishGrover',
    fontSize: '3em',
    textAlign: 'center',
    padding: '1.25em 0.25em',
    width: '2.8em',
    height: '4em',
    margin: '0 auto',
    boxShadow: '1px 1px 3px black',
    borderRadius: '0.3em',
    color: _SELECTED_COLOR,
    span: [{
      text: _SELECTED_NUM,
    }, {
      text: _SELECTED_SUIT,
    }],
  },
  footer: {
    height: '1em',
    color: _SELECTED_COLOR,
    // The 'as' method uses the binder's value to get another value to assign
    text: _SELECTED_NUM.as((num) => {
      num = parseInt(num);
      let output = '';
      if (isNaN(num)) return output;
      for (let i = 0; i < num; i++) {
        output += _SELECTED_SUIT.value + ' ';
      }
      return output;
    }),
  },
};

DOM.set({
  main: MAIN_MODEL, // The main element is CREATED here
  footer: footerElement, // This existing footer element is appended (or MOVED) here
});