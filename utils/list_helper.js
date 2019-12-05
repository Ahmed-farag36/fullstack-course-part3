const dummy = blogs => {
	return 1;
};

const totalLikes = blogs => {
	return blogs.reduce((sum, cur) => sum + cur.likes, 0);
};

const favouriteBlog = blogs => {
	return blogs.reduce((prev, cur) => (prev.likes < cur.likes ? cur : prev), {
		likes: 0
	});
};

const mostBlogs = blogs => {
	const myMap = new Map();
	blogs.map(({ author }) => {
		if (myMap.has(author)) {
			let blogs = myMap.get(author);
			myMap.set(author, ++blogs);
		} else {
			myMap.set(author, 1);
		}
	});
	const mostBlogsAuthor = [...myMap].reduce(
		(prev, cur) => (prev[1] < cur[1] ? cur : prev),
		["", 0]
	);
	return {
		author: mostBlogsAuthor[0],
		blogs: mostBlogsAuthor[1]
	};
};

const mostLikes = blogs => {
	const myMap = new Map();
	blogs.map(({ author, likes }) => {
		if (myMap.has(author)) {
			let prevLikes = myMap.get(author);
			myMap.set(author, prevLikes + likes);
		} else {
			myMap.set(author, likes);
		}
	});
	const mostLikedAuthor = [...myMap].reduce(
		(prev, cur) => (prev[1] < cur[1] ? cur : prev),
		["", 0]
	);
	return {
		author: mostLikedAuthor[0],
		likes: mostLikedAuthor[1]
	};
};

exports.dummy = dummy;
exports.totalLikes = totalLikes;
exports.favouriteBlog = favouriteBlog;
exports.mostBlogs = mostBlogs;
exports.mostLikes = mostLikes;
