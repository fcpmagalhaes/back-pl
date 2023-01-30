require('dotenv').config();

const knex = require("knex");
const configuration = require("../../knexfile");

const config = process.env.DB_ENVIRONMENT === 'production' ? configuration.production : configuration.development;
console.log('config', config);
module.exports = knex(config);


// const knex = require("knex");
// const parse = require("pg-connection-string").parse;

// // Parse the environment variable into an object containing User, Password, Host, Port etc at separate key-value pairs
// const pgconfig = parse(process.env.DATABASE_URL);

// // Add SSL setting to default environment variable on a new key-value pair (the value itself is an object)
// pgconfig.ssl = { rejectUnauthorized: false };

// const db = knex({
//   client: "pg",
//   connection: pgconfig,
// });

// module.exports = db;