const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

userRouter.get("/", async (req, res, next) => {
	try {
		const users = await User.find();
		res.json(users);
	} catch (error) {
		next(error);
	}
});

userRouter.post("/", async (req, res, next) => {
	try {
		const { username, name, password } = req.body;
		if (password.length < 3) {
			throw new Error("Password must be 3 characters at least");
		}
		const hashedPassword = bcrypt.hashSync(password, 10);
		const createdUser = await new User({
			username,
			name,
			password: hashedPassword
		}).save();
		const JWTToken = jwt.sign(
			{ id: createdUser.id, username },
			process.env.JWT_SECRET
		);
		res.status(201).json(JWTToken);
	} catch (error) {
		if (error.message === "Password must be 3 characters at least") {
			res
				.status(400)
				.json({ message: "Password must be 3 characters at least" });
		} else {
			res
				.status(400)
				.json({ message: "Username must be 3 characters at least" });
		}
	}
});

module.exports = userRouter;
