const Redis = require("ioredis");

const redisClient = new Redis();

const REDIS_KEYS = {
  SEARCH_POSTS: "searchposts",
  FOUND_POSTS: "foundposts",
  ALL_POSTS: "allposts"
};

const Post = require("../resources/post/post.model");

const keys = Object.entries(REDIS_KEYS).reduce((accumulator, current) => {
  return [...accumulator, current];
}, []);

Post.find({})
  .then(data => {
    return data.map(x => JSON.stringify(x));
  })
  .then(data => {
    return redisClient.lpush(REDIS_KEYS.ALL_POSTS, ...data);
  })
  .then(() => {
    console.log("hello");
  })
  .catch(() => {});

// redisClient
//   .del(...keys)
//   .then(data => {
//     console.log(data);
//   })
//   .catch(console.log);

module.exports = {
  redisClient,
  REDIS_KEYS
};
