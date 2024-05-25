# DOM.js

by Lenin Compres

## Setup

The following is all the HTML we are going to need for the entirety of this documentation. It is our _index.html_ file. The rest of our code will be in javaScript (_main.js_). We will not need CSS either.

Click here to learn [what is HTML](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics)

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/gh/lenincompres/DOM.js@latest/DOM.js"></script>
  </head>
  <body>
    <script src="main.js"></script>
  </body>
</html>
```

## The DOM.set Method

This library allows you to create DOM elements using a structural JavaScript object (or JSON) as a model.
Click here to learn [what is the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction).

```javascript
DOM.set({
  header: {
    h1: 'Page built with DOM.set',
  },
  main: {
    article: {
      h2: 'Basic DOM element',
      p: '<b>This</b> is a paragraph.',
    },
  },
  footer: {
    p: 'Made with DOM.js',
  },
});
```

If called before the body is loaded, **DOM.set** waits for the window _load_ event before executing.

You may also invoke the **set** method directly on an element to model it.

```javascript
someElement.set({
  h1: 'Hello world',
  p: 'This is a <b>paragraph</b>.',
});
```

The new **h1** and **p** elements will be appended to the element.

[p5js](https://editor.p5js.org/jht9629-nyu/sketches/Bv2yPxl9Y)

---

<details>
  <summary>Other ways to invoke DOM.set</summary>
  
  You may provide DOM.set with an element where the model structure should be created.

```javascript
DOM.set(
  {
    h1: 'Hello world',
    p: 'This <b>is</b> a paragraph.',
  },
  someElement
);
```

You may also provide a _string_ to indicate the tag for a new element where the DOM structure will be created.
The following example creates a _main_ element inside the _someElement_. It returns this _main_ element.

```javascript
DOM.set({
  h1: "Hello world",
  p: "This is <b>a</b> paragraph.";
}, "main", someElement);
```

DOM.set is agnostic about the order of the arguments that follow the first (model structure):

- An **element** is where the model should be created instead of _document.body_.
- A **string** is a tag for a new element to be created.

The following code creates and returns a main element, and does not add it to the dom.

```javascript
let mainElement = DOM.set(
  {
    h1: 'Hello world',
    p: 'This is <b>a</b> paragraph.',
  },
  'main'
);
```

</details>

---

### Properties: Attributes, Events and listeners

DOM.set recognizes **properties** in the model structure, such as attributes or event handlers.

```javascript
DOM.set({
  input: {
    id: 'myInput',
    placeholder: 'Type value here',
    onchange: (event) => alert(myInput.value),
    click: (event) => alert('It recognized event types to add listeners; as well as event methods.'),
  },
  button: {
    id: 'goBtn',
    innerText: 'Go',
    addEventListener: {
      type: 'click',
      listener: (event) => (myInput.value = 'Button pressed'),
    },
  },
});

myInput.style.border = 'none';
// goBtn.click();
```

[p5js](https://editor.p5js.org/jht9629-nyu/sketches/IJDh1-znl)

[p5js more inputs](https://editor.p5js.org/jht9629-nyu/sketches/AwB8tHJ15)

NOTE:

- Providing an element with an _id_ will create a global variable (with that name) to hold that element.
- Use _text_ or _innerText_, _html_ or _innerHTML_, or simply _content_ for the element's inner content.

The **set** method allows you to modify attributes, styles, event handlers, and content of existing elements with just one call.

```javascript
myElement.set({
  padding: '0.5em 2em',
  backgroundColor: 'lavender',
  text: 'Some text',
});
```

### Classes

You can set up the class attribute of the element passing a string to replace the content of the class tribute.

```javascript
myElement.set({
  class: 'my-classname other-classname',
});
```

Or, use an array, to add classes to the classList without replacing existing ones.

```javascript
myElement.set({
  class: ['my-classname', 'other-classname'],
});
```

You may also use an object to add or remove a class.

```javascript
myElement.set({
  class: {
    classname: false, // this removes the class "classname"
    'other-classname': true, // this adds the class
    'yet-another': isAnother, // this adds or removes depending of the truthy o falsy value of isAnother
  },
});
```

### Creating an element

DOM.set() returns a new element and appends it to the DOM when provided a tag as a second parameter. The following returns a paragraph.

```javascript
const myParagraph = DOM.set(
  {
    padding: '0.5em 2em',
    backgroundColor: 'lavender',
    text: 'Some text',
  },
  'p'
);

DOM.set({
  header: {
    h1: 'loading an element',
    p: 'The element was create before the DOM is set.',
  },
  main: {
    p: myParagraph,
  },
});
```

Conversely, if what you pass as a string argument is not a tag, but a known property like _attribute_, _style_, an event, or _class_, DOM.set will modify the property accordingly in the element invoking the method.

```javascript
myParagraph.set(
  {
    padding: '0.5em 2em',
    backgroundColor: 'lavender',
  },
  'style'
);

