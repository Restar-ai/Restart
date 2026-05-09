import { api as client } from "./client.js";

export const getAllCourses = async () => {
  try {
    const response = await client.get("/courses");
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await client.get(`/courses/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUserCourses = async (userId) => {
  try {
    const response = await client.get(`/users/${userId}/courses`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const enrollCourse = async (userId, courseId) => {
  try {
    const response = await client.post("/enroll", {
      userId,
      courseId,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCourseProgress = async (
  userId,
  courseId,
  progressPercentage,
) => {
  try {
    const response = await client.put("/progress", {
      userId,
      courseId,
      progressPercentage,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getDashboardStats = async (userId) => {
  try {
    const response = await client.get(`/users/${userId}/stats`);
    return response;
  } catch (error) {
    throw error;
  }
};
