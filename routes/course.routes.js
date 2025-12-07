import { Router } from "express";
import { addLectureToCourseById, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, removeLectureFromCourseById, updateCourse, } from "../controllers/course.controller.js";
import { authorizedRoles, authorizedSubscriber, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const courseRouter = Router();

courseRouter.route('/')
    .get(getAllCourses)
    .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('thumbnail'), createCourse);

courseRouter.route('/:id')
    .get(isLoggedIn, authorizedSubscriber, getLecturesByCourseId)
    .put(isLoggedIn, authorizedRoles('ADMIN'), updateCourse)
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeCourse)
    .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('lecture'), addLectureToCourseById);

courseRouter.route('/:courseId/lectures/:lectureId')
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeLectureFromCourseById);

export default courseRouter;