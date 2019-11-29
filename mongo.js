const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
	name: String,
	phoneNumber: String
});

const Person = mongoose.model("Person", personSchema);

const [command, filename, password, name, phoneNumber] = process.argv;

if (process.argv.length < 3) {
	console.log(`Please enter your password`);
	process.exit(1);
}

mongoose
	.connect(
		`mongodb+srv://ahmedfarag:${password}@cluster0-h0r7q.mongodb.net/phonebook?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => console.log("Connected to DB..."))
	.catch(err => console.error(err));

if (process.argv.length === 3) {
	Person.find()
		.then(people => {
			console.log(
				`\nPhonebook:\n`,
				people.map(person => `${person.name} ${person.phoneNumber}`).join("\n")
			);
			mongoose.connection.close();
		})
		.catch(err => {
			console.error(err);
			mongoose.connection.close();
		});
} else {
	const newPerson = new Person({
		name,
		phoneNumber
	});
	newPerson
		.save()
		.then(() => {
			console.log(`added ${name} number ${phoneNumber} to phonebook`);
			mongoose.connection.close();
		})
		.catch(err => {
			console.error(err);
			mongoose.connection.close();
		});
}
