const knex = require("knex");
const configuration = require("../../knexfile");

const config = process.env.NODE_ENV === 'test' ? configuration.test : configuration.development;

const dbConnection = knex(config);

module.exports = dbConnection;

