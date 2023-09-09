"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = exports.connectToDatabase = void 0;
const mongodb_1 = require("mongodb");
const mongoURI = 'mongodb://0.0.0.0:27017/community-backend';
const client = new mongodb_1.MongoClient(mongoURI);
let db = null;
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            db = client.db();
            console.log('Connected to MongoDB');
        }
        catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    });
}
exports.connectToDatabase = connectToDatabase;
function getDatabase() {
    return db;
}
exports.getDatabase = getDatabase;
