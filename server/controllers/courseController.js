import Course from '../models/Course.js';

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res.json({ courses });
  } catch (error) {
    console.error("Failed to fetch course data:", error);
    res.status(500).json({ message: "Failed to fetch course data" });
  }
};
