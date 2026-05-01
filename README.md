# BareDOM `{DOM}`
The DOM, unbound.

```js
document.body.set({ h1: "Hello world" });
```

BareDOM is a minimalist JavaScript approach to building interfaces directly on the DOM—without frameworks, virtual DOMs, or template languages.

It extends native DOM elements with a small set of methods to **declare structure, behavior, and bindings in plain JavaScript**.

No JSX. No template languages. No framework components. No code switching.  
No separate HTML or CSS—unless you want them.

## Mental Model

Structure is declared. Behavior is bound. Reuse emerges.

BareDOM is built on four ideas:

- **Binder** → one reactive value
- **Elements** → extend into reusable, stateful patterns
- **element.set()** → declares structure, behavior, and bindings  
- **DOM.set()** → initializes the document (head + body)

BareDOM does not introduce components. Instead, elements grow into reusable, stateful patterns through extension and binding.

### Other Element extensions

- `element.get()` → read from the DOM  
- `element.let()` → create and return elements  
- `element.css()` → scoped styling  
- `element.bind()` → direct binding  

BareDOM is not a framework. It is a thin layer over the DOM that makes it more expressive without adding abstraction.

## Why BareDOM?

BareDOM is for when you want:

- Direct control over the DOM
- No virtual DOM or diffing
- No template languages (JSX, HTML-in-JS)
- Minimal abstraction
- A small, readable mental model

Instead of learning a framework, you extend what already exists.

BareDOM does not replace the DOM. It makes it more expressive.

## Example

A reactive value:

```js
const _count = new Binder(0);

document.body.set({
  h1: {
    text: _count.as(c => `Count: ${c}`),
  },
  button: {
    text: "Increment",
    onclick: () => _count.value++
  }
});
```

> Not simply vanilla. Bare.

---

by Lenin Comprés

P5 editor examples by John Henry Thompson

---

## Setup

The following is all the HTML we are going to need for the entirety of this documentation. It is our _index.html_ file. The rest of our code will be in JavaScript (_main.js_). We will not need CSS either.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdn.jsdelivr.net/gh/lenincompres/DOM.js@latest/DOM.js"></script>
  </head>
  <body>
    <script src="main.js"></script>
  </body>
</html>
```

For server-side usage, see [BareDOM-server](https://github.com/lenincompres/DOM.js-server)

## DOM.set()

`DOM.set()` initializes and renders the document.

It:
- renders elements
- configures `<head>` and `<body>`
- applies the BareDOM CSS reset

```js
DOM.set({
  title: "My App",
  main: {
    h1: "Hello World",
    p: "Lorem ipsum…"
  }
});
```

DOM.set() is intended as a document-level initializer.

You may also invoke the `set` method directly on an element to model it:

```javascript
someElement.set({
  h3: 'Hello world',
  p: 'Lorem  ipsum…',
});

document.body.set({
  main: someElement,
  footer: 'This is Baredom.',
});
```

In this case, no CSS reset is applied.

The new **h3** and **p** elements will be appended to the element.
[See live code sample](https://editor.p5js.org/jht9629-nyu/sketches/Bv2yPxl9Y)

---

<details>
  <summary>Other ways to use DOM.set</summary>
  
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
  h1: 'Hello world',
  p: 'This is <b>a</b> paragraph.';
}, 'main', someElement);
```

DOM.set is agnostic about the order of the arguments that follow the first (model structure):

- An **element** is where the model should be created instead of _document.body_.
- A **string** is a tag for a new element to be created.

The following code creates and returns a main element, and adds it to the document body.

```javascript
let mainElement = DOM.set(
  {
    h1: 'Hello world',
    p: 'This is <b>a</b> paragraph.',
  },
  'main'
);
```

The following code creates an image element without adding it to the document body.

```javascript
let mainImage = DOM.set(
  {
    alt: 'Hello world',
    src: 'myImage.png',
  },
  'img',
  false,
);
```

