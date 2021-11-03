const dbConnection = require('../database/connection');
const Promise = require('bluebird');

function orderByName(listObjects) {
  return listObjects.sort((first, second) => {
    if (first.no_curso > second.no_curso) {
      return 1;
    }
    if (first.no_curso < second.no_curso) {
      return -1;
    }
    return 0;
  });
};

async function executeQuery(year) {
  try {
    return await dbConnection.raw(`select co_curso, no_curso from curso_${year}`);
  } catch(error) {
    console.log(error);
  }
};

function removeDuplicatesByName(listObjects) {
  return listObjects.reduce((acc, cur, idx, src) => {
    if (acc.length === 0) {
      return cur;
    };
    const ids = new Set(acc.map(a => a.co_curso));
    const merged = [...acc, ...cur.filter(b => !ids.has(b.co_curso))];
    return merged;
  }, []);
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
  }
};