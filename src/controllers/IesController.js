const dbConnection = require('../database/connection');
const Promise = require('bluebird');

module.exports = {
  async index(req, res) {
    try {
      const { range } = req.body.data;

      if (range.length > 1) {
        const response = await Promise.map(
          range,
          async (year) => {
            const names = await executeQuery(year);
            return names.rows;
          },
          {concurrency: 2}
        );
        
        return res.json(response);
      } else {
        const year = range[0];
        const response = await executeQuery(year);
        
        return res.json(response.rows);
      }
    } catch (error) {
      return res.json(error);
    }

    async function executeQuery(year) {
      try {
        return await dbConnection.raw(`select co_ies, no_ies from ies_${year}`);
      } catch(error) {
        console.log(error);
      }
    }
  },
};