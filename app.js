const express = require("express");
const app = express();
const { getTopics } = require("./controller/app.controller");

const {
  psqlErrorHandler,
  handleCustomErrors,
  unhandledErrors,
} = require("./errorHandler/errorHandler");

app.get("/api/topics", getTopics);

//error handlers
app.use(psqlErrorHandler);
app.use(handleCustomErrors);
app.use(unhandledErrors);

module.exports = app;
