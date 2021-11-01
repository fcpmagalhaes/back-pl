// Update with your config settings.

module.exports = {
  development: {
    client: "pg",
    connection: {
      database: "inep_2015_2019",
      user: "postgres",
      password: "postgres",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations_inep_2015_2019",
    },
  },
};
