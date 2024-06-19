import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

// Middleware to parse JSON

app.use(cors());
app.use(express.json());

const items = [
  { id: 1, name: "Toy Car", description: "A small toy car that goes fast!" },
  { id: 2, name: "Teddy Bear", description: "A fluffy teddy bear to cuddle." },
  {
    id: 3,
    name: "Lego Set",
    description: "A set of Lego blocks to build anything you imagine.",
  },
];

app.get("/", (req: Request, res: Response) => {
  console.log("from get home route items");
  res.send("Welcome to the playful API! Have fun exploring the items.");
});

app.get("/items", (req: Request, res: Response) => {
  console.log("from get items");
  res.json({ message: "Here are some fun items!", items });
});

app.post("/items", (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const newItem = { id: items.length + 1, name, description };
    items.push(newItem);
    console.log("from post items");
    res.status(201).json({ message: "New item added!", newItem });
  } catch (error) {
    res.status(400).json({ error: "There was an error adding the item." });
  }
});

app.get("/random-item", (req: Request, res: Response) => {
  const randomIndex = Math.floor(Math.random() * items.length);
  const randomItem = items[randomIndex];
  res.json({ message: "Here is a random item for you!", randomItem });
});

app.get("/items/:id", (req: Request, res: Response) => {
  const itemId = parseInt(req.params.id, 10);
  const item = items.find((item) => item.id === itemId);
  if (item) {
    res.json({ message: "Here is the item you requested!", item });
  } else {
    res.status(404).json({ error: "Item not found." });
  }
});

app.listen(4000, () => {
  console.log("The API is on in 4000 PORT");
});
