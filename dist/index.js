"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScriptCordova = ScriptCordova;
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function ScriptCordova() {
  var _process$env$NODE_ENV, _process$env;
  var env = (_process$env$NODE_ENV = (_process$env = process.env) === null || _process$env === void 0 ? void 0 : _process$env.NODE_ENV) !== null && _process$env$NODE_ENV !== void 0 ? _process$env$NODE_ENV : null;
  var cwd = process.cwd();
  if (env === 'production') {
    return /*#__PURE__*/_react["default"].createElement("script", {
      src: "/cordova.js"
    });
  } else if (env === 'development') {
    return /*#__PURE__*/_react["default"].createElement("script", {
      src: "/_next/static/chunks/cordova.js"
    });
  }
}
function Init() {}
var _default = exports["default"] = Init;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfcmVhY3QiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsImUiLCJfX2VzTW9kdWxlIiwiU2NyaXB0Q29yZG92YSIsIl9wcm9jZXNzJGVudiROT0RFX0VOViIsIl9wcm9jZXNzJGVudiIsImVudiIsInByb2Nlc3MiLCJOT0RFX0VOViIsImN3ZCIsImNyZWF0ZUVsZW1lbnQiLCJzcmMiLCJJbml0IiwiX2RlZmF1bHQiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiLi4vbGliL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcblxyXG5mdW5jdGlvbiBTY3JpcHRDb3Jkb3ZhKCkge1xyXG5cclxuICAgIGNvbnN0IGVudiA9IHByb2Nlc3MuZW52Py5OT0RFX0VOViA/PyBudWxsO1xyXG4gICAgY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcclxuXHJcbiAgICBpZiAoZW52ID09PSAncHJvZHVjdGlvbicpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCIvY29yZG92YS5qc1wiPjwvc2NyaXB0PlxyXG4gICAgICAgICk7XHJcblxyXG4gICAgfSBlbHNlIGlmIChlbnYgPT09ICdkZXZlbG9wbWVudCcpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCIvX25leHQvc3RhdGljL2NodW5rcy9jb3Jkb3ZhLmpzXCI+PC9zY3JpcHQ+XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBJbml0KCkge1xyXG4gICAgXHJcblxyXG59XHJcblxyXG5leHBvcnQgeyBTY3JpcHRDb3Jkb3ZhIH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJbml0OyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLElBQUFBLE1BQUEsR0FBQUMsc0JBQUEsQ0FBQUMsT0FBQTtBQUEwQixTQUFBRCx1QkFBQUUsQ0FBQSxXQUFBQSxDQUFBLElBQUFBLENBQUEsQ0FBQUMsVUFBQSxHQUFBRCxDQUFBLGdCQUFBQSxDQUFBO0FBRTFCLFNBQVNFLGFBQWFBLENBQUEsRUFBRztFQUFBLElBQUFDLHFCQUFBLEVBQUFDLFlBQUE7RUFFckIsSUFBTUMsR0FBRyxJQUFBRixxQkFBQSxJQUFBQyxZQUFBLEdBQUdFLE9BQU8sQ0FBQ0QsR0FBRyxjQUFBRCxZQUFBLHVCQUFYQSxZQUFBLENBQWFHLFFBQVEsY0FBQUoscUJBQUEsY0FBQUEscUJBQUEsR0FBSSxJQUFJO0VBQ3pDLElBQU1LLEdBQUcsR0FBR0YsT0FBTyxDQUFDRSxHQUFHLENBQUMsQ0FBQztFQUV6QixJQUFJSCxHQUFHLEtBQUssWUFBWSxFQUFFO0lBRXRCLG9CQUNJUixNQUFBLFlBQUFZLGFBQUE7TUFBUUMsR0FBRyxFQUFDO0lBQWEsQ0FBUyxDQUFDO0VBRzNDLENBQUMsTUFBTSxJQUFJTCxHQUFHLEtBQUssYUFBYSxFQUFFO0lBRTlCLG9CQUNJUixNQUFBLFlBQUFZLGFBQUE7TUFBUUMsR0FBRyxFQUFDO0lBQWlDLENBQVMsQ0FBQztFQUcvRDtBQUVKO0FBRUEsU0FBU0MsSUFBSUEsQ0FBQSxFQUFHLENBR2hCO0FBQUMsSUFBQUMsUUFBQSxHQUFBQyxPQUFBLGNBSWNGLElBQUkiLCJpZ25vcmVMaXN0IjpbXX0=