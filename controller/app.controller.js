const { jsonFile } = require("../endpoints.json");

const {
  fetchTopics,
  fetchArticles,
  fetchUsers,
  patchArticle,
  fetchCommentsByArticleId,
  fetchArticlesWithCommentCount,
  insertComment,
  getData,
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

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
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

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

//changes made for incorporate task 11
exports.getArticles = (req, res, next) => {
  const reqQuery = req.query;
  const { sort_by, order, topic } = req.query;

  fetchArticlesWithCommentCount(sort_by, order, topic, reqQuery)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  const mybody = req.body;

  insertComment(article_id, username, body, mybody)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllapi = (req, res, next) => {
  const data = getData();

  res.status(200).send({ data });
};
