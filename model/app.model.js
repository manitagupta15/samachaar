const db = require("../db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticles = (article_id) => {
  return db
    .query(
      `
    SELECT articles.*,COUNT(comments.article_id) AS comment_count 
    FROM articles 
    JOIN comments ON comments.article_id= articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id
    
    `,
      [article_id]
    )
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

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => {
    return rows;
  });
};

exports.patchArticle = (article_id, inc_votes) => {
  const validKey = [inc_votes];

  return db
    .query(
      `UPDATE articles SET votes = votes+$1 WHERE article_id = $2 RETURNING *`,
      [inc_votes, article_id]
    )
    .then((article) => {
      return article.rows[0];
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "NOT Found, article_id doesnot exist",
        });
      }
    })
    .then(() => {
      return db.query(
        `SELECT * FROM comments 
      JOIN articles ON articles.article_id = comments.article_id 
      WHERE comments.article_id =$1`,
        [article_id]
      );
    })

    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchArticlesWithCommentCount = (mybody) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id) as comment_count FROM articles
  JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id ORDER BY articles.article_id DESC`
    )
    .then(({ rows }) => {
      const articlesWithFormattedCount = rows.map((article) => {
        const articleCopy = { ...article };
        articleCopy.comment_count = +article.comment_count;
        return articleCopy;
      });
      return articlesWithFormattedCount;
    });
};
