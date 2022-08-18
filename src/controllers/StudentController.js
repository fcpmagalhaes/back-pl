const dbConnection = require('../database/connection');
const Promise = require('bluebird');

async function executeQuery(year, whereFilters) {
  try {
    return await dbConnection.raw(`select count(*) from aluno_${year} where ${whereFilters}`);
  } catch(error) {
    console.log(error);
  }
};

function iesFilterQuery(iesFilters) {
  if (iesFilters.length !== 0 ) {
    const andSQL = 'AND';
    const inSQL = 'IN';
    const equalSQL = '=';
    const query = iesFilters.map((filter) => {
      let queryFIlter ='';
      if (filter.label === 'Nome da Instituição') {
          let optionsCoIES;
          if (filter.options.length === 1) {
            optionsCoIES = `${equalSQL} ${filter.options[0].value}`;
          } else {
            optionsCoIES = `${inSQL}(`;
            filter.options.map((option,index) => {
              if (option === options[options.length -1]) {
                optionsCoIES.concat(`${option.value})`);
              } else {
                optionsCoIES.concat(`${option.value},`);
              }
            });
            console.log('optionsCoIES mais', optionsCoIES);
          }
          console.log('optionsCoIES', optionsCoIES);
          console.log('queryFIlter antes', queryFIlter);
          queryFIlter = `CO_IES ${optionsCoIES}`;
          console.log('queryFIlter depois', queryFIlter);
          return queryFIlter;

      
      } else if (filter.label === 'Organização Acadêmica') {
        
      } else if (filter.label === 'Categoria Administrativa') {
        
      }
    });
    // CO_IES
    // TP_CATEGORIA_ADMINISTRATIVA
    // TP_ORGANIZACAO_ACADEMICA
    console.log('QUERY', query);
    // return query;
    return ''

  }
  return '';

}

function collegeFilterQuery(collegeFilters) {

  query = '';
  return query;
  
}

function studentFilterQuery(studentFilters) {

  query = '';
  return query;
  
}

module.exports = {
  async testIndex(req, res) {
    try {
      const { rangeYears, iesFilters, collegeFilters, studentFilters } = req.body.data;
      let finalResearch = [];
      if (rangeYears.length > 1) {
        console.log("MAIS DE UM ANO");
        const iesOptions = iesFilterQuery(iesFilters);
        const collegeOptions = iesFilterQuery(collegeFilters);
        const studentOptions = iesFilterQuery(studentFilters);

        // console.log("iesOptions", iesOptions);
        // console.log("collegeOptions", collegeOptions);
        // console.log("studentOptions", studentOptions);
        
        const whereFilters = `${iesOptions} ${collegeOptions} ${studentOptions}`

        // const response = await Promise.map(
        //   range,
        //   async (year) => {
        //     const data = await executeQuery(year, whereFilters);
        //     console.log('data');
        //     const payload = {
        //       year,
        //       finalCount: data.rows
        //     }
        //     return payload;
        //   },
        //   {concurrency: 2}
        // );
        
        // finalResearch.push(response);
      } 
      else {
        console.log("UM ANO");
        const iesOptions = iesFilterQuery(iesFilters);
        const collegeOptions = iesFilterQuery(collegeFilters);
        const studentOptions = iesFilterQuery(studentFilters);

        console.log("iesOptions", iesOptions);
        console.log("collegeOptions", collegeOptions);
        console.log("studentOptions", studentOptions);
        
        const whereFilters = `${iesOptions} ${collegeOptions} ${studentOptions}`;
        const names = await executeQuery(year, whereFilters);
        const data = await executeQuery(year, whereFilters);
        console.log('data');
        const payload = {
          year,
          finalCount: data.rows
        }
        finalResearch.push(payload);
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