For DOM.set, a boolean argument with a *false* value indicates that this element should not be appended to the document body. A value of *true* would mean that the element (and/or model) will replace all the current content in the DOM (or in the element invoking the **set** method).

Models may contain properties for tags and ids, and a children or element array of similar or different elements.

```javascript
const model = {
  tag: 'div',
  id: 'container',
  children: [
    {
      tag: 'h1',
      innerHTML: 'Hello, World!'
    },
    {
      tag: 'p',
      innerHTML: 'This is a paragraph.'
    }
  ]
};

document.body.set(model);
```

</details>

---

### Properties: Attributes, Events and listeners

The `set` method recognizes **properties** in the model structure, such as attributes or event handlers. You may use a unique name that will become the element's id, and indicate the tag as a key property. Or, use a selector style name, which may even include classes separated by periods.

```javascript
document.body.set({
  input: {
    id: 'myInput',
    placeholder: 'Type value here',
    onchange: (event) => alert(myInput.value),
    click: (event) => alert('It recognizes event types to add listeners; as well as event methods.'),
  },
  goBtn: {
    tag: 'button',
    class: 'green-button',
    innerText: 'Go',
    addEventListener: {
      type: 'click',
      listener: (event) => (myInput.value = 'Go Button clicked'),
    },
  },
  'button#cancelBtn.red-button': {
    text: 'Cancel',
    onclick: (event) => alert('The cancel button was clicked'),
  }
});

goBtn.style.border = 'solid 2px lime';
```

