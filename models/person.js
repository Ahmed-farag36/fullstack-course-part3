const mongoose = require("mongoose");

mongoose.set(`useFindAndModify`, false);
mongoose.set(`useCreateIndex`, true);

const personSchema = new mongoose.Schema({
	name: { type: String, unique: true, minlength: 3 },
	number: { type: String, minlength: 8 }
});

personSchema.set("toJSON", {
	transform: (doc, returnedDoc) => {
		returnedDoc.id = returnedDoc._id.toString();
		delete returnedDoc._id;
		delete returnedDoc.__v;
	}
});

module.exports = mongoose.model("Person", personSchema);
