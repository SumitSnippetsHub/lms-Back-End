import { Router } from "express";
import { getAllCourses, getLecturesByCourseId } from "../controllers/course.controller.js";

const courseRouter = Router();

courseRouter.route('/')
    .get(getAllCourses);

courseRouter.route('/:id')
    .get(getLecturesByCourseId);

export default courseRouter;