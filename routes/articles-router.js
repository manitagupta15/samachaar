const articleRouter = require("express").Router();

const {
  getArticlesByArticleId,
  patchArticleByArticleId,
  getCommentsByArticleId,
  getArticles,
  postComment,
} = require("../controller/app.controller");

articleRouter.route("").get(getArticles);

articleRouter
  .route("/:article_id")
  .get(getArticlesByArticleId)
  .patch(patchArticleByArticleId);

articleRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment);

module.exports = articleRouter;
