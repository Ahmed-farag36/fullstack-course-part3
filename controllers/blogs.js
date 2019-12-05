const blogRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/Blog");
const User = require("../models/User");

blogRouter.get("/", async (req, res, next) => {
	try {
		const blogs = await Blog.find({}).populate("user");
		res.json(blogs);
	} catch (error) {
		next(error);
	}
});

blogRouter.post("/", async (req, res) => {
	try {
		if (!req.token) throw new Error("Unauthorized, no token provided");
		const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
		const blog = await new Blog({ ...req.body, user: decodedToken.id }).save();
		await User.findByIdAndUpdate(decodedToken.id, {
			$push: { blogs: blog.id }
		});
		res.status(201).json(blog);
	} catch (error) {
		console.log(error.message);
		if (error.message === "Unauthorized, no token provided") {
			res.status(403).end();
		} else if (
			error.name === "JsonWebTokenError" &&
			error.message === "invalid algorithm"
		) {
			res.status(403).end();
		} else {
			res.status(400).end();
		}
	}
});

blogRouter.delete("/:id", async (req, res, next) => {
	try {
		if (!req.token) throw new Error("Unauthorized, no token provided");
		const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);

		const blog = await Blog.findById(req.params.id);
		if (blog.user.toString() !== decodedToken.id) {
			throw new Error("Unauthorized, not the owner");
		}

		await Blog.findByIdAndDelete(req.params.id);
		res.status(204).end();
	} catch (error) {
		console.log(error.message);
		if (
			error.name === "JsonWebTokenError" &&
			error.message === "invalid algorithm"
		) {
			res.status(403).end();
		} else if (error.message === "Unauthorized, no token provided") {
			res.status(403).end();
		} else if (error.message === "Unauthorized, not the owner") {
			res.status(403).end();
		} else {
			res.status(400).end();
		}
	}
});

blogRouter.put("/:id", async (req, res, next) => {
	try {
		if (!req.token) throw new Error("Unauthorized, no token provided");
		const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);

		const blog = await Blog.findById(req.params.id);
		if (blog.user.toString() !== decodedToken.id) {
			throw new Error("Unauthorized, not the owner");
		}

		const updatedBlog = await Blog.findByIdAndUpdate(
			req.params.id,
			{ $inc: { likes: 1 } },
			{ new: true }
		);
		res.json(updatedBlog);
	} catch (error) {
		console.log(error.message);
		if (
			error.message === "Unauthorized, no token provided" ||
			error.message === "Unauthorized, not the owner"
		) {
			res.status(403).end();
		}
		if (
			error.name === "JsonWebTokenError" &&
			error.message === "invalid algorithm"
		) {
			res.status(403).end();
		} else {
			res.status(400).end();
		}
	}
});

module.exports = blogRouter;
