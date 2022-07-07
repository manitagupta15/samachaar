const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index");

const jsonFile = require("../endpoints.json");

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
          comment_count: 11,
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
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });

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
  test("POST /api/articles/:article_id/comments responds with status code 201 and add a new comment in the comments table with the given username and body", () => {
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
describe("GET /api/articles (queries)", () => {
  test("GET /api/articles (queries) sort_by, which sorts the articles by any valid column (defaults to date)", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id", {
          descending: true,
          coerce: false,
        });
      });
  });

  test("GET /api/articles (queries) sort_by responds with status 404 and error mesaage if valid query key is not passed(sort_by,order,topic)", () => {
    return request(app)
      .get("/api/articles?inValidQueryKey=article_id")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid query.. sorry!!!");
      });
  });

  test("GET /api/articles (queries) sort_by responds with status 404 and error mesaage if valid column is not passed--article_id, title, topic, author, body, created_at, votes", () => {
    return request(app)
      .get("/api/articles?sort_by=Hello")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid sort_by query.. sorry!!!");
      });
  });

  test("GET /api/articles (queries) Order, which orders the articles ASC or DESC by any valid column (defaults to date)", () => {
    return request(app)
      .get("/api/articles?order=ASC")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: false,
          coerce: true,
        });
      });
  });

  test("GET /api/articles (queries) Order responds with status 404 and error mesaage if valid column is not passed--article_id, title, topic, author, body, created_at, votes", () => {
    return request(app)
      .get("/api/articles?order=Hello")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid order query.. sorry!!!");
      });
  });

  test("GET /api/articles (queries) when both order and sort_by queries are done, sorts the articles by any valid column (defaults to date)", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=ASC")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id", {
          descending: false,
          coerce: false,
        });
      });
  });

  test("GET /api/articles (queries) Topic, which responds with status 200 and array of articles with given topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(4);

        expect(articles).toBeSortedBy("created_at", {
          descending: true,
          coerce: false,
        });

        expect(articles).toEqual([
          {
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: 0,
            comment_count: 2,
            total_count: 4,
          },
          {
            article_id: 6,
            title: "A",
            topic: "mitch",
            author: "icellusedkars",
            body: "Delicious tin of cat food",
            created_at: "2020-10-18T01:00:00.000Z",
            votes: 0,
            comment_count: 1,
            total_count: 4,
          },
          {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            comment_count: 11,
            total_count: 4,
          },
          {
            article_id: 9,
            title: "They're not exactly dogs, are they?",
            topic: "mitch",
            author: "butter_bridge",
            body: "Well? Think about it.",
            created_at: "2020-06-06T09:10:00.000Z",
            votes: 0,
            comment_count: 2,
            total_count: 4,
          },
        ]);
      });
  });

  test("GET /api/articles (queries) Topic, which responds with status 200 and array of empty articles with given topic doesnot exist", () => {
    return request(app)
      .get("/api/articles?topic=Hello")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(0);
      });
  });

  test("GET /api/articles (queries) Topic,sortby,order, which responds with status 200 and array of articles when given topic, sortby and order", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&topic=mitch&order=ASC")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(4);

        expect(articles).toBeSortedBy("article_id", {
          descending: false,
          coerce: false,
        });

        expect(articles).toEqual([
          {
            article_id: 1,
            author: "butter_bridge",
            body: "I find this existence challenging",
            comment_count: 11,
            created_at: "2020-07-09T20:11:00.000Z",
            title: "Living in the shadow of a great man",
            topic: "mitch",
            votes: 100,
            total_count: 4,
          },
          {
            article_id: 3,
            author: "icellusedkars",
            body: "some gifs",
            comment_count: 2,
            created_at: "2020-11-03T09:12:00.000Z",
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            votes: 0,
            total_count: 4,
          },
          {
            article_id: 6,
            author: "icellusedkars",
            body: "Delicious tin of cat food",
            comment_count: 1,
            created_at: "2020-10-18T01:00:00.000Z",
            title: "A",
            topic: "mitch",
            votes: 0,
            total_count: 4,
          },
          {
            article_id: 9,
            author: "butter_bridge",
            body: "Well? Think about it.",
            comment_count: 2,
            created_at: "2020-06-06T09:10:00.000Z",
            title: "They're not exactly dogs, are they?",
            topic: "mitch",
            votes: 0,
            total_count: 4,
          },
        ])
        expect(articles[0].total_count).toBe(4);
      });
  });

  test("GET /api/article (queries) limit, which responds with status 200 and array of articles with given limit", () => {
    return request(app)
      .get("/api/articles?limit=2")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);

        expect(articles).toHaveLength(2);
      });
  });

  test("GET /api/article (queries) limit, which responds with error status 400 when wrong datatype of limit is given", () => {
    return request(app)
      .get("/api/articles?limit=NOLIMIT")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("GET /api/article (queries) p, which responds with status 200 and array of articles with the limit after the offset", () => {
    return request(app)
      .get("/api/articles?limit=2&p=2")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);

        expect(articles).toHaveLength(2); // as there are total 5 articles in articles table. so 2 article found on page 2 as limit is 2
        expect(articles).toEqual([
          {
            article_id: 5,
            title: "UNCOVERED: catspiracy to bring down democracy",
            topic: "cats",
            author: "rogersop",
            body: "Bastet walks amongst us, and the cats are taking arms!",
            created_at: "2020-08-03T13:14:00.000Z",
            votes: 0,
            comment_count: 2,
            total_count: 5,
          },
          {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            comment_count: 11,
            total_count: 5,
          },
        ]);
        expect(articles[0].total_count).toBe(5);
      });
  });

  // test("GET /api/article (queries) p, which responds with status 404 and when no article found on given page(less number of article to have another page)", () => {
  //   return request(app)
  //     .get("/api/articles?p=6")
  //     .expect(404)
  //     .then(({ body: { msg } }) => {
  //       expect(msg).toBe(
  //         "Number of records are less than given limit or default limit of 10"
  //       );
  //     });
  // });
});

