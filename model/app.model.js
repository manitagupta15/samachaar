const db = require("../db/connection");
const format = require("pg-format");
const fs = require("fs/promises");
const jsonfile = require("../endpoints.json");
const { dirname } = require("path");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticles = (article_id) => {
  return db
    .query(
      `
    SELECT articles.*,COUNT(comments.article_id) ::INT AS comment_count 
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

exports.fetchArticlesWithCommentCount = (
  sort_by = "created_at",
  order = "DESC",
  topic,
  limit = 10,
  p = 1,
  reqQuery
) => {
  if (Object.keys(reqQuery).length > 0) {
    const validOptionsKeys = ["sort_by", "order", "topic", "limit", "p"];

    for (let key in reqQuery) {
      if (!validOptionsKeys.includes(key)) {
        return Promise.reject({
          status: 404,
          msg: "Invalid query.. sorry!!!",
        });
      }
    }
  }

  const validSortOptionsSort = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
  ];
  const validSortOptionsOrder = ["asc", "ASC", "desc", "DESC"];

  if (!validSortOptionsSort.includes(sort_by)) {
    return Promise.reject({
      status: 404,
      msg: "Invalid sort_by query.. sorry!!!",
    });
  }

  if (!validSortOptionsOrder.includes(order)) {
    return Promise.reject({
      status: 404,
      msg: "Invalid order query.. sorry!!!",
    });
  }

  const offset = limit * (p - 1);
  let queryString = format(
    `SELECT articles.*, COUNT(comments.article_id) as comment_count FROM articles
  JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id ORDER BY ${sort_by} ${order} LIMIT $1 OFFSET $2
  `
  );

  if (topic !== undefined) {
    queryString = format(
      `SELECT articles.*, COUNT(comments.article_id) as comment_count FROM articles
  JOIN comments ON articles.article_id = comments.article_id WHERE articles.topic LIKE '${topic}'
  GROUP BY articles.article_id ORDER BY ${sort_by} ${order} LIMIT $1 OFFSET $2`
    );
  }

  return db.query(queryString, [limit, offset]).then(({ rows }) => {
    const articlesWithFormattedCount = rows.map((article) => {
      const articleCopy = { ...article };
      articleCopy.comment_count = +article.comment_count;
      return articleCopy;
    });
    return articlesWithFormattedCount;
  });
};

exports.insertComment = (article_id, username, body, mybody) => {
  const validKeys = ["username", "body"];

  for (let key in mybody) {
    if (!validKeys.includes(key)) {
      return Promise.reject({
        status: 404,
        msg: "Bad request",
      });
    }
  }

  return db
    .query(
      `INSERT INTO comments (author,body,article_id) VALUES ($1,$2,$3) RETURNING *`,
      [username, body, article_id]
    )

    .then(({ rows }) => {
      return rows[0];
    });
};

exports.getData = () => {
  return jsonfile;
};

exports.deleteComment = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id=$1 returning *", [comment_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Invalid Comment_id" });
      }
      return rows;
    });
};

exports.fetchUser = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "username not present" });
      }
      return rows[0];
    });
};

exports.updateVoteByCommentId = (comment_id, inc_votes) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.insertArticle = (reqBody) => {
  const { author, title, body, topic } = reqBody;

  if (Object.keys(reqBody).length > 0) {
    const validRequestkeys = ["author", "title", "body", "topic"];

    for (let key in reqBody) {
      if (!validRequestkeys.includes(key)) {
        return Promise.reject({
          status: 404,
          msg: "Invalid Body keys.. sorry!!!",
        });
      }
    }
  }

  return db
    .query(
      `INSERT INTO articles (author, title, body, topic) VALUES ($1,$2,$3,$4) RETURNING *`,
      [author, title, body, topic]
    )
    .then(({ rows }) => {
      const { article_id } = rows[0];

      return db
        .query(
          `SELECT articles.*, COUNT(comments.article_id) ::INT AS comment_count FROM articles 
          LEFT JOIN comments ON articles.article_id = comments.article_id 
          WHERE articles.article_id = $1 
          GROUP BY articles.article_id`,
          [article_id]
        )
        .then(({ rows }) => {
          return rows[0];
        });
    });
};
