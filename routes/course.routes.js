import { Router } from "express";
import { getAllCourses, getLecturesByCourseId } from "../controllers/course.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const courseRouter = Router();

courseRouter.route('/')
    .get(getAllCourses);

courseRouter.route('/:id')
    .get(isLoggedIn, getLecturesByCourseId);

export default courseRouter;