const apiRouter = require("express").Router();
const articleRouter = require("./articles-router");
const commentRouter = require("./comments-router");
const userRouter = require("./users-router");
const topicRouter = require("./topics-router");
const { getAllapi } = require("../controller/app.controller");

apiRouter.get("", getAllapi);

apiRouter.use("/articles", articleRouter);

apiRouter.use("/comments", commentRouter);

apiRouter.use("/users", userRouter);

apiRouter.use("/topics", topicRouter);

module.exports = apiRouter;
