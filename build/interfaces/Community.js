"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommunity = void 0;
const validateCommunity = (community) => {
    if (!community.name) {
        return ["name is required"];
    }
    if (community.name.length < 3) {
        return ["name must be at least 3 characters"];
    }
    return [];
};
exports.validateCommunity = validateCommunity;
