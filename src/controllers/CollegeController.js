const dbConnection = require('../database/connection');
const Promise = require('bluebird');

function orderByNameAndAddValue(listObjects) {
  listObjects.sort((first, second) => {
    if (first.label > second.label) {
      return 1;
    }
    if (first.label < second.label) {
      return -1;
    }
    return 0;
  });

  return listObjects.map((option, index) => {
    option.value = index + 1;
    return option;
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
      const filters = [];
      try {
        const degreeLevelQuery =
          `select 
            id as value, 
            descricao as label 
          from grau_academico;`;
        const degreeLevel = {};
        const { rows } = await genericQuery(degreeLevelQuery);

        degreeLevel.value = 1;
        degreeLevel.label = "Gráu Acadêmico";
        degreeLevel.type = "select";
        degreeLevel.options = rows;
        filters.push(degreeLevel);
      } catch (error) {
        return res.json(error);
      }

      try {
        const shiftQuery =
          `select 
            id as value, 
            descricao as label 
          from turno;`;
        const shift = {};
        const { rows } = await genericQuery(shiftQuery);

        shift.value = 2;
        shift.label = "Turno";
        shift.type = "select";
        shift.options = rows;
        filters.push(shift);
      } catch (error) {
        return res.json(error);
      }

      try {
        const academicLevelQuery =
          `select 
            id as value, 
            descricao as label 
          from nivel_academico;`;
        const academicLevel = {};
        const { rows } = await genericQuery(academicLevelQuery);

        academicLevel.value = 3;
        academicLevel.label = "Nível Acadêmico";
        academicLevel.type = "select";
        academicLevel.options = rows;
        filters.push(academicLevel);
      } catch (error) {
        return res.json(error);
      }

      try {
        const teachingModalityQuery =
          `select 
            id as value, 
            descricao as label 
          from modalidade_ensino;`;
        const teachingModality = {};
        const { rows } = await genericQuery(teachingModalityQuery);

        teachingModality.value = 4;
        teachingModality.label = "Modalidade de Ensino";
        teachingModality.type = "select";
        teachingModality.options = rows;
        filters.push(teachingModality);
      } catch (error) {
        return res.json(error);
      }

      return res.json(filters);
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
      collegeOptions.options = orderByNameAndAddValue(removedDuplicatedNames);

      filters.push(collegeOptions);
      return res.json(filters);
    } catch (error) {
      return res.json(error);
    }
  }
};