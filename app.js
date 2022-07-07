const express = require("express");
const app = express();

app.use(express.json());

const apiRouter = require("./routes/api-router");

const {
  psqlErrorHandler,
  handleCustomErrors,
  unhandledErrors,
  invalidPathError,
} = require("./errorHandler/errorHandler");

app.use("/api", apiRouter);

//error handlers
app.all("/*", invalidPathError);
app.use(psqlErrorHandler);
app.use(handleCustomErrors);
app.use(unhandledErrors);

module.exports = app;
