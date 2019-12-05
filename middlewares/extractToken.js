module.exports = (req, res, next) => {
	if (req.headers["authorization"]) {
		const token = req.headers["authorization"].slice(7);
		req.token = token;
	}
	next();
};