describe("Get /api", () => {
  test("Get /api responds with json object with all the endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { data } }) => {
        expect(typeof data).toBe("object");
        expect(data).toEqual(jsonFile);
      });
  });
});

describe("GET /api/users/:username", () => {
  test("GET /api/users/:username reponds with status 200 and user Object with given username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(typeof user).toBe("object");

        expect(user).toEqual({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });

  test("GET /api/users/:username reponds with status 404 and username doesnot exist", () => {
    return request(app)
      .get("/api/users/butter")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username not present");
      });
  });

  test("GET /api/users/:username reponds with error status 404 when username is of wrong data type", () => {
    return request(app)
      .get("/api/users/butter")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("username not present");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("PATCH /api/comments/:comment_id responds with status 200 and the updated comment", () => {
    const input = { inc_votes: 3 };

    return request(app)
      .patch("/api/comments/2")
      .send(input)
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual({
          comment_id: 2,
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          article_id: 1,
          author: "butter_bridge",
          votes: 17,
          created_at: "2020-10-31T03:03:00.000Z",
        });
      });
  });

  test("patch /api/comments/:comment_id, responds with a status code 400 when no body given", () => {
    const incVote = {};
    return request(app)
      .patch("/api/comments/2")
      .send(incVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("patch /api/comments/:comment_id,endpoint should respond with psql error with a status 400 if comment id is of wrong data type", () => {
    const incVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/a")
      .send(incVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("patch /api/comments/comment_id, responds with a status code 400 when wrong key is passed in body", () => {
    const incVote = { invotes: 1 };
    return request(app)
      .patch("/api/comments/3")
      .send(incVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("patch /api/comments/comment_id, responds with a psql error status code 400 when key value is not a number", () => {
    const incVote = { inc_votes: "a" };
    return request(app)
      .patch("/api/comments/3")
      .send(incVote)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles", () => {
  test("POST /api/articles responds with status 201 and newly created article", () => {
    const input = {
      title: "Sony The Laptop",
      topic: "mitch",
      author: "icellusedkars",
      body: "Call me Mitchell",
    };

    return request(app)
      .post("/api/articles")
      .send(input)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toEqual({
          article_id: expect.any(Number),
          title: "Sony The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell",
          created_at: expect.any(String),
          votes: 0,
          comment_count: 0,
        });
      });
  });

  test("POST /api/articles responds with status code 400 author is not a valid username from users table", () => {
    const newArticle = {
      title: "Sony The Laptop",
      topic: "mitch",
      author: "Hello",
      body: "Call me Mitchell",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("POST /api/articles responds with psql error status code 400 if keys are missing from the input body (body missing here)", () => {
    const newArticle = {
      title: "Sony The Laptop",
      topic: "mitch",
      author: "Hello",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  test("POST /api/articles/:article_id/comments responds with psql error status code 400 if wrong key is passed in", () => {
    const newArticle = {
      title: "Sony The Laptop",
      topic: "mitch",
      author: "Hello",
      body: "Call me Mitchell",
      name: "hery",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Body keys.. sorry!!!");
      });
  });
});
