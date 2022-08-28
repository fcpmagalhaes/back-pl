module.exports = function studentStaticFilters() {
  return [
    {value: 3, label: 'Idade', type: 'input'},
    { value: 6, label: 'Ingresso Por Vestibular', type: 'check'},
    { value: 7, label: 'Ingresso Por ENEM', type: 'check'},
    { value: 8, label: 'Ingresso Por Avaliação Seriada', type: 'check'},
    { value: 9, label: 'Ingresso Por Seleção Simplificada', type: 'check'},
    { value: 10, label: 'Ingresso Por Outro Tipo de Seleção', type: 'check'},
    { value: 11, label: 'Ingresso Por Vaga Remanescente', type: 'check'},
    { value: 12, label: 'Ingresso Por Vaga Programa Especial', type: 'check'},
    { value: 13, label: 'Ingresso Por Transf Exofficio', type: 'check'},
    { value: 14, label: 'Ingresso Por Decisão Judicial', type: 'check'},
    { value: 15, label: 'Ingresso Por Convênio PECG', type: 'check'},
    { value: 16, label: 'Ingresso Por Egresso', type: 'check'},
    { value: 17, label: 'Ingresso Por Outra Forma', type: 'check'},
    { value: 18, label: 'Ingresso Por Reserva Vagas', type: 'check'},
    { value: 19, label: 'Ingresso Por Reserva Etnico', type: 'check'},
    { value: 20, label: 'Ingresso Por Reserva Deficiência', type: 'check'},
    { value: 21, label: 'Ingresso Por Reserva Ens Público', type: 'check'},
    { value: 22, label: 'Ingresso Por Reserva Renda Familiar', type: 'check'},
    { value: 23, label: 'Ingresso Por Reserva Outra', type: 'check'},
    { value: 24, label: 'Utiliza Financiamento Estudantil', type: 'check'},
    { value: 25, label: 'Recebe Apoio Social', type: 'check'},
    { value: 26, label: 'Participa de Atividade Extracurricular', type: 'check'}
  ];
};

module.exports = function studentSelectorFilters() {
  return  [
    { table: 'cor_raca', valueNumber: 1, label: "Cor Raça", type: "select" },
    { table: 'sexo', valueNumber: 2, label: "Sexo", type: "select" },
    { table: 'situacao_vinculo', valueNumber: 4, label: "Tipo de Situação", type: "select" },
    { table: 'possui_deficiencia', valueNumber: 5, label: "Possui Deficiência", type: "select" },
    { table: 'escola_conclusao_ensino_medio', valueNumber: 27, label: "Tipo Escola Conclusão Ens. Médio", type: "select" },
    { table: 'semestre_conclusao', valueNumber: 28, label: "Semestre de Conclusão", type: "select" },
    { table: 'mobilidade_academica', valueNumber: 29, label: "Mobilidade Acadêmica", type: "select" },
    { table: 'nacionalidade', valueNumber: 30, label: "Nacionalidade", type: "select" },
  ];
};