"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const community_routes_1 = __importDefault(require("./routes/community.routes"));
const member_routes_1 = __importDefault(require("./routes/member.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const db_1 = require("./utils/db");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger_output.json');
const app = (0, express_1.default)();
const workerId = 1;
// Middleware
app.use(body_parser_1.default.json());
(0, db_1.connectToDatabase)();
// Routes
app.use('/v1/auth', auth_routes_1.default);
app.use('/v1/community', community_routes_1.default);
app.use('/v1/member', member_routes_1.default);
app.use('/v1/role', role_routes_1.default);
app.use('/v1/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
