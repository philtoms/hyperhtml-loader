import fs from 'fs';
import { Reader, CharStream, isEOS, getCurrentReadtable, setCurrentReadtable } from 'readtable';

const WHITE_SPACE = /(\s|\n)/;

let source;

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
  const out =[];
  let nest = 1;
  let char = stream.readString();

  for (; !isEOS(char); char = stream.readString()) {
    out.push(char);
    if (char === '{') nest++;
    if (char === '}' && !(--nest)) break;
  }
  return isEOS(char) ? char : out.join('');
};

const defaultAction = stream => stream.readString();

const action = stream => {
  const out = [stream.readString()];
  let [lookAhead, ws] = eatWhitespace(stream);
  const key = stream.peek(lookAhead) + stream.peek(lookAhead + 1);

  // bail early on false match
  if (!['${', '@{', '&{'].includes(key)) {
    return out.join('');
  }

  // text expression - wrap with spaces or WS
  if (key === '&{') out.push(ws.length ? ws : ' ');

  // attr expression - wrap with single quotes
  if (key === '@{') out.push('\'');

  // standard prefix
  out.push('${');
  stream.readString(lookAhead + 2);

  const exprPos = stream.sourceInfo.position;

  let expr = readExpr(stream);
  if (isEOS(expr)) {
    const line = (source.substr(0, exprPos).match(/\n/g) || []).length + 1;
    /* eslint no-console:0 */
    console.log(`[] unexpected EOS at line ${line}`);
    return expr;
  }

  out.push(expr);

  // tidy up expression suffix
  [lookAhead, ws] = eatWhitespace(stream);
  if (key === '&{') out.push(ws.length ? ws : ' ');
  if (key === '@{') out.push('\'');
  stream.readString(lookAhead);

  return out.join('');
};

(() => {
  const src = process.argv[2];
  const currentTable = getCurrentReadtable();
  const entries = [{
    mode: 'non-terminating',
    action: defaultAction
  },{
    key: '=',
    mode: 'non-terminating',
    action: action
  },{
    key: '>',
    mode: 'non-terminating',
    action: action
  }];

  const newTable = currentTable.extend.apply(currentTable, entries);

  source = fs.readFileSync(src, 'utf-8');

  const stream = new CharStream(source);
  const reader = new Reader();

  setCurrentReadtable(newTable);

  let out = [];
  for (let block = reader.read(stream); true; block = reader.read(stream)) {
    out = out.concat(block);
    if (isEOS(stream.peek())) break;
  }
  fs.writeFileSync(`${src}.html`, out.join(''));
})();