myButton.set(
  {
    warning: true,
    submit: false,
  },
  'class'
);

mySection.set(
  {
    id: 'my-button',
  },
  'attribute'
);

myButton.set((e) => runMethod(), 'click');
```

[p5js](https://editor.p5js.org/jht9629-nyu/sketches/Hl1Tu1U1U)

### Set the Head

Just as any element, you may invoke the **set** method on the head element. Many of its properties can be set directly. It will even link fonts and make them available as font-family styles.

```javascript
document.head.set({
  title: 'Title of the webpage',
  charset: 'UTF-8',
  icon: 'icon.ico',
  keywords: 'website,multiple,keywords',
  description: 'Website created with DOM.js',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  meta: {
    name: 'color-scheme',
    content: 'dark',
  },
  link: {
    rel: 'style',
    href: 'style.css',
  },
  style: {
    type: 'css',
    content: 'body{ margin:0; background-color:gray; }',
  },
  script: {
    type: 'module',
    src: 'main.js',
  },
  font: {
    fontFamily: 'myFont',
    src: 'fonts/myFont.ttf',
  },
});
```

The method also understands default values for properties like _link_, _style_, _font_, or _script_ elements; and accepts arrays of elements for them.

```javascript
document.head.set({
  link: 'style.css',
  style: 'body{ margin:0; backgroundColor: gray; }',
  script: ['main.js', 'lib/dependecies.js'],
  font: [
    'fonts/myFont.ttf',
    {
      fontFamily: 'aFont',
      src: 'fonts/anotherName.ott',
    },
  ],
});
```

Note how **set** recognizes common head information (icon, charset, keywords, description, etc).
In fact, the **DOM.set** method recognizes these as well, and adds them on the _document.head_ instead of the _body_.

```javascript
const myHeader = DOM.set(
  {
    h1: 'Page built with DOM.set',
  },
  'header'
);

const myMain = DOM.set(
  {
    article: {
      h2: 'Basic DOM element',
      p: '<b>This</b> is a paragraph.',
    },
  },
  'main'
);

const myFooter = DOM.set(
  {
    p: 'Made with DOM.set',
  },
  'footer'
);

DOM.set({
  title: 'Title of the webpage',
  charset: 'UTF-8',
  icon: 'icon.ico',
  keywords: 'website,multiple,keywords',
  description: 'Website created with DOM.set',
  header: myHeader,
  main: myMain,
  footer: myFooter,
});
```

### Set an Array of Elements

Use arrays to create multiple consecutive elements of the same kind.

```javascript
DOM.set({
  ul: {
    li: ['First item', 'Second item', 'A third one, for good meassure'],
  },
});
```

Declaring the array inside a _content_ property allows you to set other properties for all the elements in the array.

```javascript
DOM.set({
  ul: {
    li: {
      id: 'listedThings',
      style: 'font-weight:bold',
      height: '20px ',
      content: ['first item', 'second item', 'a third for good meassure'],
    },
  },
});

// Makes the second element yellow
listedThings[1].style.backgroundColor = 'yellow';
```

When an _id_ is provided, a global variable holding the array of elements is created.
In fact, if you give several elements the same _id_, DOM.set will group them in one global array.

Arrays can be used to create consecutive element of different types; just indicate their _tag_ as a property.

```javascript
DOM.set({
  main: {
    elements: [
      {
        tag: 'p',
        text: 'this one is a paragraph.',
      },
      {
        tag: 'img',
        src: 'thesource.jpg',
        alt: 'This one is an image',
      },
      {
        tag: 'p',
        text: 'another paragraph',
      },
    ],
  },
});
```

You can name this elements anything—in this case they were named _elements_—. Each will be assigned their specified tag. Just avoid using known property names like: _content_, _margin_, _text_, etc. Using a plural word for the property helps avoiding this mistake.

Similarly, if you give DOM.set an array, it assumes it is an array of elements, and will create them as *div*s, or any tag property they possess.

```javascript
DOM.set([
  {
    tag: 'p',
    text: 'this one is a paragraph.',
  },
  {
    tag: 'img',
    src: 'thesource.jpg',
    alt: 'This one is an image',
  },
  {
    tag: 'p',
    text: 'another paragraph',
  },
]);
```

---

## Styling Elements with DOM.js

### Style Attribute

Asign a string to the _style_ property to update the inline style of the element—replacing any previous value.

```javascript
const myMain = DOM.set(
  {
    style: 'margin: 20px; font-family: Tahoma; background-color: gray;',
    content: 'The style is in the style attribute of the main element.',
  },
  'main'
);

