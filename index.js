const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();

app.use(bodyParser.json());
morgan.token("postBody", (req, res) => JSON.stringify(req.body));
app.use(
	morgan(
		":method :url :status :res[content-length] - :response-time ms :postBody"
	)
);

let phonebook = [
	{
		id: "1",
		name: "First person",
		number: "123 - 456789"
	},
	{
		id: "2",
		name: "Second person",
		number: "123 - 456789"
	},
	{
		id: "3",
		name: "Third person",
		number: "123 - 456789"
	}
];

app.get("/api/persons", (req, res) => {
	res.json(phonebook);
});

app.get("/info", (req, res) => {
	res.send(
		`<h2>Phonebook has info for ${
			phonebook.length
		} people</h2><p>${new Date()}</p>`
	);
});

app.get("/api/persons/:id", (req, res) => {
	const id = req.params.id;
	const person = phonebook.find(person => person.id === id);
	if (person) {
		return res.json(person);
	}
	res.status(404).json({ message: "Person not found" });
});

app.delete("/api/persons/:id", (req, res) => {
	const id = req.params.id;
	phonebook = phonebook.filter(person => person.id !== id);
	res.status(204).end();
});

app.post("/api/persons", (req, res) => {
	const { name, number } = req.body;
	if (!name || !number) {
		return res
			.status(400)
			.json({ message: `${name ? "Number" : "Name"} is required` });
	} else if (phonebook.find(person => person.name === name)) {
		return res.status(400).json({ message: "Name should be unique" });
	}
	const id = Math.round(Math.random() * 1000000);
	const newEntry = {
		id: id.toString(),
		name: req.body.name,
		number: req.body.number
	};
	phonebook.push(newEntry);
	res.status(201).json(phonebook);
});

app.listen(3001, () => console.log("Server has started..."));
