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
const dockerode_1 = __importDefault(require("dockerode"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const docker = new dockerode_1.default();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let PORT_TO_CONTAINER = {};
let CONTAINER_TO_PORT = {};
app.get("/", (req, res) => {
    res.json({ health: "The health of the route is Perfect" });
});
app.post("/createcontainer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { image, name } = req.body;
    const AVAILABLE_PORT = (() => {
        for (let i = 8000; i <= 8999; i++) {
            const portString = i.toString();
            if (!PORT_TO_CONTAINER[portString]) {
                return portString;
            }
            continue;
        }
    })();
    if (!AVAILABLE_PORT) {
        return res.json({ error: "No Available PORT Present" });
    }
    try {
        //If the Image is not present in the Local , Pulling it from the DockerHub
        yield docker.pull(image);
        const container = yield docker.createContainer({
            Image: image,
            name: name,
            Cmd: ["npm", "start", "sh"],
            Tty: true,
            AttachStdout: true,
            HostConfig: {
                PortBindings: { "4000/tcp": [{ HostPort: AVAILABLE_PORT }] },
            },
        });
        PORT_TO_CONTAINER[AVAILABLE_PORT] = container.id;
        CONTAINER_TO_PORT[container.id] = AVAILABLE_PORT;
        // Start the container immediately after creation
        yield container.start();
        return res.json({
            container: container.id,
            CONTAINER_PORT: AVAILABLE_PORT,
        });
    }
    catch (error) {
        return res.json({ error });
    }
}));
app.get("/containers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allContainers = yield docker.listContainers({ all: true });
    res.json({
        allContainers: allContainers.map((e) => {
            return {
                id: e.Id,
                name: e.Names[0],
                image: e.Image,
            };
        }),
    });
}));
app.post("/killcontainer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { containerId } = req.body;
    if (!containerId) {
        return res.status(400).json({ error: "Container ID is required" });
    }
    try {
        const container = docker.getContainer(containerId);
        yield container.stop();
        yield container.remove();
        return res.json({
            message: `Container ${containerId} stopped and removed successfully`,
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
}));
app.post("/updateactivity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { containerId } = req.body;
    if (!containerId) {
        return res.status(400).json({ error: "Container ID is required" });
    }
    try {
        docker.getContainer(containerId);
        return res.json({
            message: `Container ${containerId} is running`,
        });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
}));
app.listen(5050, () => {
    console.log(`Server is running on port Server is running on http://localhost:5050`);
});
