"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = void 0;
const snowflake_1 = require("@theinternetfolks/snowflake");
function generateId() {
    return snowflake_1.Snowflake.generate().toString();
}
exports.generateId = generateId;
