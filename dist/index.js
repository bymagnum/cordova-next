"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScriptCordova = ScriptCordova;
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function ScriptCordova() {
  var _process$env$NODE_ENV, _process$env, _process$env$CORDOVA_, _process$env2;
  var NODE_ENV = (_process$env$NODE_ENV = (_process$env = process.env) === null || _process$env === void 0 ? void 0 : _process$env.NODE_ENV) !== null && _process$env$NODE_ENV !== void 0 ? _process$env$NODE_ENV : null;
  var CORDOVA_NEXT_PLATFORM = (_process$env$CORDOVA_ = (_process$env2 = process.env) === null || _process$env2 === void 0 ? void 0 : _process$env2.CORDOVA_NEXT_PLATFORM) !== null && _process$env$CORDOVA_ !== void 0 ? _process$env$CORDOVA_ : null;
  if (CORDOVA_NEXT_PLATFORM === 'web') return;
  if (NODE_ENV === 'production') {
    return /*#__PURE__*/_react["default"].createElement("script", {
      src: "/cordova.js"
    });
  } else if (NODE_ENV === 'development') {
    return /*#__PURE__*/_react["default"].createElement("script", {
      src: "/_next/static/chunks/cordova.js"
    });
  }
}
function Init() {}
var _default = exports["default"] = Init;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfcmVhY3QiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsImUiLCJfX2VzTW9kdWxlIiwiU2NyaXB0Q29yZG92YSIsIl9wcm9jZXNzJGVudiROT0RFX0VOViIsIl9wcm9jZXNzJGVudiIsIl9wcm9jZXNzJGVudiRDT1JET1ZBXyIsIl9wcm9jZXNzJGVudjIiLCJOT0RFX0VOViIsInByb2Nlc3MiLCJlbnYiLCJDT1JET1ZBX05FWFRfUExBVEZPUk0iLCJjcmVhdGVFbGVtZW50Iiwic3JjIiwiSW5pdCIsIl9kZWZhdWx0IiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbIi4uL2xpYi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5cclxuZnVuY3Rpb24gU2NyaXB0Q29yZG92YSgpIHtcclxuXHJcbiAgICBjb25zdCBOT0RFX0VOViA9IHByb2Nlc3MuZW52Py5OT0RFX0VOViA/PyBudWxsO1xyXG4gICAgY29uc3QgQ09SRE9WQV9ORVhUX1BMQVRGT1JNID0gcHJvY2Vzcy5lbnY/LkNPUkRPVkFfTkVYVF9QTEFURk9STSA/PyBudWxsO1xyXG5cclxuICAgIGlmIChDT1JET1ZBX05FWFRfUExBVEZPUk0gPT09ICd3ZWInKSByZXR1cm47XHJcblxyXG4gICAgaWYgKE5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgPHNjcmlwdCBzcmM9XCIvY29yZG92YS5qc1wiPjwvc2NyaXB0PlxyXG4gICAgICAgICk7XHJcblxyXG4gICAgfSBlbHNlIGlmIChOT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xyXG5cclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICA8c2NyaXB0IHNyYz1cIi9fbmV4dC9zdGF0aWMvY2h1bmtzL2NvcmRvdmEuanNcIj48L3NjcmlwdD5cclxuICAgICAgICApO1xyXG5cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIEluaXQoKSB7XHJcbiAgICBcclxuXHJcbn1cclxuXHJcbmV4cG9ydCB7IFNjcmlwdENvcmRvdmEgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEluaXQ7Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsSUFBQUEsTUFBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBQTBCLFNBQUFELHVCQUFBRSxDQUFBLFdBQUFBLENBQUEsSUFBQUEsQ0FBQSxDQUFBQyxVQUFBLEdBQUFELENBQUEsZ0JBQUFBLENBQUE7QUFFMUIsU0FBU0UsYUFBYUEsQ0FBQSxFQUFHO0VBQUEsSUFBQUMscUJBQUEsRUFBQUMsWUFBQSxFQUFBQyxxQkFBQSxFQUFBQyxhQUFBO0VBRXJCLElBQU1DLFFBQVEsSUFBQUoscUJBQUEsSUFBQUMsWUFBQSxHQUFHSSxPQUFPLENBQUNDLEdBQUcsY0FBQUwsWUFBQSx1QkFBWEEsWUFBQSxDQUFhRyxRQUFRLGNBQUFKLHFCQUFBLGNBQUFBLHFCQUFBLEdBQUksSUFBSTtFQUM5QyxJQUFNTyxxQkFBcUIsSUFBQUwscUJBQUEsSUFBQUMsYUFBQSxHQUFHRSxPQUFPLENBQUNDLEdBQUcsY0FBQUgsYUFBQSx1QkFBWEEsYUFBQSxDQUFhSSxxQkFBcUIsY0FBQUwscUJBQUEsY0FBQUEscUJBQUEsR0FBSSxJQUFJO0VBRXhFLElBQUlLLHFCQUFxQixLQUFLLEtBQUssRUFBRTtFQUVyQyxJQUFJSCxRQUFRLEtBQUssWUFBWSxFQUFFO0lBRTNCLG9CQUNJVixNQUFBLFlBQUFjLGFBQUE7TUFBUUMsR0FBRyxFQUFDO0lBQWEsQ0FBUyxDQUFDO0VBRzNDLENBQUMsTUFBTSxJQUFJTCxRQUFRLEtBQUssYUFBYSxFQUFFO0lBRW5DLG9CQUNJVixNQUFBLFlBQUFjLGFBQUE7TUFBUUMsR0FBRyxFQUFDO0lBQWlDLENBQVMsQ0FBQztFQUcvRDtBQUVKO0FBRUEsU0FBU0MsSUFBSUEsQ0FBQSxFQUFHLENBR2hCO0FBQUMsSUFBQUMsUUFBQSxHQUFBQyxPQUFBLGNBSWNGLElBQUkiLCJpZ25vcmVMaXN0IjpbXX0=