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
  async testIndex(req, res) {
    try {
      const { rangeYears } = req.body.data;
      let iesList;
      if (rangeYears.length > 1) {
        // rangeYears
        // iesFilters
        // collegeFilters
        // studentFilters
        console.log(req.body.data);
        
        iesList = 'mais de um ano';
      } 
      else {
        iesList = 'somente um ano';
      }
      return res.json(iesList);
    } catch (error) {
      return res.json(error);
    }
  },

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
  },

  async oldIndex(req, res) {
    try {

      let searchRange = [];
      const searchParams = req.body;

      if (searchParams.range.length > 1) {
        searchParams.range.map(async (year) => {
          console.log('ano', year);
          const result = await executeQuery(year).then((a) => searchRange.push(a));
          console.log('result', result);
          // searchRange.push(result);
        }
        );
        console.log('searchRange', searchRange);
        return res.json(searchRange);
        // console.log('searchRange', searchRange);
      
      } else {
        console.log('entrei2');
        const result = await executeQuery(searchParams.range[0]);
        searchRange.push(result);
        return res.json(searchRange);
        return res.json('all ok');
      }
      // console.log('searchRange', searchRange);
      // return res.json(searchRange);

    } catch (error){
      return res.json(error);
    }

    async function executeQuery(year) {
      try {
        const resultado = await dbConnection.raw(`select count(*) from alunos_${year} where "tp_categoria_administrativa" = 1`);
        console.log(resultado);
        return resultado;
      } catch(e) {
        console.log(e);
      }
    }

  },
};

// SELECT count(*)
// from public.alunos_df
// INNER JOIN public.organizacao_academica
// ON public.organizacao_academica.id = public.alunos_df.tp_organizacao_academica
// WHERE public.organizacao_academica.tipo like('Universidade');
