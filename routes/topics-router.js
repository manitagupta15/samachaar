const topicRouter = require("express").Router();

const { getTopics } = require("../controller/app.controller");

topicRouter.route("").get(getTopics);

module.exports = topicRouter;
