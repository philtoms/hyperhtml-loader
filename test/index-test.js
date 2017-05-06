import test from 'ava';
import loader from '../src';

const extract = str => loader(str).replace(/`/g,'').replace('export default (render, props) => render', '');

test('output as string', t => {
  t.is(typeof loader('<div/>'), 'string');
});

test('wrap markup in export template function', t => {
  t.is(loader('<div/>'), 'export default (render, props) => render`<div/>`');
});

test('interpolate attrs', t => {
  t.is(extract('<div attr=${}/>'), '<div attr="${}"/>');
});

test('eat white space around attrs', t => {
  t.is(extract('<div attr= ${}/>'), '<div attr="${}"/>');
});

test('interpolate text node', t => {
  t.is(extract('<div>${}</div>'), '<div> ${} </div>');
});

test('preserve white space around text node', t => {
  t.is(extract(`<div>
    ${123}
  </div>`),
  `<div>
    ${123}
  </div>`);
});

test('interpolate html node', t => {
  t.is(extract('<div>&{}</div>'), '<div>${}</div>');
});

test('eat white space around html node', t => {
  t.is(extract(`<div>
    &{<p/>}
  </div>`),
  '<div>${<p/>}</div>');
});

test('handle nested expressions', t => {
  t.is(extract('<div>${${${}}}</div>'), '<div> ${${${}}} </div>');
});

test('report line error', t => {
  try {
    loader(`<div>
      &{<p/></div>`);
  }
  catch(err) {
    t.is(err.message, '[hyperhtml-loader] unexpected EOS at line 2');
  }
});
