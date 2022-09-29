const express = require("express");
const { celebrate, Segments, Joi } = require("celebrate");
const StudentController = require("./controllers/StudentController");
const IesController = require("./controllers/IesController");
const CollegeController = require("./controllers/CollegeController");
const ResearchController = require("./controllers/ResearchController");

const routes = express.Router();

routes.post("/research", ResearchController.index);
routes.post("/ies_names", IesController.iesNames);
routes.post("/college_names", CollegeController.collegeNames);

routes.post("/ies_filters", IesController.index);
routes.post("/college_filters", CollegeController.index);
routes.post("/student_filters", StudentController.index);

module.exports = routes;
