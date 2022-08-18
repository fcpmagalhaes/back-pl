const dbConnection = require('../database/connection');
const Promise = require('bluebird');

function orderByName(listObjects) {
  return listObjects.sort((first, second) => {
    if (first.no_ies > second.no_ies) {
      return 1;
    }
    if (first.no_ies < second.no_ies) {
      return -1;
    }
    return 0;
  });
};

async function executeQuery(year) {
  try {
    return await dbConnection.raw(`select co_ies, no_ies from ies_${year}`);
  } catch(error) {
    console.log(error);
  }
};

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
      const filters = [];
      try {
        const academicOrganizationQuery = `select * from organizacao_academica;`;
        const academicOrganization = {};
        const { rows } = await genericQuery(academicOrganizationQuery);

        academicOrganization.value = 1;
        academicOrganization.label = "Organização Acadêmica";
        academicOrganization.type = "select";
        academicOrganization.options = rows.map((row) => {
          delete Object.assign(row, {value: row.id})['id'];
          delete Object.assign(row, {label: row.descricao})['descricao'];
          return row;
        });
        filters.push(academicOrganization);
      } catch (error) {
        return res.json(error);
      }

      try {
        const adminCategoryQuery = `select * from categoria_administrativa;`;
        const adminCategory = {};
        const { rows } = await genericQuery(adminCategoryQuery);

        adminCategory.value = 2;
        adminCategory.label = "Categoria Administrativa";
        adminCategory.type = "select";
        adminCategory.options = rows.map((row) => {
          delete Object.assign(row, {value: row.id})['id'];
          delete Object.assign(row, {label: row.descricao})['descricao'];
          return row;
        });

        filters.push(adminCategory);
      } catch (error) {
        return res.json(error);
      }

      return res.json(filters);
    } catch (error) {
      return res.json(error);
    }
  },

  async iesNames(req, res) {
    try {
      const { range } = req.body.data;
      const filters = [];
      let iesOptions = {};
      let options = [];

      if (range.length > 1) {
        const response = await Promise.map(
          range,
          async (year) => {
            const names = await executeQuery(year);
            return names.rows;
          },
          {concurrency: 2}
        );

        const responseUnduplicated = response.reduce((acc, cur, idx, src) => {
          if (acc.length === 0) {
            return cur;
          };
          const ids = new Set(acc.map(a => a.co_ies));
          const merged = [...acc, ...cur.filter(b => !ids.has(b.co_ies))];
          return merged;
        }, []);

        options = responseUnduplicated;
      } 
      else {
        const year = range[0];
        const { rows } = await executeQuery(year);
        options = rows;
      }

      iesOptions.value = 3;
      iesOptions.label = "Nome da Instituição";
      iesOptions.type = "select";
      options = options.map((row) => {
        delete Object.assign(row, {value: row.co_ies})['co_ies'];
        delete Object.assign(row, {label: row.no_ies})['no_ies'];
        return row;
      });
      iesOptions.options = orderByName(options);

      filters.push(iesOptions);
      return res.json(filters);
    } catch (error) {
      return res.json(error);
    }
  }
};