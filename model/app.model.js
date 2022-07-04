const db = require("../db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticles = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows[0] === undefined) {
        return Promise.reject({
          status: 404,
          msg: "NOT Found, article_id doesnot exist",
        });
      }
      return rows[0];
    });
};

exports.patchArticle = (article_id, inc_votes) => {
  if (inc_votes === undefined)
    return Promise.reject({
      status: 400,
      msg: "Bad Request, inc_votes not given",
    });
  return db
    .query(
      `UPDATE articles SET votes = votes+${inc_votes} WHERE article_id = ${article_id} RETURNING *`
    )
    .then((article) => {
      return article.rows[0];
    });
};
