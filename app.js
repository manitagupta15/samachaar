const express = require("express");
const app = express();
const { getTopics, getArticles } = require("./controller/app.controller");

const {
  psqlErrorHandler,
  handleCustomErrors,
  unhandledErrors,
} = require("./errorHandler/errorHandler");

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticles);

//error handlers
app.use(psqlErrorHandler);
app.use(handleCustomErrors);
app.use(unhandledErrors);

module.exports = app;
