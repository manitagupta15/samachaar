const commentRouter = require("express").Router();

const { deleteCommentByCommentId } = require("../controller/app.controller");

commentRouter.route("/:comment_id").delete(deleteCommentByCommentId);

module.exports = commentRouter;
