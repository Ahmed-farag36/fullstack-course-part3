require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path");
const mongoose = require("mongoose");
const Person = require("./models/person");
const app = express();

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0-h0r7q.mongodb.net/phonebook?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	)
	.then(() => console.log("Connected to DB..."))
	.catch(err => console.error(err));

app.use(bodyParser.json());
morgan.token("postBody", (req, res) => JSON.stringify(req.body));
app.use(
	morgan(
		":method :url :status :res[content-length] - :response-time ms :postBody"
	)
);
app.use(express.static(path.join(__dirname, "build")));

app.get("/api/persons", (req, res) => {
	Person.find()
		.then(phonebook => {
			res.json(phonebook);
		})
		.catch(err => {
			console.error(err);
		});
});

app.get("/api/info", (req, res) => {
	Person.find().then(phonebook => {
		res.send(
			`<h2>Phonebook has info for ${
				phonebook.length
			} people</h2><p>${new Date()}</p>`
		);
	});
});

app.get("/api/persons/:id", (req, res, next) => {
	const id = req.params.id;
	Person.findById(id)
		.then(person => {
			if (!person) {
				throw new Error("Person not found");
			}
			return res.json(person);
		})
		.catch(err => {
			next(err);
		});
});

app.delete("/api/persons/:id", (req, res, next) => {
	const id = req.params.id;
	Person.findByIdAndDelete(id)
		.then(() => {
			res.status(204).end();
		})
		.catch(err => {
			next(err);
		});
});

app.post("/api/persons", (req, res, next) => {
	const { name, number } = req.body;
	if (!name || !number) {
		throw new Error(`${name ? "Number" : "Name"} is required`);
	}
	const newEntry = new Person({
		name,
		number
	});
	newEntry
		.save()
		.then(person => {
			res.status(201).json(person);
		})
		.catch(err => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
	const { id } = req.params;
	const { number } = req.body;
	Person.findByIdAndUpdate(id, { number }, { new: true })
		.then(person => {
			if (!person) {
				throw new Error("Person not found");
			}
			res.json(person);
		})
		.catch(err => {
			next(err);
		});
});

// error handler
app.use((error, req, res, next) => {
	console.error(error.errors);
	if (error.name === "CastError" && error.kind === "ObjectId") {
		res.status(400).json({ message: "Malformed ID" });
	} else if (error.message === "Person not found") {
		res.status(404).json({ message: "Person not found" });
	} else if (
		error.message === "Name is required" ||
		error.message === "Number is required"
	) {
		res.status(400).json({ message: error.message });
	} else if (error.message.includes("E11000 duplicate key error collection")) {
		res.status(400).json({ message: "Name is already in use" });
	} else if (error.message === "Person not found") {
		res.status(404).json({ message: "Person not found" });
	} else if (
		error.errors.name &&
		error.errors.name.name === "ValidatorError" &&
		error.errors.name.kind === "minlength"
	) {
		res.status(400).json({ message: "Name should be 3 characters at least" });
	} else if (
		error.errors.number &&
		error.errors.number.name === "ValidatorError" &&
		error.errors.number.kind === "minlength"
	) {
		res.status(400).json({ message: "Number should be 3 characters at least" });
	} else {
		res.end();
	}
});

app.listen(process.env.PORT, () => console.log("Server has started..."));
