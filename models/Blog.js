const mongoose = require("mongoose");

mongoose.set("useFindAndModify", false);

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	author: String,
	url: {
		type: String,
		required: true
	},
	likes: {
		type: Number,
		default: 0
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

blogSchema.set("toJSON", {
	transform: (doc, returnedDoc) => {
		returnedDoc.id = doc._id.toString();
		delete returnedDoc._id;
		delete returnedDoc.__v;
	}
});

module.exports = mongoose.model("Blog", blogSchema);
