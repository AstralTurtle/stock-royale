"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockType = exports.ResponseType = exports.RequestType = void 0;
var RequestType;
(function (RequestType) {
    RequestType[RequestType["Buy"] = 0] = "Buy";
    RequestType[RequestType["Sell"] = 1] = "Sell";
    RequestType[RequestType["Win"] = 2] = "Win";
    RequestType[RequestType["Login"] = 3] = "Login";
})(RequestType || (exports.RequestType = RequestType = {}));
var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["Success"] = 0] = "Success";
    ResponseType[ResponseType["Failure"] = 1] = "Failure";
})(ResponseType || (exports.ResponseType = ResponseType = {}));
var StockType;
(function (StockType) {
    StockType[StockType["Growth"] = 0] = "Growth";
    StockType[StockType["Stable"] = 1] = "Stable";
    StockType[StockType["Volatile"] = 2] = "Volatile";
})(StockType || (exports.StockType = StockType = {}));
