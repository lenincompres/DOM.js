const CARD_NUMS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CARD_SUITS = ['♠', '♥', '♣', '♦'];

let selectedSuit = CARD_SUITS[0];
let selectedNum = CARD_NUMS[0];

DOM.set({
  head: {
    title: 'Deck of Cards',
    charset: 'UTF-8',
    icon: 'icon.ico',
    keywords: 'javaScript, frameworks, gallery, sample',
    description: 'Card deck inspired sample for DOM.js',
    viewport: {
      width: 'device-width',
      initialScale: 1,
    },
    font: {
      fontFamily: 'cardFont',
      src: 'IrishGrover.ttf',
    },
  },
  css: {
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
  },
  style: {
    backgroundColor: 'silver',
    backgroundImage: 'url(bg.png)',
    textAlign: 'center',
    maxWidth: '30em',
    margin: '1em auto',
    border: '1em solid white',
  },
  children: [{
      tag: 'header',
      backgroundColor: 'black', // you may asign selectors without a style property
      color: 'white',
      padding: '1em',
      h1: { // you may append elements without a children property
        color: 'wheat',
        text: 'Pick a card', // 'text' = 'innerText'
      },
      p: 'Simple sample created with <a href="#">DOM.js</a>'
    },
    {
      tag: 'main',
      backgroundColor: 'white',
      padding: '2em',
      div: {
        id: 'theCard',
        backgroundColor: 'white',
        verticalAlign: 'center',
        fontFamily: 'cardFont',
        fontSize: '3em',
        textAlign: 'center',
        padding: '1.25em 0',
        width: '2.8em',
        height: '4em',
        margin: '0 auto',
        boxShadow: '1px 1px 3px black',
        borderRadius: '0.3em',
        span: [{
          id: 'theNumber',  
          text: selectedNum,
        }, {
          id: 'theSuit',
          text: selectedSuit,
        }]
      }
    },
    {
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
              id: 'numSelect',
              value: selectedNum,
              option: CARD_NUMS,
              change: updateNum,
            }
          }, {
            label: 'Suit: ',
            select: {
              id: 'suitSelect',
              value: selectedSuit,
              option: CARD_SUITS,
              change: updateSuit,
            }
          }, {
            button: {
              text: 'Random',
              click: randomCard,
            }
          }]
        },
      }
    }
  ]
});

// Functions

function updateCard(){
  let index = CARD_SUITS.indexOf(selectedSuit);
  theCard.set({
    color: (index % 2) ? 'darkred' : 'black',
  });
  theNumber.set({
    text: selectedNum,
  });
  theSuit.set({
    text: selectedSuit,
  });
}

function updateNum() {
  selectedNum = numSelect.value;
  updateCard();
}

function updateSuit() {
  selectedSuit = suitSelect.value;
  updateCard();
}

function randomCard(){
  selectedNum = CARD_NUMS[ Math.floor(Math.random() * CARD_NUMS.length) ];
  selectedSuit = CARD_SUITS[ Math.floor(Math.random() * CARD_SUITS.length) ];
  numSelect.value = selectedNum;
  suitSelect.value = selectedSuit;
  updateCard();
}