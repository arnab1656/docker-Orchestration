import Docker from "dockerode";
import express, { Request, Response } from "express";
import cors from "cors";

const docker = new Docker();
const app = express();

app.use(cors());
app.use(express.json());

let PORT_TO_CONTAINER: { [key: string]: string } = {};
let CONTAINER_TO_PORT: { [key: string]: string } = {};

app.get("/", (req: Request, res: Response) => {
  res.json({ health: "The health of the route is Perfect" });
});

app.post("/createcontainer", async (req: Request, res: Response) => {
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
    await docker.pull(image);

    const container = await docker.createContainer({
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
    await container.start();

    return res.json({
      container: container.id,
      CONTAINER_PORT: AVAILABLE_PORT,
    });
  } catch (error) {
    return res.json({ error });
  }
});

app.get("/containers", async (req: Request, res: Response) => {
  const allContainers = await docker.listContainers({ all: true });

  res.json({
    allContainers: allContainers.map((e) => {
      return {
        id: e.Id,
        name: e.Names[0],
        image: e.Image,
      };
    }),
  });
});

app.post("/killcontainer", async (req: Request, res: Response) => {
  const { containerId } = req.body;

  if (!containerId) {
    return res.status(400).json({ error: "Container ID is required" });
  }

  try {
    const container = docker.getContainer(containerId);

    await container.stop();

    await container.remove();

    return res.json({
      message: `Container ${containerId} stopped and removed successfully`,
    });
  } catch (error: any) {
    return res.status(500).json({ error });
  }
});

app.post("/updateactivity", async (req: Request, res: Response) => {
  const { containerId } = req.body;

  if (!containerId) {
    return res.status(400).json({ error: "Container ID is required" });
  }

  try {
    docker.getContainer(containerId);

    return res.json({
      message: `Container ${containerId} is running`,
    });
  } catch (error: any) {
    return res.status(500).json({ error });
  }
});
app.listen(5050, () => {
  console.log(
    `Server is running on port Server is running on http://localhost:5050`
  );
});
