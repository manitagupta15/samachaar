const {
  fetchTopics,
  fetchArticles,
  patchArticle,
  fetchArticlesWithCommentCount,
} = require("../model/app.model");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticlesByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticles(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  patchArticle(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  fetchArticlesWithCommentCount()
    .then((articles) => {
      //  console.log(articles);
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};
