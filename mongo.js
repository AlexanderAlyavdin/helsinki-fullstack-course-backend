const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide arguments like this to add a person to the phonebook: node mongo.js <password> <name> <number>"
  );
  console.log(
    "To retrieve all persons use it like this: node mongo.js <password>"
  );
  process.exit(1);
}

const [, , password, name, number] = process.argv;

const url = `mongodb+srv://mtgbuyadmin:${password}@mtgbuy.sc7fu.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (name !== undefined && number !== undefined) {
  const personToAdd = new Person({
    name,
    number,
  });

  personToAdd.save().then((result) => {
    console.log(`${name} saved!`);
    mongoose.connection.close();
  });
}

if (name === undefined && number === undefined) {
  Person.find({}).then((result) => {
    result.forEach((note) => {
      console.log(note);
    });
    mongoose.connection.close();
  });
}
