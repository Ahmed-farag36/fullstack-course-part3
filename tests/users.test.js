const mongoose = require("mongoose");
const User = require("../models/User");
const { initialUsers, getAllUsers, addUser } = require("./test_helper");

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
		const users = await getAllUsers();
		expect(users.status).toBe(200);
		expect(users.body.length).toBe(2);
	});
});

describe("POST /api/users", () => {
	let newUser;
	beforeEach(async () => {
		await User.deleteMany();
		console.log(`DB cleared`);

		newUser = {
			username: "Ahmed Farag",
			name: "4EGA",
			password: "123456789"
		};
	});

	test("should post user correctly", async () => {
		const response = await addUser(newUser);
		expect(response.status).toBe(201);

		const users = await getAllUsers();
		expect(users.body.length).toBe(1);
	});

	test("short username return 400", async () => {
		newUser.username = "a";
		const response = await addUser(newUser);
		expect(response.status).toBe(400);

		const users = await getAllUsers();
		expect(users.body.length).toBe(0);
	});

	test("short password return 400", async () => {
		newUser.password = "1";
		const response = await addUser(newUser);
		expect(response.status).toBe(400);

		const users = await getAllUsers();
		expect(users.body.length).toBe(0);
	});

	test("duplicate username return 400", async () => {
		const { body } = await getAllUsers();
		const existUser = body;
		const response = await addUser(existUser);
		expect(response.status).toBe(400);

		const users = await getAllUsers();
		expect(users.body.length).toBe(0);
	});
});

afterAll(() => {
	mongoose.connection.close();
});
