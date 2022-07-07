const commentRouter = require("express").Router();

const {
  deleteCommentByCommentId,
  patchComment,
} = require("../controller/app.controller");

commentRouter
  .route("/:comment_id")
  .delete(deleteCommentByCommentId)
  .patch(patchComment);

module.exports = commentRouter;
