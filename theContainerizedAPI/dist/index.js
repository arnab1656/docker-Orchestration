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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./db/config"));
const schema_1 = __importDefault(require("./db/schema"));
const app = (0, express_1.default)();
// Middleware to parse JSON
app.use(express_1.default.json());
app.get("/", (req, res) => {
    console.log("from get home route items");
    res.send("Hello World! from homie");
});
app.get("/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, config_1.default)();
    try {
        const items = yield schema_1.default.find();
        console.log("from get items");
        res.json({ items });
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
app.post("/items", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, config_1.default)();
        const { name, description } = req.body;
        const newItem = new schema_1.default({ name, description });
        yield newItem.save();
        console.log("from post items");
        res.status(201).json({ newItem });
    }
    catch (error) {
        res.status(400).json({ error });
    }
}));
app.listen(4000, () => {
    console.log("The API is on in 4000 PORT");
});
