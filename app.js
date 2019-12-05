require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const blogRouter = require("./controllers/blogs");
const userRouter = require("./controllers/users");

const extractToken = require("./middlewares/extractToken");

if (process.env.NODE_ENV !== "test") {
	mongoose
		.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		.then(() => console.log("Connected to db"))
		.catch(err => console.error(err));
}

app.use(cors());
app.use(bodyParser.json());
app.use(extractToken);

app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);

module.exports = app;
