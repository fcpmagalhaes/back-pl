const dbConnection = require('../database/connection');
const Promise = require('bluebird');

function orderByName(listObjects) {
  return listObjects.sort((first, second) => {
    if (first.label > second.label) {
      return 1;
    }
    if (first.label < second.label) {
      return -1;
    }
    return 0;
  });
};

async function genericQuery(query) {
  try {
    return await dbConnection.raw(query);
  } catch(error) {
    console.log(error);
  }
};

function removeDuplicates(objectOptions) {
  return objectOptions.reduce((acc, cur, idx, src) => {
    if (acc.length === 0) {
      return cur;
    };
    const ids = new Set(acc.map(a => a.value));
    const merged = [...acc, ...cur.filter(b => !ids.has(b.value))];
    return merged;
  }, []);
};

module.exports = {
  async index(req, res) {
    try {
      const filters = [];
      try {
        const academicOrganizationQuery =
          `select 
            id as value, 
            descricao as label 
          from organizacao_academica;`;
        const academicOrganization = {};
        const { rows } = await genericQuery(academicOrganizationQuery);

        academicOrganization.value = 1;
        academicOrganization.label = "Organização Acadêmica";
        academicOrganization.type = "select";
        academicOrganization.options = rows;
        filters.push(academicOrganization);
      } catch (error) {
        return res.json(error);
      }

      try {
        const adminCategoryQuery =
          `select
            id as value,
            descricao as label
          from categoria_administrativa;`;
        const adminCategory = {};
        const { rows } = await genericQuery(adminCategoryQuery);

        adminCategory.value = 2;
        adminCategory.label = "Categoria Administrativa";
        adminCategory.type = "select";
        adminCategory.options = rows;
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
      const options = await Promise.map(
        range,
        async (year) => {
          const iesNamesQuery =
            `select 
              co_ies as value, 
              no_ies as label
            from ies_${year};`
          const names = await genericQuery(iesNamesQuery);
          return names.rows;
        },
        {concurrency: 2}
      );

      if (range.length > 1) {
        iesOptions.options = removeDuplicates(options);
      } else {
        iesOptions.options = options[0];  
      }

      iesOptions.value = 3;
      iesOptions.label = "Nome da Instituição";
      iesOptions.type = "select";
      iesOptions.options = orderByName(iesOptions.options);

      filters.push(iesOptions);
      return res.json(filters);
    } catch (error) {
      return res.json(error);
    }
  }
};