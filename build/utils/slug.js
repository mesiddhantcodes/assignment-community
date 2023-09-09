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
exports.generateUniqueSlug = void 0;
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}
function generateUniqueSlug(db, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const tempslug = generateSlug(name);
        let slug = tempslug;
        let count = 1;
        const communites = db.collection('communities');
        while (true) {
            const existingCommunity = yield communites.findOne({ tempslug });
            if (!existingCommunity) {
                return tempslug;
            }
            slug = `${tempslug}-${count}`;
            count++;
        }
    });
}
exports.generateUniqueSlug = generateUniqueSlug;
