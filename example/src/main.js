import hyperHTML from 'hyperhtml'
import render from  './view'

render( hyperHTML.bind(document.getElementById('app')), {
  attr: 'attr',
  text: 'text',
  html: '<p>html</p>'
});