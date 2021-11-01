const express = require("express");
const { celebrate, Segments, Joi } = require("celebrate");
const StudentController = require("./controllers/StudentController");
const IesController = require("./controllers/IesController");

const routes = express.Router();

routes.get("/search", StudentController.index);
routes.post("/ies_names", IesController.index);

module.exports = routes;
