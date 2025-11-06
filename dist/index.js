"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScriptCordova = ScriptCordova;
exports.useElectronOverlay = useElectronOverlay;
var _react = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
function useElectronOverlay(ready) {
  (0, _react.useEffect)(function () {
    var _window$electronBridg, _window$electronBridg2;
    if (typeof window === 'undefined') return;
    if (!ready) return;
    (_window$electronBridg = window.electronBridge) === null || _window$electronBridg === void 0 || (_window$electronBridg2 = _window$electronBridg.notifyReactReady) === null || _window$electronBridg2 === void 0 || _window$electronBridg2.call(_window$electronBridg);
  }, [ready]);
}
//# sourceMappingURL=index.js.map