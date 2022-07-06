const express = require("express");
const app = express();

app.use(express.json());

const {
  getTopics,
  getArticlesByArticleId,
  getUsers,
  patchArticleByArticleId,
  getCommentsByArticleId,
  getArticles,
  postComment,
  getAllapi,
} = require("./controller/app.controller");

const {
  psqlErrorHandler,
  handleCustomErrors,
  unhandledErrors,
  invalidPathError,
} = require("./errorHandler/errorHandler");

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticlesByArticleId);

app.patch("/api/articles/:article_id", patchArticleByArticleId);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.get("/api/articles", getArticles);

app.get("/api/users", getUsers);

app.post("/api/articles/:article_id/comments", postComment);

app.get("/api", getAllapi);

app.all("/*", invalidPathError);

//error handlers
app.use(psqlErrorHandler);
app.use(handleCustomErrors);
app.use(unhandledErrors);

module.exports = app;
