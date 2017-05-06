[![Build Status](https://travis-ci.org/philtoms/hyperhtml-loader.svg)](https://travis-ci.org/philtoms/hyperhtml-loader)

## First cut - experimental
loader for normalising expression prefixes and generating javaScript modules from html templates.

## Install

```
npm install --save-dev hyperhtml-loader
```

## Usage
```
var rules = [{
    "test": /\.hyp?$/,
    "use": "hyperhtml-loader"
}];
```

## Prefix substitution and whitespace
By using a different prefix `&` for html expressions, the loader is able to normalise the output for attributes, text nodes and html nodes:

```
<div attr=${props.myAttr}>
  <p>${'some text'}</p>
  <div>
    &{props.myMarkup}
  </div>
</div>

// becomes...

export default (render, props) => render`<div attr="${props.myAttr}">
  <p> ${'some text'} </p>
  <div>${props.myMarkup}</div>
</div>`
```

The module can be imported in the usual way:

```
import render from './myView.hyp'

render(hyperHTML.bind(app), {
  myAttr: 123,
  myMarkup: '<p>some markup</p>'
})
```

## Example project
The example folder contains a simple webpack boilerplate that demonstrates this loader in action

## Test

```
npm test
```

## License
ISC