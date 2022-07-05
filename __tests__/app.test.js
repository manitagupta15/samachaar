const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

describe("GET /api/topics", () => {
  test("Get /api/topics endpoint should respond with status 200 and a array of topic objects, each having slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("Get /api/articles/:article_id endpoint should respond status 200 and an article objects, each having author,title,article_id,body,topic,created_at,votes,comment_count property", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          comment_count: "11",
        });
      });
  });

  test("Get /api/articles/:article_id endpoint should respond with a status 404 if article id doesnot exist", () => {
    return request(app)
      .get("/api/articles/1000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("NOT Found, article_id doesnot exist");
      });
  });

  test("Get /api/articles/:article_id endpoint should respond with psql error with a status 400 if article id is of wrong data type", () => {
    return request(app)
      .get("/api/articles/a")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});


describe("GET /api/users", () => {
  test("GET /api/users endpoints responds with status 200 and an array of object, each with property username,name,avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });

describe("Patch /api/articles/:article_id", () => {
  test("patch /api/articles/:article_id, responds with a status code 200 and updates the votes property with given value", () => {
    const incVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/3")
      .send(incVote)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "2020-11-03T09:12:00.000Z",
          votes: 1,
        });
      });
  });

  test("patch /api/articles/:article_id, responds with a status code 400 when no body given", () => {
    const incVote = {};
    return request(app)
      .patch("/api/articles/3")
      .send(incVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("patch /api/articles/:article_id,endpoint should respond with psql error with a status 400 if article id is of wrong data type", () => {
    const incVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/a")
      .send(incVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("patch /api/articles/:article_id, responds with a status code 400 when wrong key is passed in body", () => {
    const incVote = { invotes: 1 };
    return request(app)
      .patch("/api/articles/3")
      .send(incVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("patch /api/articles/:article_id, responds with a psql error status code 400 when key value is not a number", () => {
    const incVote = { inc_votes: "a" };
    return request(app)
      .patch("/api/articles/3")
      .send(incVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});