DOM.set({
  header: {
    h1: 'Example of styling',
  },
  main: myMain,
  footer: 'the footer',
});
```

### Style Properties

Asign a structural object to the _style_ to update individual style properties—use names in camelCase.

```javascript
const myMain = DOM.set(
  {
    style: {
      margin: '20px',
      fontFamily: 'Tahoma',
      backgroundColor: 'gray',
    },
    content: {
      h1: 'Styled Main Element',
      p: 'This manages the style values individually.',
    },
  },
  'main'
);

DOM.set({
  header: {
    h1: 'Example of styling',
  },
  main: myMain,
  footer: 'the footer',
});
```

This is equivalent to using the [style property of DOM elements](https://www.w3schools.com/jsref/prop_html_style.asp).

Styles may be assigned without an emcompasing _style_ property. The previous code could be written as follows.

```javascript
const myMain = DOM.set(
  {
    margin: '20px',
    fontFamily: 'Tahoma',
    backgroundColor: 'gray',
    h1: 'Styled Main Element',
    p: 'This manages the style values individually.',
  },
  'main'
);

DOM.set({
  header: {
    h1: 'Example of styling',
  },
  main: myMain,
  footer: 'the footer',
});
```

The _style_ and _content_ properties are useful for organizing the model structure.
Yet, **DOM.set** interprets structural properties to match attributes, styles, event handlers and element tags.

### Style Element

If _style_ has a _content_ property, an element with a style tag and CSS content is created. Click here to [learn about CSS](https://www.w3schools.com/css/css_intro.asp).

```javascript
const myMain = DOM.set(
  {
    style: {
      lang: 'scss',
      content: 'main { margin: 20px; font-family: Tahoma; color: gray; }',
    },
    content: 'This style is applied to all MAIN elements in the page.',
  },
  'main'
);

DOM.set({
  header: {
    h1: 'Example of styling',
  },
  main: myMain,
  footer: 'the footer',
});
```

This method is discouraged, since it will affect all elements in the DOM not just the one invoking **set**.

### CSS Property

Use _css:_ in your model structure to create styling rules that apply **only** to the current element and its children.

```javascript
const myMain = DOM.set(
  {
    css: {
      margin: '20px',
      fontFamily: 'Tahoma',
      backgroundColor: 'gray',
      nav: {
        a: {
          backgroundColor: 'silver',
          hover: {
            backgroundColor: 'gold',
          },
        },
      },
    },
    nav: {
      a: [
        {
          href: 'home.html',
          content: 'HOME',
        },
        {
          href: 'gallery.html',
          content: 'GALLERY',
        },
      ],
    },
  },
  'main'
);

DOM.set({
  header: {
    h1: 'Example of styling',
  },
  main: myMain,
  footer: 'the footer',
});
```

The CSS is added to the document.head's style element under the _id_ of the element where it is created.
If the element doesn't have an _id_, a unique one is provided for it.

Nested selectors affect all children in the hierarchy of the DOM.

- **tag\_**: Use a trailing underscore (\_) to affect only immediate children of the element.
- **tag_class**: Other underscores in the selector are turned into (.) to indicate classes.
- **\_\_class**: Two leading underscores means the class is applied to the parent selector.

```javascript
mainArea.css({
  a: {
    // #mainArea a
    backgroundColor: 'gray',
    __primary: {
      // #mainArea a.primary
      backgroundColor: 'gold',
    },
  },
  a_: {
    // #mainArea>a
    backgroundColor: 'silver',
    __primary: {
      // #mainArea>a.primary
      backgroundColor: 'red',
    },
  },
  a_primary: {
    // #mainArea a.primary
    backgroundColor: 'gold',
  },
  _primary: {
    // #mainArea .primary
    backgroundColor: 'green',
  },
  a_primary_: {
    // #mainArea>a.primary
    backgroundColor: 'red',
  },
});
```

---

## Binding

<!-- JHT: recommend Binding section move up before CSS  -->

Any element's property (attribute, content, style, content or event handler) can be **bound** to a _Binder_ object.
When the _value_ property of this object changes, it automatically updates all element properties' bound to it.

```javascript
const myBinder = new Binder('Default value');

const myMain = DOM.set(
  {
    input: {
      value: myBinder,
    },
    p: {
      text: myBinder,
    },
    button: {
      text: 'Go',
      onclick: (event) => (myBinder.value = 'Go was clicked.'),
    },
  },
  'main'
);

DOM.set({
  header: {
    h1: 'Example of binding',
  },
  main: myMain,
  footer: 'the footer',
});
```

[p5js](https://editor.p5js.org/jht9629-nyu/sketches/DNCSUTBnq)

### Binding Functions

You may provide a function that returns the correct value to assign to the element's property based on the value of the binder. Or provide an object model to map the values to.

```javascript
const fieldEnabled = new Binder(false);

