# SamachaarNews API

https://nc-news-samachaara.herokuapp.com/

## About the api

This API is build for the purpose of accessing application data programmatically.
This api will allow user to get information related to articles, comments, topics and users of the news.
It will let user do various queries on the database to get the desired results.
The database used is PostgreSQL.

## Setting the Environment Variables

For security reason, environment variables are hidden in this repository.
To setup environment variable, create files .env.test with the following to set the environment variable

```bash
PGDATABASE=nc_news_test
```

## Installation

Run the following command to install all the dependencies

```bash
npm install
```

## Dependencies

    - dotenv
    - pg-format
    - dotenv
    - express
    - pg

## Setup database and seed the database

```bash
npm run setup-dbs
npm run seed

```

## Running test with the test database

Run the following command to test this code

```bash
npm test
```

## Versions

```bash
    - developed on VS Code 1.56.2
    - tested using supertests 6.1.3 ,Jest 26.6.3 and Jest-sorted 1.0.12
```
