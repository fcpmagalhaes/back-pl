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

function getUniqueListBy(arr, key) {
  return [...new Map(arr.map(item => [item[key], item])).values()]
}

module.exports = {
  async index(req, res) {
    try {
      const { range } = req.body.data;
      let collegeList = [];
      if (range.length > 1) {
        const response = await Promise.map(
          range,
          async (year) => {
            const names = await executeQuery(year);
            return getUniqueListBy(names.rows, 'no_curso');
          },
          {concurrency: 2}
        );

        const responseUnduplicated = response.reduce((acc, cur, idx, src) => {
          if (acc.length === 0) {
            return cur;
          };
          const ids = new Set(acc.map(a => a.co_curso));
          const merged = [...acc, ...cur.filter(b => !ids.has(b.co_curso))];
          return merged;
        }, []);
        collegeList = responseUnduplicated;
      }
      else {
        const year = range[0];
        const response = await executeQuery(year);
        const removedDuplicatedNames = getUniqueListBy(response.rows, 'no_curso');
        const unDuplicatedNamesAndCode = getUniqueListBy(removedDuplicatedNames, 'co_curso');
        collegeList = unDuplicatedNamesAndCode;
      }
      return res.json(orderByName(collegeList));
    } catch (error) {
      return res.json(error);
    }
  },

  async collegeNames(req, res) {
    try {
      const { range } = req.body.data;
      const filters = [];
      let collegeOptions = {};

      const options = await Promise.map(
        range,
        async (year) => {
          const collegeNamesQuery =
            `select 
              no_curso as label 
            from curso_${year}
            group by no_curso 
            having count(*) > 0
            order by no_curso`
          const names = await genericQuery(collegeNamesQuery);
          return names.rows;
        },
        {concurrency: 2}
      );

      const optionsYearsJoint = options.reduce((acc, curVal) => {
        return acc.concat(curVal)
      }, []);

      const removedDuplicatedNames = getUniqueListBy(optionsYearsJoint, 'label');

      collegeOptions.value = 1;
      collegeOptions.label = "Nome do Curso";
      collegeOptions.type = "select";
      collegeOptions.options = orderByName(removedDuplicatedNames);

      filters.push(collegeOptions);
      return res.json(filters);
    } catch (error) {
      return res.json(error);
    }
  }
};