import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Item {
  id: number;
  name: string;
  description: string;
}

function generateRandomName() {
  const adjectives = ["redo", "blue", "green", "yellow", "orange"];
  const nouns = ["cat", "dog", "bird", "fish", "rabbit"];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  const randomNumber = Math.floor(Math.random() * 1000);

  return `${randomAdjective}-${randomNoun}-${randomNumber}`;
}

function App() {
  const [containerId, setContainerId] = useState<string | null>(null);
  const [containerPORT, setContainerPORT] = useState<string | null>(null);
  const containerIdRef = useRef<string | null>(null);
  const fetchDataCalled = useRef(false);

  const [items, setItems] = useState<any[]>([]);

  const [itemName, setItemName] = useState("Add a Item Name");
  const [itemDescription, setItemDescription] = useState("Add a description");
  const [itemID, setItemId] = useState<string | null>(null);

  const [randomItem, setRandomItem] = useState<Item | null>(null);
  const [fetchedItemById, setFetchedItemById] = useState<Item | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData is fired");
      try {
        const randomName = generateRandomName();

        const response = await axios.post(
          "http://localhost:5050/createcontainer",
          { image: "arnab98/express-api:v3.0", name: randomName }
        );

        const createdContainerId = response.data.container;
        const containerPORT = response.data.CONTAINER_PORT;

        setContainerPORT(containerPORT);

        setContainerId(createdContainerId);
        containerIdRef.current = createdContainerId;

        toast.success(`Container created with ID: ${createdContainerId}`);
      } catch (error) {
        console.error("Error creating container:", error);
        alert("Failed to create container. Please try again.");
        toast.error("Failed to create container. Please try again.");
      }
    };

    if (!fetchDataCalled.current) {
      fetchData();
      fetchDataCalled.current = true;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (containerId) {
        killContainer(containerId);
      }
    };
  }, []);

  console.log("containerPORT");
  console.log(containerPORT);

  const killContainer = async (containerId: string) => {
    try {
      await axios.post("http://localhost:5050/killcontainer", { containerId });
      alert("The Container is killed as You Reload or Exit the Page");
      toast.success(`Container ${containerId} stopped and removed.`);
    } catch (error) {
      toast.error(`Failed to stop container ${containerId}. Please try again.`);
    }
  };

  const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
    event.preventDefault();

    console.log("handleBeforeUnload containerId:", containerIdRef.current);

    alert("I am trihhehrdfed ibweigbwe");

    if (containerIdRef.current) {
      await killContainer(containerIdRef.current);
    }
  };

  const fetchItems = async () => {
    if (!containerPORT) return;

    try {
      const response = await axios.get(
        `http://localhost:${containerPORT}/items`
      );
      setItems(response.data.items);
      console.log("Items fetched from container:", response.data.items);
    } catch (error) {
      console.error("Error fetching items from container:", error);
    }
  };

  const addItem = async () => {
    if (!containerPORT) return;

    const newItem = {
      name: itemName,
      description: itemDescription,
    };
    try {
      const response = await axios.post(
        `http://localhost:${containerPORT}/items`,
        newItem
      );
      // setItems((prevItems) => [...prevItems, response.data.newItem]);
      console.log("Item added to container:", response.data.newItem);
    } catch (error) {
      console.error("Error adding item to container:", error);
    }
  };

  const fetchRandomItem = async () => {
    if (!containerPORT) return;

    try {
      const response = await axios.get(
        `http://localhost:${containerPORT}/random-item`
      );
      console.log(
        "Random item fetched from container:",
        response.data.randomItem
      );
      setRandomItem(response.data.randomItem);
    } catch (error) {
      console.error("Error fetching random item from container:", error);
    }
  };

  const fetchItemById = async (itemId: any) => {
    if (!containerPORT) return;

    try {
      const response = await axios.get(
        `http://localhost:${containerPORT}/items/${itemId}`
      );

      console.log("Item fetched by ID from container:", response.data.item);
      setFetchedItemById(response.data.item);
    } catch (error) {
      console.error(
        `Error fetching item by ID (${itemId}) from container:`,
        error
      );
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Docker Container Manager</h1>
      <div className="mb-4">
        <h2 className="text-xl mb-2">Add New Item</h2>
        <input
          type="text"
          className="border p-2 mr-2"
          placeholder="Enter item name"
          onChange={(e) => setItemName(e.target.value)}
        />
        <input
          type="text"
          className="border p-2 mr-2"
          placeholder="Enter item description"
          onChange={(e) => setItemDescription(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2" onClick={addItem}>
          Add Item
        </button>
      </div>
      <div>
        <h2 className="text-xl mb-2">Fetch Items</h2>
        <button
          className="bg-green-500 text-white p-2 mb-2"
          onClick={fetchItems}
        >
          Fetch Items
        </button>
      </div>
      <div>
        <h2 className="text-xl mb-2">Items</h2>
        <ul>
          {items.map((item, index) => (
            <li key={index} className="border p-2 mb-2">
              {item.name}: {item.description}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl mb-2">Fetch Random Item</h2>
        <button
          className="bg-green-500 text-white p-2 mb-2"
          onClick={fetchRandomItem}
        >
          Fetch Random Item
        </button>
        {randomItem && (
          <div className="border p-2 mt-2">
            <strong>Random Item:</strong> {randomItem.name} -{" "}
            {randomItem.description}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl mb-2">Fetch Item by ID</h2>
        <input
          type="text"
          className="border p-2 mr-2"
          placeholder="Enter item ID"
          onChange={(e) => setItemId(e.target.value)}
        />
        <button
          className="bg-green-500 text-white p-2 mb-2"
          onClick={() => fetchItemById(itemID)}
        >
          Fetch Item by ID
        </button>

        {fetchedItemById && (
          <div className="border p-2 mt-2">
            <strong>Fetched Item:</strong> {fetchedItemById.name} -{" "}
            {fetchedItemById.description}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
