const dbConnection = require('../database/connection');
const Promise = require('bluebird');

async function executeQuery(year, whereFilters) {
  try {
    return await dbConnection.raw(`select count(*) from aluno_${year} where ${whereFilters}`);
  } catch(error) {
    console.log(error);
  }
};

function subQuery(filter, column) {
  const inSQL = 'IN';
  const equalSQL = '=';
  let optionsQuery = "";
  if (filter.options.length === 1) {
    optionsQuery = `${equalSQL} ${filter.options[0].value}`;
  } else {
    const options = filter.options.map(option => option.value);
    optionsQuery = `${inSQL}(${options.join()})`;
  }
  return `${column} ${optionsQuery}`;
};

function subQueryCollegeName(filter, column, year) {
  const inSQL = 'IN';
  const options = filter.options.map(option => `'${option.label}'`);
  const optionsQuery = `${inSQL}(${options.join()})`;

  return `${column} ${inSQL}(select ${column} from curso_${year} where no_curso ${optionsQuery})`
};

function collegeFilterQuery(collegeFilters, year) {
  if (collegeFilters.length !== 0 ) {
    const andSQL = 'AND';
    const query = collegeFilters.map((filter) => {

      if (filter.value === 1) {
        return subQuery(filter, 'TP_GRAU_ACADEMICO');
      }            
      if (filter.value === 2) {
        return subQuery(filter, 'TP_TURNO');
      };
      if (filter.value === 3) {
        return subQuery(filter, 'TP_NIVEL_ACADEMICO');
      };
      if (filter.value === 4) {
        return subQuery(filter, 'TP_MODALIDADE_ENSINO');
      };
      if (filter.value === 5) {
        return subQueryCollegeName(filter, 'CO_CURSO', year);
      };
      
    });
    return query.join(`${andSQL}`);
  }
  return null;
};


function iesFilterQuery(iesFilters) {
  if (iesFilters.length !== 0 ) {
    const andSQL = 'AND';
   
    const query = iesFilters.map((filter) => {      
      if (filter.value === 1) {
        return subQuery(filter, 'TP_ORGANIZACAO_ACADEMICA');
      }
      if (filter.value === 2) {
        return subQuery(filter, 'TP_CATEGORIA_ADMINISTRATIVA');
      };
      if (filter.value === 3) {
          return subQuery(filter, 'CO_IES');
      };
    });
    return query.join(` ${andSQL} `);
  }
  return null;
};

function studentFilterQuery(studentFilters) {
  if (studentFilters.length !== 0 ) {
    const andSQL = 'AND';
    const query = studentFilters.map((filter) => {
      if (filter.value === 1) {
        return subQuery(filter, 'TP_COR_RACA');
      }
      if (filter.value === 2) {
        return subQuery(filter, 'TP_SEXO');
      };
      if (filter.value === 4) {
        return subQuery(filter, 'TP_SITUACAO');
      };
      if (filter.value === 5) {
        return subQuery(filter, 'IN_DEFICIENCIA');
      };
      if (filter.value === 27) {
        return subQuery(filter, 'TP_ESCOLA_CONCLUSAO_ENS_MEDIO');
      };
      if (filter.value === 28) {
        return subQuery(filter, 'TP_SEMESTRE_CONCLUSAO');
      };
      if (filter.value === 29) {
        return subQuery(filter, 'IN_MOBILIDADE_ACADEMICA');
      };
      if (filter.value === 30) {
        return subQuery(filter, 'TP_NACIONALIDADE');
      };
    });
    return query.join(`${andSQL}`);
  }
  return null; 
};

module.exports = {
  async index(req, res) {
    try {
      const { rangeYears, iesFilters, collegeFilters, studentFilters } = req.body.data;

      if (rangeYears.length > 1) {
        const iesOptions = iesFilterQuery(iesFilters);
        const studentOptions = studentFilterQuery(studentFilters);
        
        const response = await Promise.map(
          rangeYears,
          async (year) => {
            const whereFilters = [];
            const collegeOptions = collegeFilterQuery(collegeFilters, year);

            whereFilters.push(iesOptions, collegeOptions, studentOptions);
            const whereFiltersNotNull = whereFilters.filter(filters => filters !== null).join(' AND ');
            
            const data = await executeQuery(year, whereFiltersNotNull);
            const payload = {
              year,
              finalCount: data.rows[0]
            }
            return payload;
          },
          {concurrency: 2}
        );
        return res.json(response);
      } 
      else {
        console.log("UM ANO");
        const iesOptions = iesFilterQuery(iesFilters);
        // const collegeOptions = iesFilterQuery(collegeFilters);
        // const studentOptions = iesFilterQuery(studentFilters);

        // console.log("iesOptions", iesOptions);
        // console.log("collegeOptions", collegeOptions);
        // console.log("studentOptions", studentOptions);
        
        // const whereFilters = `${iesOptions} ${collegeOptions} ${studentOptions}`;
        // console.log('iesOptions', iesOptions);
        const data = await executeQuery(rangeYears[0], iesOptions);
        
        const payload = {
          year: rangeYears[0],
          finalCount: data.rows[0]
        }

        return res.json(payload);
      }
    } catch (error) {
      return res.json(error);
    }
  },
};
