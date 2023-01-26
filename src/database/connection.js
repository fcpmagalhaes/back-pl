require('dotenv').config();

const knex = require("knex");
const configuration = require("../../knexfile");

const config = process.env.DB_ENVIRONMENT === 'production' ? configuration.production : configuration.development;

module.exports = knex(config);