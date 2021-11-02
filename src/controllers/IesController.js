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

module.exports = {
  async index(req, res) {
    try {
      const { range } = req.body.data;
      let iesList = [];
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
        iesList = responseUnduplicated;
      } 
      else {
        const year = range[0];
        const response = await executeQuery(year);
        iesList = response.rows;
      }

      return res.json(orderByName(iesList));
    } catch (error) {
      return res.json(error);
    }
  }
};