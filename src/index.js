import { Reader, CharStream, isEOS, getCurrentReadtable, setCurrentReadtable } from 'readtable';

const WHITE_SPACE = /(\s|\n)/;

const eatWhitespace = (stream) => {
  const out = [];
  let next = 0;
  let char = stream.peek(next);

  for (; WHITE_SPACE.test(char); char = stream.peek(++next)) {
    out.push(char);
  }
  return [next, out.join('')];
};

const readExpr = (stream) => {
  const exprPos = stream.sourceInfo.position;
  const out =[];
  let nest = 1;

  do {
    let char = stream.readString();

    if (isEOS(char)) {
      throw new Error({pos: exprPos});
    }

    out.push(char);

    if (char === '{') nest++;
    if (char === '}' && !(--nest)) break;
  }
  while (true);

  return out.join('');
};

const defaultAction = stream => stream.readString();

const action = type => stream => {
  const out = [stream.readString()];
  let [lookAhead, ws] = eatWhitespace(stream);
  const key = stream.peek(lookAhead) + stream.peek(lookAhead + 1);

  // bail early on false match
  if (!['${', '&{'].includes(key)) {
    return out.join('');
  }

  const expr = type === 'attr' ? type : key === '&{' ? 'html' : 'text';

  switch (expr) {
    case 'attr':
      // attr expression - wrap with single quotes
      out.push('"');
      break;
    case 'text':
      // text expression - wrap with spaces or WS
      out.push(ws.length ? ws : ' ');
  }

  // standard prefix
  out.push('${');
  stream.readString(lookAhead + 2);

  out.push(readExpr(stream));

  // tidy up expression suffix
  [lookAhead, ws] = eatWhitespace(stream);
  if (expr === 'text') out.push(ws.length ? ws : ' ');
  if (expr === 'attr') out.push('"');
  stream.readString(lookAhead);

  return out.join('');
};

export default source => {
  const currentTable = getCurrentReadtable();
  const entries = [{
    mode: 'non-terminating',
    action: defaultAction
  },{
    key: '=',
    mode: 'non-terminating',
    action: action('attr')
  },{
    key: '>',
    mode: 'non-terminating',
    action: action('node')
  }];

  const newTable = currentTable.extend.apply(currentTable, entries);
  const stream = new CharStream(source);
  const reader = new Reader();

  setCurrentReadtable(newTable);

  let out = [];
  try {
    do {
      out = out.concat(reader.read(stream));
      if (isEOS(stream.peek())) {
        return 'export default (render, props) => render`' + out.join('') + '`';
      }
    } while(true);
  } catch (err) {
    const line = (source.substr(0, err.pos).match(/\n/g) || []).length + 1;
    throw new Error(`[hyperhtml-loader] unexpected EOS at line ${line}`);
  }
};