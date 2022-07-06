# SamachaarNews API

https://nc-news-samachaara.herokuapp.com/

## About the api

This API is build for the purpose of accessing application data programmatically.
This api will allow user to get information related to articles, comments, topics and users of the news.
It will let user do various queries on the database to get the desired results.
The database used is PostgreSQL version 2.5.8.

## Setting the Environment Variables

For security reason, environment variables are hidden in this repository.
To setup environment variable, create two files .env.development and .env.test with the following to set the environment variable

```bash
for development database(.env.development) -
PGDATABASE=nc_news

for test database(.env.test) -
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
    - developed on VS Code Version: 1.68.1
    - PostgreSQL Version: 2.5.8
    - Node Version: 18.1.0
    - tested using supertests 6.2.4 ,Jest 27.5.1 and Jest-sorted 1.0.14
```
