'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _readtable = require('readtable');

var WHITE_SPACE = /(\s|\n)/;

var eatWhitespace = function eatWhitespace(stream) {
  var out = [];
  var next = 0;
  var char = stream.peek(next);

  for (; WHITE_SPACE.test(char); char = stream.peek(++next)) {
    out.push(char);
  }
  return [next, out.join('')];
};

var readExpr = function readExpr(stream) {
  var exprPos = stream.sourceInfo.position;
  var out = [];
  var nest = 1;

  do {
    var char = stream.readString();

    if ((0, _readtable.isEOS)(char)) {
      throw new Error({ pos: exprPos });
    }
    out.push(char);
    if (char === '{') nest++;
    if (char === '}' && ! --nest) break;
  } while (true);

  return out.join('');
};

var defaultAction = function defaultAction(stream) {
  return stream.readString();
};

var action = function action(type) {
  return function (stream) {
    var out = [stream.readString()];

    var _eatWhitespace = eatWhitespace(stream),
        _eatWhitespace2 = _slicedToArray(_eatWhitespace, 2),
        lookAhead = _eatWhitespace2[0],
        ws = _eatWhitespace2[1];

    var key = stream.peek(lookAhead) + stream.peek(lookAhead + 1);

    // bail early on false match
    if (!['${', '&{'].includes(key)) {
      return out.join('');
    }

    var expr = type === 'attr' ? type : key === '&{' ? 'html' : 'text';

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

    var _eatWhitespace3 = eatWhitespace(stream);

    var _eatWhitespace4 = _slicedToArray(_eatWhitespace3, 2);

    lookAhead = _eatWhitespace4[0];
    ws = _eatWhitespace4[1];

    if (expr === 'text') out.push(ws.length ? ws : ' ');
    if (expr === 'attr') out.push('"');
    stream.readString(lookAhead);

    return out.join('');
  };
};

