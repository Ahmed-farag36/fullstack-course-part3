const supertest = require("supertest");
const app = require("../app");
const User = require("../models/User");
const mongoose = require("mongoose");
const { initialUsers, getAllUsers } = require("./API_helper");

beforeAll(async () => {
	try {
		await mongoose.connect(process.env.MONGO_TEST_URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true
		});
		console.log(`Connected to test DB...`);
	} catch (error) {
		console.error(error);
	}
});

describe("GET /api/users", () => {
	beforeAll(async () => {
		await User.deleteMany();
		console.log(`DB cleared`);

		const usersArray = initialUsers.map(
			async user => await new User(user).save()
		);
		await Promise.all(usersArray);
		console.log(`DB popultated`);
	});

	test("should return list of users", async () => {
		const users = await api.get("/api/users").expect(200);
		expect(users.body.length).toBe(2);
	});
});

describe("POST /api/users", () => {
	let newUser;
	beforeEach(async () => {
		await User.deleteMany();
		console.log(`DB cleared`);

		const usersArray = initialUsers.map(
			async user => await new User(user).save()
		);
		await Promise.all(usersArray);
		console.log(`DB populated`);

		newUser = {
			username: "Ahmed Farag",
			name: "4EGA",
			password: "123456789"
		};
	});

	test("should post user correctly", async () => {
		const createdUser = await api
			.post("/api/users")
			.send(newUser)
			.expect(201);
		expect(createdUser.body.username).toBe("Ahmed Farag");
		const usersList = await getAllUsers();
		expect(usersList.length).toBe(3);
	});

	test("short username return 400", async () => {
		newUser.username = "a";
		await api
			.post("/api/users")
			.send(newUser)
			.expect(400);
		const usersList = await getAllUsers();
		expect(usersList.length).toBe(2);
	});

	test("short password return 400", async () => {
		newUser.password = "1";
		await api
			.post("/api/users")
			.send(newUser)
			.expect(400);
		const usersList = await getAllUsers();
		expect(usersList.length).toBe(2);
	});

	test("duplicate username return 400", async () => {
		const [existUser] = await getAllUsers();
		await api
			.post("/api/users")
			.send(existUser)
			.expect(400);
		const usersList = await getAllUsers();
		expect(usersList.length).toBe(2);
	});
});

afterAll(() => {
	mongoose.connection.close();
});

const api = supertest(app);
