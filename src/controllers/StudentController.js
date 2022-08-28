const dbConnection = require('../database/connection');
const studentStaticFilters = require('../utils/studentFilters');
const studentSelectorFilters = require('../utils/studentFilters');

async function genericQuery(query) {
  try {
    return await dbConnection.raw(query);
  } catch(error) {
    console.log(error);
  }
};

module.exports = {
  async index(req, res) {
    try {
      const filters = await Promise.all(studentSelectorFilters().map(async (option) => {
        try {
          const query =
            `select 
              id as value, 
              descricao as label 
            from ${option.table};`;
          const { rows } = await genericQuery(query);
          const filter = {
            value: option.valueNumber,
            label: option.label,
            type: option.type,
            options: rows
          };

          return filter;
        } catch (error) {
          return res.json(error);
        }
      }));

      const concatFiltersAndSort = filters.concat(studentStaticFilters()).sort((a,b) => a.value - b.value);

      return res.json(concatFiltersAndSort);
    } catch (error) {
      return res.json(error);
    }
  },
};