[See live code sample](https://editor.p5js.org/jht9629-nyu/sketches/IJDh1-znl)

NOTE:

- Providing an element with an _id_ will create a global variable (with that name) to hold that element.
- Use _text_ or _innerText_, _html_ or _innerHTML_, or simply _content_ for the element's inner content.
- Use _markdown_ or _md_ for HTML markdown inline notations (bold, italics, and links).

The **set** method allows you to modify attributes, styles, event handlers, and content of existing elements with just one call.

```javascript
myElement.set({
  padding: '0.5em 2em',
  backgroundColor: 'lavender',
  text: 'Some text',
});
```

### Classes

You can set up the class attribute of the element passing a string to replace its content.

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

DOM.let() creates elements without attaching them to the DOM.

```javascript
const myParagraph = DOM.let('p', {
  padding: '0.5em 2em',
  backgroundColor: 'lavender',
  text: 'Some text',
});

document.body.set({
  header: {
    h1: 'loading an element',
    p: 'The element was create before the DOM is set.',
  },
  main: {
    p: myParagraph,
  },
});
``` 

[See live code sample](https://editor.p5js.org/jht9629-nyu/sketches/Hl1Tu1U1U)

### Set the Head

Just as with any element, you may invoke the **set** method on the head element. Many of its properties can be set directly. It will even link fonts and make them available as font-family styles.

```javascript
document.head.set({
  title: 'Title of the webpage',
  charset: 'UTF-8',
  icon: 'icon.ico',
  keywords: 'website,multiple,keywords',
  description: 'Website created with BareDOM',
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
const myHeader = DOM.let('header', {
  h1: 'Page built with DOM.set',
});

const myMain = DOM.let('main', {
  article: {
    h2: 'Basic DOM element',
    p: '<b>This</b> is a paragraph.',
  },
});

const myFooter = DOM.let('footer', {
  p: 'Made with BareDOM',
});

DOM.set({
  title: 'Title of the webpage',
  charset: 'UTF-8',
  icon: 'icon.ico',
  keywords: 'website,multiple,keywords',
  description: 'Website created with BareDOM',
  header: myHeader,
  main: myMain,
  footer: myFooter,
});
```

### Set an Array of Elements

Use arrays to create multiple consecutive elements of the same kind.

```javascript
myElement.set({
  ul: {
    li: ['First item', 'Second item', 'A third one, for good measure'],
  },
});
```

Declaring the array inside a _content_ property allows you to set other properties for all the elements in the array.

```javascript
myElement.set({
  ul: {
    li: {
      id: 'listedThings',
      style: 'font-weight:bold',
      height: '20px ',
      content: ['first item', 'second item', 'a third for good meassure'],
    },
  },
});

// The following makes the second element yellow
listedThings[1].set({
  backgroundColor: 'yellow',
});
```

When an _id_ is provided, a global variable holding the array of elements is created.
If you give several elements the same _id_, DOM.set will group them in one global array.

Arrays can create consecutive elements of different types; just indicate their _tag_ as a property.

```javascript
document.body.set({
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

You can name these elements anything—in this case, they were named _elements_—; another recommended name is _children_. Each will be assigned a specified tag. But, you must avoid using known property names like: _content_, _margin_, _text_, etc. Using a plural word for the property helps avoid this mistake.

Similarly, if you give DOM.set an array, it assumes it is an array of elements, and will create them as *div*s, or any tag property they possess.

```javascript
document.body.set([
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
## Usage Examples and Component Architecture

BareDOM allows you to build modular, reusable components by expanding the HTMLElement class. Here's an example:

```javascript
class CustomElement extends HTMLElement {
  constructor() {
    super();
    this.set({
      h2: "A title",
      p: "A paragraph.",
      button: {
        text: "Click Me!",
        onclick: () => this.clickAction(),
      }
    });
  }

  clickAction() {
    alert("Button clicked!");
  }
}

customElements.define('custom-element', CustomElement);
```

This allows you to use **<custom-button></custom-button>** in your HTML. BareDOM enables simple, modular structures by extending native elements.

---

## Styling Elements with BareDOM

### Style Attribute

Assign a string to the _style_ property to update the inline style of the element—replacing any previous value.

```javascript
const myMain = DOM.let('main', {
  style: 'margin: 20px; font-family: Tahoma; background-color: gray;',
  content: 'The style is in the style attribute of the main element.',
});

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
const myMain = DOM.let('main', {
  style: {
    margin: '20px',
    fontFamily: 'Tahoma',
    backgroundColor: 'gray',
  },
  content: {
    h1: 'Styled Main Element',
    p: 'This manages the style values individually.',
  },
});

document.body.set({
  header: {
    h1: 'Example of styling',
  },
  main: myMain,
  footer: 'the footer',
});
```

This is equivalent to using the [style property of DOM elements](https://www.w3schools.com/jsref/prop_html_style.asp).

Styles may be assigned without an encompassing _style_ property. The previous code could be written as follows.

```javascript
const myMain = DOM.let('main', {
  margin: '20px',
  fontFamily: 'Tahoma',
  backgroundColor: 'gray',
  h1: 'Styled Main Element',
  p: 'This manages the style values individually.',
});

document.body.set({
  header: {
    h1: 'Example of styling',
  },
  main: myMain,
  footer: 'the footer',
});
```

The _style_, _attribute_, and _content_ properties are useful for organizing the model structure, and to clarify what kind of property you are trying to set. If BareDOM is not setting a value in the right property you intended to (style, attributes, events, etc.), you should put this key/value pair inside one of these wrapping or organizing properties.
Yet, **DOM.set** interprets structural properties to match attributes, styles, event handlers and element tags.

### Style Element

If _style_ has a _content_ property, an element with a style tag and CSS content is created. Click here to [learn about CSS](https://www.w3schools.com/css/css_intro.asp).

```javascript
const myMain = DOM.let('main', {
  style: {
    lang: 'scss',
    content: 'main { margin: 20px; font-family: Tahoma; color: gray; }',
  },
  content: 'This style is applied to all MAIN elements in the page.',
});

document.body.set({
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
const myMain = DOM.let('main', {
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
});

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
- **_class, tag_class**: Leading underscores and any other in the selector are turned into (.) to indicate classes.
- **\_\_class**: Two leading underscores mean the class is applied to the parent selector.

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
  __disabled: {
    // #mainArea.disabled
    pointerEvents: 'none',
    filter: 'blur(2px)',
  }
});
```

---

## Binding

<!-- JHT: recommend Binding section move up before CSS  -->

Any element's property (attribute, content, style, content or event handler) can be **bound** to a _Binder_ object.
When the _value_ property of this object changes, it automatically updates all element properties' bound to it.

```javascript
const _myBinder = new Binder('Default value');

const myMain = DOM.let('main', {
  input: {
    value: _myBinder,
  },
  p: {
    text: _myBinder,
  },
  button: {
    text: 'Go',
    onclick: (event) => (_myBinder.value = 'Go was clicked.'),
  },
});

DOM.set({
  header: {
    h1: 'Example of binding',
  },
  main: myMain,
  footer: 'the footer',
});
```

The convention of declaring binders as a constant and naming them in all-caps, or preceded by an underscore character, can be helpful.

[See live code sample](https://editor.p5js.org/jht9629-nyu/sketches/DNCSUTBnq)

### Binding Functions

Using the **.as()** method of the binders, you may provide a function that returns the correct value to assign to the element's property based on the value of the binder, or provide an object model to map the values to.

```javascript
const _fieldEnabled = new Binder(false);

const myMain = DOM.let('main', {
  div: {
    style: {
      background: _fieldEnabled.as({
        false: 'gray',
        true: 'green',
      }),
      // the key 'default' can be used for multiple values of the binder
      color: _fieldEnabled.as('silver', 'lightgreen'),
      // with primitive arguments (or an array) the method returns one based on the integer value of the binder (false = 0, true = 1)
    },
    input: {
      enabled: _fieldEnabled,
      value: _fieldEnabled.as((value) => `The field is: ${value}.`),
    },
    button: {
      class: {
        enabled: _fieldEnabled,
        // classes passed as object keys can be bound as well.
      },
      text: 'toggle',
      onclick: () => (_fieldEnabled.value = !_fieldEnabled.value),
    },
  },
});

DOM.set({
  header: {
    h1: 'Example of binding',
  },
  main: myMain,
  footer: 'the footer',
});
```

[p5jsj](https://editor.p5js.org/jht9629-nyu/sketches/66VL3dHNk)

Classes in the classList can be bound to a binder as well. They changing value of _true_ or _false_ will determine if a class is added or removed.

### Binding outside the set method

You may call the _bind_ method of a binder and provide the element and property to be bound to it.

```javascript
_myBinder.bind(someElement, 'text', (value) => `The field is: ${value}.`);
```

The _bind_ method is agnostic about the order of the arguments provided.
An _element_ is the target, a _string_ the property to bind, and a _function_ will return the appropriate value to update the element.

The DOM.binder function may also be called with initial binding settings. The first argument will be the value of the binder.

```javascript
let _myBinder = DOM.binder(true, someElement, 'text', (value) => `The field is: ${value}.`);
```

#### Binding binders

You may update the value of other binders by binding them.

```javascript
_myBinder.bind(_anotherBinder, (value) => (value ? 'red' : 'blue'));
```

#### Listening to binders

You may add listener methods to be called when a binder is updated.

```javascript
_myBinder.onChange((value) => alert('The value was updated to: ' + value));
```

#### Binding array of values

If instead of a function or an object model, the binding is given an array, it assumes these outcomes to be indexed by the value of the binder.

```javascript
DOM.set({
  background: _fieldEnabled.as('gray', 'green'),
});

_myBinder.bind(someElement, 'text', ['field is disabled', 'field is enabled']);

_myBinder.bind(_anotherBinder, ['blue', 'red']);
```

Note that if the value is a boolean, _false_ would be position 0, and _true_ is position 1.

---

## Extending the HTMLElement class

To create custom HTML elements using the BareDOM approach, we can extend Javascript's HTMLElement class.

```javascript
// declares the class
class MyElement extends HTMLElement {
  #value = new Binder();

  constructor(startVal) {
    super();
    this.value = startVal;

    this.set({
      width: 'fit-content',
      padding: '2em',
      margin: '0 auto',
      display: 'block',
      textAlign: 'center',
      backgroundColor: this._value.as('red', 'green'),
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
    this.#value.value = val;
  }

  get value() {
    return this.#value.value;
  }

  get _value(){
    return this.#value;
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

[See live code sample](https://editor.p5js.org/jht9629-nyu/sketches/X1REi2O0H)

### Binder.set(): create binders and their setters and getters with one method

The method `Binder.set` creates binders, plus the setters and getters for them in your element objects. The names for the binders will be preceded by an underscore (_) once created, while the properties that get and set their values are accessible with the plain names (or keys) given to the method.

This allows you to treat binders like regular properties, while keeping their reactive behavior.

Attach binders to an object or class:

```javascript
// declares the class
class MyElement extends HTMLElement {
  constructor() {
    super();

    Binder.set(this, {
      active: false,
      otherProp: "initial other value",
    });

    this.set({
      padding: "1em",
      backgroundColor: this._active.as('red', 'green'),
      p: "This button toggles the active state of the element",
      button: {
        text: this._active.as('activate', 'deactivate'),
        onclick: (e) => this.active = !this.active,
      },
    });
  }
}
customElements.define('my-element', MyElement);
```

NOTE:
`Binder.set` can also create binders with their setters and getters globally or in any object:

```js
Binder.set(window, {
  myProp: 0
});

myProp++;

cosnt state = {};

Binder.set(state, {
  myProp: false
});

state.myProp = false;
```

## DOM.get() and element.get()

This method returns an element's property value based on a _string_ provided. It matches it to an attribute, style property, element tag (in the scope), or query selector. If no _string_ is provided, it returns the value property or the innerHTML.

```javascript
DOM.get('backgroundColor'); // returns the body's background color

document.body.get('backgroundColor'); // same as before

myElement.get('class'); // returns the class attribute of the element

myElement.get('classes'); // returns the classes in the attribute of the element as an array

myElement.get(); // returns the value (in the case of inputs) or the innerHTML

myElement.get('text'); // returns the innerText

myElement.get('article'); // returns the array of article tag elements within myElement's scope

myElement.get('.nice'); // similar to querySelectorAll, but returns an array of elements
```

## More uses of DOM.let() and element.let()

This method allows you to set the value of an element's property. And it allows you to set this value based on the current value of the property.

```javascript
document.body.let('backgroundColor', 'red');

myElement.let('text', 'New text');

myElement.let('color', cVal => cVal === 'red' ? 'blue' : 'green');  // It will apply this rule based on the current color,
```

When using the *DOM.let* and a tag name to create new elements, you add a boolean value as a third parameter. You may preppend (*true*) or not-append (*false*) the new element.

```
let myElement = DOM.let('section', {
    background: 'silver',
    h1: 'Heading of a new section',
  },
  false,
);

myElement.let('p', {
    margin: '2em',
    text: 'This is a new paragraph.',
  },
  true,
);
```

---

## Server-Side Usage

If you want to use BareDOM on the server (Node.js environment), check out the dedicated repository:

[DOM.js Server-Side](https://github.com/lenincompres/DOM.js-server)

It includes:
- `server.js` to serve `.dom.js` and `.dom.json` pages
- `build.js` to generate HTML from source files
- Instructions and dependencies for running BareDOM in a Node.js environment

---

## BareDOM and P5.js

Yes, DOM.set works for P5.js elements. If you are not familiar with P5.js, please [remedy that](https://p5js.org/).

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

[See live code sample](https://editor.p5js.org/jht9629-nyu/sketches/mLU67cNL0)

---

## License

MIT License


## Have fun!

BareDOM is not a framework.

It is the DOM, made usable.
