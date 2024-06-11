const CARD_NUMS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CARD_SUITS = ['♠', '♥', '♣', '♦'];
const CARD_COLOR = {
  '♠': 'darkblue',
  '♥': 'darkred',
  '♣': 'darkgreen',
  '♦': 'darkgoldenrod'
};

const _SELECTED_SUIT = new Binder();
const _SELECTED_NUM = new Binder(CARD_NUMS[0]);
const _SELECTED_COLOR = new Binder();

_SELECTED_SUIT.addListener((suit) => _SELECTED_COLOR.value = CARD_COLOR[suit]);
_SELECTED_SUIT.addListener((suit) => _SELECTED_NUM.value = _SELECTED_NUM.value);
_SELECTED_SUIT.value = CARD_SUITS[0];

const HEADER = {
  backgroundColor: _SELECTED_SUIT.as((suit) => CARD_COLOR[suit]),
  color: 'white',
  padding: '1em',
  h1: {
    color: 'wheat',
    text: 'Pick a card',
  },
  p: 'Simple sample created with <a href="#">DOM.js</a>'
};

const FOOTER_MODEL = {
  tag: 'footer',
  backgroundColor: '#ccc',
  padding: '1em',
  p: "Choose a number and suit",
  menu: {
    children: {
      padding: '0.5em',
      content: [{
        label: 'Number: ',
        select: {
          selectedIndex: _SELECTED_NUM.as((num) => CARD_NUMS.indexOf(num)),
          option: CARD_NUMS,
          change: (evt) => _SELECTED_NUM.value = evt.target.value,
        }
      }, {
        label: 'Suit: ',
        select: {
          selectedIndex: _SELECTED_SUIT.as((suit) => CARD_SUITS.indexOf(suit)),
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
      }]
    },
  }
};

const MAIN_MODEL = {
  tag: 'main',
  backgroundColor: 'white',
  padding: '2em',
  div: {
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
  section: {
    height: '1em',
    color: _SELECTED_COLOR,
    content: _SELECTED_NUM.as((num) => {
      num = parseInt(num);
      if (isNaN(num)) return '';
      let output = '';
      for (let i = 0; i < num; i++) {
        output += _SELECTED_SUIT.value + ' ';
      }
      return output;
    }),
  },
};

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
  css: CSS_MODEL,
  backgroundColor: 'silver',
  backgroundImage: 'url(bg.png)',
  textAlign: 'center',
  maxWidth: '30em',
  margin: '1em auto',
  border: '1em solid white',
  header: HEADER,
  main: MAIN_MODEL,
  footer: FOOTER_MODEL,
});