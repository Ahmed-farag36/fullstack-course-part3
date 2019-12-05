const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
exports.api = api;
const mongoose = require("mongoose");
const {
	initialBlogs,
	getAllBlogs,
	getAllUsers,
	postBlog,
	deleteBlog,
	updateBlog,
	addUser
} = require("./test_helper");
const Blog = require("../models/Blog");
const User = require("../models/User");

let tokenHeader;

beforeAll(async () => {
	await mongoose
		.connect(process.env.MONGO_TEST_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		.then(() => console.log("Connected to test db"))
		.catch(err => console.error(err));

	await User.deleteMany();
	console.log("User collection cleared");

	const { body } = await addUser({
		username: "Dan Abramov",
		name: "Dan",
		password: "123456789",
		blogs: []
	});
	tokenHeader = {
		Authorization: `Bearer ${body}`
	};
	console.log("User signed up", tokenHeader);
});

describe("GET /api/blogs", () => {
	beforeAll(async () => {
		await Blog.deleteMany();
		console.log("Blog collection cleared");

		const blogsPromisesArray = initialBlogs.map(
			async blog => await new Blog(blog).save()
		);
		await Promise.all(blogsPromisesArray);
		console.log("Blog collection populated");
	});

	test("should return list of blogs", async () => {
		const response = await getAllBlogs();
		expect(response.status).toBe(200);
	});

	test("should return 3 blogs", async () => {
		const response = await getAllBlogs();
		expect(response.body.length).toBe(3);
	});

	test("should have id property", async () => {
		const blogs = await getAllBlogs();
		expect(blogs.body[0].id).toBeDefined();
	});

	test("should populate user field", async () => {
		const newBlog = {
			title: "TDD harms architecture",
			author: "Robert C. Martin",
			url:
				"http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
			likes: 0
		};

		const createdBlog = await postBlog(newBlog, tokenHeader);
		const blogsAfter = await getAllBlogs();
		const { body } = await getAllUsers();
		blogOwner = body[0];
		expect(createdBlog.body.user).toBeDefined();
		expect(blogsAfter.body[3].user).toEqual({
			...blogOwner
		});
	});
});

describe("POST /api/blogs", () => {
	let newBlog;
	beforeEach(async () => {
		await Blog.deleteMany();
		console.log("DB cleared");

		newBlog = {
			title: "TDD harms architecture",
			author: "Robert C. Martin",
			url:
				"http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
			likes: 0
		};
	});

	test("should post one blog", async () => {
		const savedBlog = await postBlog(newBlog, tokenHeader);
		expect(savedBlog.status).toBe(201);
		expect(savedBlog.body.title).toContain("TDD harms architecture");

		const blogs = await getAllBlogs();
		expect(blogs.body.length).toBe(1);
	});

	test("likes field default to zero if undefined", async () => {
		delete newBlog.likes;
		const savedBlog = await postBlog(newBlog, tokenHeader);
		expect(savedBlog.body.likes).toBe(0);
	});

	test("should return 400 if title is missing", async () => {
		delete newBlog.title;
		const response = await postBlog(newBlog, tokenHeader);
		expect(response.status).toBe(400);

		const blogs = await getAllBlogs();
		expect(blogs.body.length).toBe(0);
	});

	test("should return 400 if url is missing", async () => {
		delete newBlog.url;
		const response = await postBlog(newBlog, tokenHeader);
		expect(response.status).toBe(400);

		const blogs = await getAllBlogs();
		expect(blogs.body.length).toBe(0);
	});

	test("should return 403 if no auth header sent", async () => {
		const response = await postBlog(newBlog, {});
		expect(response.status).toBe(403);

		const blogs = await getAllBlogs();
		expect(blogs.body.length).toBe(0);
	});

	test("should return 403 if false auth token provided", async () => {
		const falseOwnerToken = {
			Authorization: tokenHeader.Authorization.replace("I", "x")
		};
		const response = await postBlog(newBlog, falseOwnerToken);
		expect(response.status).toBe(403);

		const blogs = await getAllBlogs();
		expect(blogs.body.length).toBe(0);
	});
});

describe("DELETE /api/blogs/:id", () => {
	const newBlog = {
		title: "TDD harms architecture",
		author: "Robert C. Martin",
		url:
			"http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
		likes: 0
	};
	let createdBlog;
	beforeEach(async () => {
		await Blog.deleteMany();
		console.log("DB cleared");

		const { body } = await postBlog(newBlog, tokenHeader);
		createdBlog = body;
		console.log("DB populated");
	});

	test("should delete blog successfully", async () => {
		const response = await deleteBlog(createdBlog.id, tokenHeader);
		expect(response.status).toBe(204);

		const blogsAfter = await getAllBlogs();
		expect(blogsAfter.body.length).toBe(0);
	});

	test("should return 403 if no auth header provided", async () => {
		const response = await deleteBlog(createdBlog.id, {});
		expect(response.status).toBe(403);

		const blogs = await getAllBlogs();
		expect(blogs.body.length).toBe(1);
	});

	test("should return 403 if not the owner", async () => {
		const falseOwnerToken = {
			Authorization:
				"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZTdmMGQxYjcyYTA1MTdjOGQ3YTE4ZSIsInVzZXJuYW1lIjoiSGFtbyIsImlhdCI6MTU3NTQ4MTU1M30.SKscNNyIxHU8nl9vT_SvMJtpMFH9K_7Iil-Wj6JOQ2s"
		};
		const response = await deleteBlog(createdBlog.id, falseOwnerToken);
		expect(response.status).toBe(403);

		const blogs = await getAllBlogs();
		expect(blogs.body.length).toBe(1);
	});

	test("should return 403 if not valid token", async () => {
		const notValidToken = {
			Authorization: tokenHeader.Authorization.replace("I", "i")
		};
		const response = await deleteBlog(createdBlog.id, notValidToken);
		expect(response.status).toBe(403);

		const blogs = await getAllBlogs();
		expect(blogs.body.length).toBe(1);
	});
});

describe("PUT /api/blogs/:id", () => {
	const newBlog = {
		title: "TDD harms architecture",
		author: "Robert C. Martin",
		url:
			"http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
		likes: 0
	};
	let createdBlog;
	beforeAll(async () => {
		await Blog.deleteMany();
		console.log("DB cleared");

		createdBlog = await postBlog(newBlog, tokenHeader);
		console.log("DB populated");
	});

	test("should increment likes of first blog by 1", async () => {
		const updatedBlog = await updateBlog(createdBlog.body.id, tokenHeader);
		expect(updatedBlog.status).toBe(200);

		expect(updatedBlog.body.likes).toBe((createdBlog.body.likes += 1));
	});

	test("should return 403 if no auth header provided", async () => {
		const response = await updateBlog(createdBlog.body.id, {});
		expect(response.status).toBe(403);

		const blogsAfter = await getAllBlogs();
		expect(blogsAfter.body[0].likes).toBe(createdBlog.body.likes);
	});

	test("should return 403 if not the owner", async () => {
		tokenHeader.Authorization =
			"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZTdmMGQxYjcyYTA1MTdjOGQ3YTE4ZSIsInVzZXJuYW1lIjoiSGFtbyIsImlhdCI6MTU3NTQ4MTU1M30.SKscNNyIxHU8nl9vT_SvMJtpMFH9K_7Iil-Wj6JOQ2s";

		const response = await updateBlog(createdBlog.body.id, tokenHeader);
		expect(response.status).toBe(403);

		const blogsAfter = await getAllBlogs();
		expect(blogsAfter.body[0].likes).toBe(createdBlog.body.likes);
	});

	test("should return 403 if not valid token", async () => {
		tokenHeader.Authorization = tokenHeader.Authorization.replace("I", "i");

		const response = await updateBlog(createdBlog.body.id, tokenHeader);
		expect(response.status).toBe(403);

		const blogsAfter = await getAllBlogs();
		expect(blogsAfter.body[0].likes).toBe(createdBlog.body.likes);
	});
});

afterAll(() => {
	mongoose.connection.close();
});
