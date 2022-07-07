const articleRouter = require("express").Router();

const {
  getArticlesByArticleId,
  patchArticleByArticleId,
  getCommentsByArticleId,
  getArticles,
  postComment,
  postArticle,
} = require("../controller/app.controller");

articleRouter.route("").get(getArticles).post(postArticle);

articleRouter
  .route("/:article_id")
  .get(getArticlesByArticleId)
  .patch(patchArticleByArticleId);

articleRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment);

module.exports = articleRouter;