const myMain = DOM.set(
  {
    div: {
      style: {
        background: fieldEnabled.as({
          true: 'green',
          false: 'gray',
        }),
      },
      input: {
        enabled: fieldEnabled,
        value: fieldEnabled.as((value) => `The field is: ${value}.`),
      },
      button: {
        class: {
          enablebutton: fieldEnabled, // classes passed as object keys can be bound as well.
        },
        text: 'toggle',
        onclick: () => (fieldEnabled.value = !fieldEnabled.value),
      },
    },
  },
  'main'
);

DOM.set({
  header: {
    h1: 'Example of binding',
  },
  main: myMain,
  footer: 'the footer',
});
```

[p5js](https://editor.p5js.org/jht9629-nyu/sketches/66VL3dHNk)

Classes in the classList can be bound to a binder as well. They changing value of _true_ or _false_ will determine if the class would be added or removed.

### Binding outside the set method

You may call the _bind_ method of a binder and provide the element and property to be bound to it.

```javascript
myBinder.bind(someElement, 'text', (value) => `The field is: ${value}.`);
```

The _bind_ method is agnostic about the order of the arguments provided.
An _element_ is the target, a _string_ the property to bind, and a _function_ will return the appropriate value to update the element.

The DOM.binder function may also be invoked with initial binding settings. The first argument will be the value of the binder.

```javascript
let myBinder = DOM.binder(true, someElement, 'text', (value) => `The field is: ${value}.`);
```

#### Binding binders

You may update the value of other binders by binding them.

```javascript
myBinder.bind(someOtherBinder, (value) => (value ? 'red' : 'blue'));
```

#### Listening to binders

You may add listerner methods to be called when a binder updates.

```javascript
myBinder.addListener((value) => alert('The value was updated to: ' + value));
```

#### Binding array of values

If instead of a function or an object model, the binding is given an array, it assumes these outcomes to be indexed by the value of the binder.

```javascript
DOM.set({
  background: fieldEnabled.as(['gray', 'green']),
});

myBinder.bind(someElement, 'text', ['field is disabled', 'field is enabled']);

myBinder.bind(someOtherBinder, ['blue', 'red']);
```

Note that if the value is a boolean, _false_ would be position 0, and _true_ is position 1.

---

## Extending the HTMLElement class

To create custom HTML elements using a DOM.js approach, we can extend Javascript's HTMLElement class

```javascript
// declares the class
class MyElement extends HTMLElement {
  constructor(startVal) {
    super();

    this.valueBinder = new Binder(startVal);

    this.set({
      width: 'fit-content',
      padding: '2em',
      margin: '0 auto',
      display: 'block',
      textAlign: 'center',
      backgroundColor: this.valueBinder.as((v) => (v ? 'green' : 'red')),
      p: {
        text: this.valueBinder,
      },
      button: {
        text: 'toggle',
        onclick: (e) => this.toggle(),
      },
    });
  }

  set value(val) {
    this.valueBinder.value = val;
  }

  get value() {
    return this.valueBinder.value;
  }

  toggle() {
    this.value = !this.value;
  }
}
customElements.define('my-element', MyElement);

// instantiate the element

let myElement = new MyElement(true);

DOM.set({
  h1: 'Extended HTML element',
  MyElement: myElement,
});
```

## [p5js](https://editor.p5js.org/jht9629-nyu/sketches/X1REi2O0H)

## DOM.get() and element.get()

This method returns a value based on the _string_ provided, it tries to match it to an attribute, style property, element tag (in the scope), or a query selector. If no station is given, it returns the value property or the innerHTML.

```javascript
DOM.get('backgroundColor'); // returns the body's background color

document.body.get('backgroundColor'); // same as before

myElement.get('class'); // returns the class attribute of the element

myElement.get('classes'); // returns the classes in the attribute of the element as an array

myElement.get(); // returns the value (in the case of inputs) or the innerHTML

myElement.get('text'); // returns the innerText

myElement.get('article'); // returns the array of article tag elements within someElement's scope

myElement.get('.nice'); // similar to querySelectorAll, but returns an array of elements
```

---

## DOM.js and P5.js

Yes, DOM.set works for P5.js elements. If you are not familiar with P5.js? [Remedy that](https://p5js.org/).

```javascript
p5.set({
  h1: 'Hello world',
  p: 'This is a paragraph.',
});
```

When called from p5 or a p5 element, all elements given an id are created as p5 elements, and can execute p5 methods.

```javascript
someP5Element.set({
  h1: 'Hello world',
  button: {
    id: 'goBtn',
    text: 'Go',
    mouseClicked: (e) => alert('Go was clicked.'),
  },
});

/* goBtn is a p5 Element. */

goBtn.addClass('nice-button');
```

[p5js](https://editor.p5js.org/jht9629-nyu/sketches/mLU67cNL0)

## Have fun!
