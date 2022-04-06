const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.json());

morgan.token("body", (request, response) => {
  return request.method === "POST" ? JSON.stringify(request.body) : "";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let phonebookData = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const getRandomId = () => {
  return Math.round(Math.random() * 1000000);
};

app.get("/info", (request, response) => {
  response.send(`
  <div>Phonebook has info for ${phonebookData.length} people</div>
  <br/>  
  <div>${new Date()}</div>
  `);
});

app.get("/api/persons", (request, response) => {
  response.json(phonebookData);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = phonebookData.find((item) => item.id === id);
  if (!person) {
    return response.status(404).end();
  }
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  phonebookData = phonebookData.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const id = getRandomId();
  const { name, number } = request.body;
  const isNameError = name === undefined;
  const isNumberError = number === undefined;
  const connector = isNameError && isNumberError ? " and " : "";
  const nameError = isNameError ? "name" : "";
  const numberError = isNumberError ? "number" : "";

  if (isNameError || isNumberError) {
    return response.status(400).json({
      error: `need to provide ${nameError}${connector}${numberError} for a person`,
    });
  }

  if (phonebookData.find((item) => item.name === name)) {
    return response.status(400).json({
      error: `a person ${name} already exists`,
    });
  }

  const newPerson = {
    id,
    name,
    number,
  };
  phonebookData = [...phonebookData, newPerson];

  response.json(newPerson);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
