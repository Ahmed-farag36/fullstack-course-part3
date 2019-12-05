const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const initialBlogs = [
	{
		title: "React patterns",
		author: "Michael Chan",
		url: "https://reactpatterns.com/",
		likes: 7
	},
	{
		title: "Go To Statement Considered Harmful",
		author: "Edsger W. Dijkstra",
		url:
			"http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
		likes: 5
	},
	{
		title: "Canonical string reduction",
		author: "Edsger W. Dijkstra",
		url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
		likes: 12
	}
];

const initialUsers = [
	{
		username: "Dan Abramov",
		name: "Dan",
		password: "123456789",
		blogs: []
	},
	{
		username: "Ada Lovelace",
		name: "Ada",
		password: "123456789",
		blogs: []
	}
];

const getAllBlogs = async () => await api.get("/api/blogs");
const getAllUsers = async () => await api.get("/api/users");
const postBlog = async (newBlog, tokenHeader) => {
	return await api
		.post("/api/blogs")
		.send(newBlog)
		.set(tokenHeader);
};
const deleteBlog = async (id, tokenHeader) => {
	return await api.delete(`/api/blogs/${id}`).set(tokenHeader);
};
const updateBlog = async (id, tokenHeader) => {
	return await api.put(`/api/blogs/${id}`).set(tokenHeader);
};

const addUser = async newUser => {
	return await api.post("/api/users").send(newUser);
};

module.exports = {
	initialBlogs,
	initialUsers,
	getAllBlogs,
	getAllUsers,
	postBlog,
	deleteBlog,
	updateBlog,
	addUser,
	api
};
