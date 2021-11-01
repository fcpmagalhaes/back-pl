const dbConnection = require("../database/connection");

module.exports = {
  async index(req, res) {
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
