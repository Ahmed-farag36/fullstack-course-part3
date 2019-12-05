const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		minlength: 3,
		unique: true,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	password: String,
	blogs: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Blog"
		}
	]
});

// userSchema.pre("save", () => {
// 	const hashedPassword = bcrypt.hashSync(password, 10);
// 	password = hashedPassword;
// 	return password;
// });

userSchema.set("toJSON", {
	transform: (doc, returnedDoc) => {
		returnedDoc.id = doc._id;
		delete returnedDoc._id;
		delete returnedDoc.__v;
		delete returnedDoc.password;
	}
});

module.exports = mongoose.model("User", userSchema);
