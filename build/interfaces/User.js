"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = void 0;
const validateUser = (user) => {
    if (!user.name) {
        return ["name is required"];
    }
    if (!user.email) {
        return ["email is required"];
    }
    if (!user.password) {
        return ["password is required"];
    }
    if (user.password.length < 7) {
        return ["password must be at least 6 characters"];
    }
    if (user.name.length < 3) {
        return ["name must be at least 3 characters"];
    }
    return [];
};
exports.validateUser = validateUser;
