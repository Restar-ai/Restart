import express from "express";
import * as courseController from "../controllers/courseController.js";

const router = express.Router();

router.get("/courses", courseController.getAllCourses);
router.get("/courses/:id", courseController.getCourseById);
router.get("/users/:userId/courses", courseController.getUserCourses);
router.post("/enroll", courseController.enrollCourse);
router.put("/progress", courseController.updateCourseProgress);
router.get("/users/:userId/stats", courseController.getDashboardStats);
router.get("/trainer/dashboard", courseController.getTrainerDashboard);

export default router;
