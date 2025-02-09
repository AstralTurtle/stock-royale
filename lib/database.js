"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
var mongodb_1 = require("mongodb");
var uri = "mongodb+srv://rexmagnusdavid:FZbLrmbGYv5lUhnp@cluster0.rd3ja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
var options = {};
var client;
if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    var globalWithMongo = global;
    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new mongodb_1.MongoClient(uri, options);
    }
    exports.client = client = globalWithMongo._mongoClient;
}
else {
    // In production mode, it's best to not use a global variable.
    exports.client = client = new mongodb_1.MongoClient(uri, options);
}
