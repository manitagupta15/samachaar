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

describe("testing for invalid paths", () => {
  test("invalid path reponds with status 404 and message invalid path", () => {
    return request(app)
      .get("/any")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Path!");
      });
  });
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

describe("GET /api/articles", () => {
  test("Get /api/articles endpoint should respond with status 200 and a array of articles objects, each having author, title, article_id, topic, created_at, votes and comment_count properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(5);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),

              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              body: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST /api/articles/:article_id/comments responds with status code 201 and add a new comment in in the comments table with the given username and body", () => {
    const newComment = { username: "rogersop", body: "what a lovely story!!" };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: "what a lovely story!!",
            votes: 0,
            author: "rogersop",
            article_id: 2,
            created_at: expect.any(String),
          })
        );
      });
  });

  test("POST /api/articles/:article_id/comments responds with status code 400 username is not a valid username in users table", () => {
    const newComment = { username: "Hello", body: "what a lovely story!!" };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("POST /api/articles/:article_id/comments responds with status code 400 article is not a valid article id from articles table", () => {
    const newComment = { username: "rogersop", body: "what a lovely story!!" };
    return request(app)
      .post("/api/articles/222/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("POST /api/articles/:article_id/comments responds with psql error status code 400 if article_id is not a number", () => {
    const newComment = { username: "rogersop", body: "what a lovely story!!" };
    return request(app)
      .post("/api/articles/a/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("POST /api/articles/:article_id/comments responds with psql error status code 400 if body is not passes in", () => {
    const newComment = { username: "rogersop" };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("POST /api/articles/:article_id/comments responds with psql error status code 400 if username is not passes in", () => {
    const newComment = { body: "what a lovely story!!" };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("GET /api/articles/:article_id/comments endpoint responds with status 200 and an array of comments for the given article_id of which each comment should have the following properties: comment_id,votes, created_at,author,body", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(11);

        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
            })
          );
        });
      });
  });

  test("GET /api/articles/:article_id/comments endpoint responds with status 404 and msg NOT Found, article_id doesnot exist", () => {
    return request(app)
      .get("/api/articles/100/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("NOT Found, article_id doesnot exist");
      });
  });

  test("GET /api/articles/:article_id/comments endpoint responds with psql error, status 400 and msg Not found, if article_id is of wrong data type", () => {
    return request(app)
      .get("/api/articles/a/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("GET /api/articles/:article_id/comments endpoint responds with status 200 and an array of length 0 where there are no comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(0);
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE /api/comments/:comment_id, responds with status 204 deletes the comment with given comment Id", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("DELETE /api/comments/:comment_id, responds with psql error and status 400 and msg Not Found when given comment Id is of wrong data type", () => {
    return request(app)
      .delete("/api/comments/a")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("DELETE /api/comments/:comment_id, responds with error status 404 and msg Not Found when given comment Id is not presend", () => {
    return request(app)
      .delete("/api/comments/1000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Comment_id");
      });
  });
});
