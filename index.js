require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

morgan.token("body", (request, response) => {
  return request.method === "POST" ? JSON.stringify(request.body) : "";
});

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/info", (request, response) => {
  Person.find({})
    .then((persons) => {
      response.send(`
        <div>Phonebook has info for ${persons.length} people</div>
        <br/>  
        <div>${new Date()}</div>
      `);
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      return person ? response.json(person) : response.status(404).end();
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response) => {
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

  const person = new Person({
    name,
    number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const { name, number } = body;

  const person = {
    name,
    number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