exports.default = function (source) {
  var currentTable = (0, _readtable.getCurrentReadtable)();
  var entries = [{
    mode: 'non-terminating',
    action: defaultAction
  }, {
    key: '=',
    mode: 'non-terminating',
    action: action('attr')
  }, {
    key: '>',
    mode: 'non-terminating',
    action: action('node')
  }];

  var newTable = currentTable.extend.apply(currentTable, entries);
  var stream = new _readtable.CharStream(source);
  var reader = new _readtable.Reader();

  (0, _readtable.setCurrentReadtable)(newTable);

  var out = [];
  try {
    do {
      out = out.concat(reader.read(stream));
      if ((0, _readtable.isEOS)(stream.peek())) {
        return 'export default (render, props) => render`' + out.join('') + '`';
      }
    } while (true);
  } catch (err) {
    var line = (source.substr(0, err.pos).match(/\n/g) || []).length + 1;
    throw new Error(`[hyperhtml-loader] unexpected EOS at line ${line}`);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJXSElURV9TUEFDRSIsImVhdFdoaXRlc3BhY2UiLCJzdHJlYW0iLCJvdXQiLCJuZXh0IiwiY2hhciIsInBlZWsiLCJ0ZXN0IiwicHVzaCIsImpvaW4iLCJyZWFkRXhwciIsImV4cHJQb3MiLCJzb3VyY2VJbmZvIiwicG9zaXRpb24iLCJuZXN0IiwicmVhZFN0cmluZyIsIkVycm9yIiwicG9zIiwiZGVmYXVsdEFjdGlvbiIsImFjdGlvbiIsImxvb2tBaGVhZCIsIndzIiwia2V5IiwiaW5jbHVkZXMiLCJleHByIiwidHlwZSIsImxlbmd0aCIsImN1cnJlbnRUYWJsZSIsImVudHJpZXMiLCJtb2RlIiwibmV3VGFibGUiLCJleHRlbmQiLCJhcHBseSIsInNvdXJjZSIsInJlYWRlciIsImNvbmNhdCIsInJlYWQiLCJlcnIiLCJsaW5lIiwic3Vic3RyIiwibWF0Y2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBRUEsSUFBTUEsY0FBYyxTQUFwQjs7QUFFQSxJQUFNQyxnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQUNDLE1BQUQsRUFBWTtBQUNoQyxNQUFNQyxNQUFNLEVBQVo7QUFDQSxNQUFJQyxPQUFPLENBQVg7QUFDQSxNQUFJQyxPQUFPSCxPQUFPSSxJQUFQLENBQVlGLElBQVosQ0FBWDs7QUFFQSxTQUFPSixZQUFZTyxJQUFaLENBQWlCRixJQUFqQixDQUFQLEVBQStCQSxPQUFPSCxPQUFPSSxJQUFQLENBQVksRUFBRUYsSUFBZCxDQUF0QyxFQUEyRDtBQUN6REQsUUFBSUssSUFBSixDQUFTSCxJQUFUO0FBQ0Q7QUFDRCxTQUFPLENBQUNELElBQUQsRUFBT0QsSUFBSU0sSUFBSixDQUFTLEVBQVQsQ0FBUCxDQUFQO0FBQ0QsQ0FURDs7QUFXQSxJQUFNQyxXQUFXLFNBQVhBLFFBQVcsQ0FBQ1IsTUFBRCxFQUFZO0FBQzNCLE1BQU1TLFVBQVVULE9BQU9VLFVBQVAsQ0FBa0JDLFFBQWxDO0FBQ0EsTUFBTVYs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QUFFQSxzQ0FBb0JKLFFBQXBCOztBQUVBLE1BQUkzQixNQUFNLEVBQVY7QUFDQSxNQUFJO0FBQ0YsT0FBRztBQUNEQSxZQUFNQSxJQUFJZ0MsTUFBSixDQUFXRCxPQUFPRSxJQUFQLENBQVlsQyxNQUFaLENBQVgsQ0FBTjtBQUNBLFVBQUksc0JBQU1BLE9BQU9JLElBQVAsRUFBTixDQUFKLEVBQTBCO0FBQ3hCLGVBQU8sOENBQThDSCxJQUFJTSxJQUFKLENBQVMsRUFBVCxDQUE5QyxHQUE2RCxHQUFwRTtBQUNEO0FBQ0YsS0FMRCxRQUtRLElBTFI7QUFNRCxHQVBELENBT0UsT0FBTzRCLEdBQVAsRUFBWTtBQUNaLFFBQU1DLE9BQU8sQ0FBQ0wsT0FBT00sTUFBUCxDQUFjLENBQWQsRUFBaUJGLElBQUlwQixHQUFyQixFQUEwQnVCLEtBQTFCLENBQWdDLEtBQWhDLEtBQTBDLEVBQTNDLEVBQStDZCxNQUEvQyxHQUF3RCxDQUFyRTtBQUNBLFVBQU0sSUFBSVYsS0FBSixDQUFXLDZDQUE0Q3NCLElBQUssRUFBNUQsQ0FBTjtBQUNEO0FBQ0YsQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlYWRlciwgQ2hhclN0cmVhbSwgaXNFT1MsIGdldEN1cnJlbnRSZWFkdGFibGUsIHNldEN1cnJlbnRSZWFkdGFibGUgfSBmcm9tICdyZWFkdGFibGUnO1xuXG5jb25zdCBXSElURV9TUEFDRSA9IC8oXFxzfFxcbikvO1xuXG5jb25zdCBlYXRXaGl0ZXNwYWNlID0gKHN0cmVhbSkgPT4ge1xuICBjb25zdCBvdXQgPSBbXTtcbiAgbGV0IG5leHQgPSAwO1xuICBsZXQgY2hhciA9IHN0cmVhbS5wZWVrKG5leHQpO1xuXG4gIGZvciAoOyBXSElURV9TUEFDRS50ZXN0KGNoYXIpOyBjaGFyID0gc3RyZWFtLnBlZWsoKytuZXh0KSkge1xuICAgIG91dC5wdXNoKGNoYXIpO1xuICB9XG4gIHJldHVybiBbbmV4dCwgb3V0LmpvaW4oJycpXTtcbn07XG5cbmNvbnN0IHJlYWRFeHByID0gKHN0cmVhbSkgPT4ge1xuICBjb25zdCBleHByUG9zID0gc3RyZWFtLnNvdXJjZUluZm8ucG9zaXRpb247XG4gIGNvbnN0IG91dCA9W107XG4gIGxldCBuZXN0ID0gMTtcblxuICBkbyB7XG4gICAgbGV0IGNoYXIgPSBzdHJlYW0ucmVhZFN0cmluZygpO1xuXG4gICAgaWYgKGlzRU9TKGNoYXIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3Ioe3BvczogZXhwclBvc30pO1xuICAgIH1cbiAgICBvdXQucHVzaChjaGFyKTtcbiAgICBpZiAoY2hhciA9PT0gJ3snKSBuZXN0Kys7XG4gICAgaWYgKGNoYXIgPT09ICd9JyAmJiAhKC0tbmVzdCkpIGJyZWFrO1xuICB9XG4gIHdoaWxlICh0cnVlKTtcblxuICByZXR1cm4gb3V0LmpvaW4oJycpO1xufTtcblxuY29uc3QgZGVmYXVsdEFjdGlvbiA9IHN0cmVhbSA9PiBzdHJlYW0ucmVhZFN0cmluZygpO1xuXG5jb25zdCBhY3Rpb24gPSB0eXBlID0+IHN0cmVhbSA9PiB7XG4gIGNvbnN0IG91dCA9IFtzdHJlYW0ucmVhZFN0cmluZygpXTtcbiAgbGV0IFtsb29rQWhlYWQsIHdzXSA9IGVhdFdoaXRlc3BhY2Uoc3RyZWFtKTtcbiAgY29uc3Qga2V5ID0gc3RyZWFtLnBlZWsobG9va0FoZWFkKSArIHN0cmVhbS5wZWVrKGxvb2tBaGVhZCArIDEpO1xuXG4gIC8vIGJhaWwgZWFybHkgb24gZmFsc2UgbWF0Y2hcbiAgaWYgKCFbJyR7JywgJyZ7J10uaW5jbHVkZXMoa2V5KSkge1xuICAgIHJldHVybiBvdXQuam9pbignJyk7XG4gIH1cblxuICBjb25zdCBleHByID0gdHlwZSA9PT0gJ2F0dHInID8gdHlwZSA6IGtleSA9PT0gJyZ7JyA/ICdodG1sJyA6ICd0ZXh0JztcblxuICBzd2l0Y2ggKGV4cHIpIHtcbiAgICBjYXNlICdhdHRyJzpcbiAgICAgIC8vIGF0dHIgZXhwcmVzc2lvbiAtIHdyYXAgd2l0aCBzaW5nbGUgcXVvdGVzXG4gICAgICBvdXQucHVzaCgnXCInKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RleHQnOlxuICAgICAgLy8gdGV4dCBleHByZXNzaW9uIC0gd3JhcCB3aXRoIHNwYWNlcyBvciBXU1xuICAgICAgb3V0LnB1c2god3MubGVuZ3RoID8gd3MgOiAnICcpO1xuICB9XG5cbiAgLy8gc3RhbmRhcmQgcHJlZml4XG4gIG91dC5wdXNoKCckeycpO1xuICBzdHJlYW0ucmVhZFN0cmluZyhsb29rQWhlYWQgKyAyKTtcblxuICBvdXQucHVzaChyZWFkRXhwcihzdHJlYW0pKTtcblxuICAvLyB0aWR5IHVwIGV4cHJlc3Npb24gc3VmZml4XG4gIFtsb29rQWhlYWQsIHdzXSA9IGVhdFdoaXRlc3BhY2Uoc3RyZWFtKTtcbiAgaWYgKGV4cHIgPT09ICd0ZXh0Jykgb3V0LnB1c2god3MubGVuZ3RoID8gd3MgOiAnICcpO1xuICBpZiAoZXhwciA9PT0gJ2F0dHInKSBvdXQucHVzaCgnXCInKTtcbiAgc3RyZWFtLnJlYWRTdHJpbmcobG9va0FoZWFkKTtcblxuICByZXR1cm4gb3V0LmpvaW4oJycpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgc291cmNlID0+IHtcbiAgY29uc3QgY3VycmVudFRhYmxlID0gZ2V0Q3VycmVudFJlYWR0YWJsZSgpO1xuICBjb25zdCBlbnRyaWVzID0gW3tcbiAgICBtb2RlOiAnbm9uLXRlcm1pbmF0aW5nJyxcbiAgICBhY3Rpb246IGRlZmF1bHRBY3Rpb25cbiAgfSx7XG4gICAga2V5OiAnPScsXG4gICAgbW9kZTogJ25vbi10ZXJtaW5hdGluZycsXG4gICAgYWN0aW9uOiBhY3Rpb24oJ2F0dHInKVxuICB9LHtcbiAgICBrZXk6ICc+JyxcbiAgICBtb2RlOiAnbm9uLXRlcm1pbmF0aW5nJyxcbiAgICBhY3Rpb246IGFjdGlvbignbm9kZScpXG4gIH1dO1xuXG4gIGNvbnN0IG5ld1RhYmxlID0gY3VycmVudFRhYmxlLmV4dGVuZC5hcHBseShjdXJyZW50VGFibGUsIGVudHJpZXMpO1xuICBjb25zdCBzdHJlYW0gPSBuZXcgQ2hhclN0cmVhbShzb3VyY2UpO1xuICBjb25zdCByZWFkZXIgPSBuZXcgUmVhZGVyKCk7XG5cbiAgc2V0Q3VycmVudFJlYWR0YWJsZShuZXdUYWJsZSk7XG5cbiAgbGV0IG91dCA9IFtdO1xuICB0cnkge1xuICAgIGRvIHtcbiAgICAgIG91dCA9IG91dC5jb25jYXQocmVhZGVyLnJlYWQoc3RyZWFtKSk7XG4gICAgICBpZiAoaXNFT1Moc3RyZWFtLnBlZWsoKSkpIHtcbiAgICAgICAgcmV0dXJuICdleHBvcnQgZGVmYXVsdCAocmVuZGVyLCBwcm9wcykgPT4gcmVuZGVyYCcgKyBvdXQuam9pbignJykgKyAnYCc7XG4gICAgICB9XG4gICAgfSB3aGlsZSh0cnVlKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc3QgbGluZSA9IChzb3VyY2Uuc3Vic3RyKDAsIGVyci5wb3MpLm1hdGNoKC9cXG4vZykgfHwgW10pLmxlbmd0aCArIDE7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBbaHlwZXJodG1sLWxvYWRlcl0gdW5leHBlY3RlZCBFT1MgYXQgbGluZSAke2xpbmV9YCk7XG4gIH1cbn07Il19