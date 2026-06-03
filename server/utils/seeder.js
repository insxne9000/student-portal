import mongoose from 'mongoose';
import Dashboard from '../models/Dashboard.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';

const defaultDashboard = {
  welcome: { name: "Ahmed Adewole", matricNo: "2022/502", level: "Level 400", programme: "Computer Science", admissionType: "UTME", profileImage: "/assets/profile.jpg" },
  complaints: { total: 4, pending: 2, resolved: 1 },
  registration: { session: "2025/26", status: "Approved", unitsRegistered: 21, maxUnits: 24 },
  clearance: { completed: 4, total: 6, items: [ { label: "Library", status: "Done" }, { label: "Bursary", status: "Pending" }, { label: "HOD", status: "Pending" } ] },
  semester: { label: "2nd", stage: "400L", week: 4, totalWeeks: 12, examStarts: "May 12" },
  documents: { total: 2, items: [ { label: "Transcript", status: "Processing" }, { label: "Intro letter", status: "Ready" } ] },
  disciplinary: { status: "Clean", warnings: 0, suspensionHistory: "None", standing: "Good standing" },
};

const defaultCourses = [
  // 100 Level - 1st Semester
  { courseCode: "CSC 101", title: "Introduction to Computer Science", credits: 3, level: 100, semester: 1, remarks: "Core" },
  { courseCode: "MTH 101", title: "General Mathematics I (Algebra & Trigonometry)", credits: 3, level: 100, semester: 1, remarks: "Core" },
  { courseCode: "PHY 101", title: "General Physics I (Mechanics & Properties of Matter)", credits: 3, level: 100, semester: 1, remarks: "Core" },
  { courseCode: "PHY 107", title: "General Physics Laboratory I", credits: 1, level: 100, semester: 1, remarks: "Core" },
  { courseCode: "GST 111", title: "Communication in English I", credits: 2, level: 100, semester: 1, remarks: "Compulsory" },
  { courseCode: "GST 113", title: "Nigerian Peoples and Culture", credits: 2, level: 100, semester: 1, remarks: "Compulsory" },
  { courseCode: "GST 121", title: "Use of Library, Study Skills & ICT", credits: 2, level: 100, semester: 1, remarks: "Compulsory" },

  // 100 Level - 2nd Semester
  { courseCode: "CSC 102", title: "Introduction to Problem Solving", credits: 3, level: 100, semester: 2, remarks: "Core" },
  { courseCode: "MTH 102", title: "General Mathematics II (Calculus)", credits: 3, level: 100, semester: 2, remarks: "Core" },
  { courseCode: "PHY 102", title: "General Physics II (Electricity & Magnetism)", credits: 3, level: 100, semester: 2, remarks: "Core" },
  { courseCode: "PHY 108", title: "General Physics Laboratory II", credits: 1, level: 100, semester: 2, remarks: "Core" },
  { courseCode: "GST 112", title: "Communication in English II", credits: 2, level: 100, semester: 2, remarks: "Compulsory" },
  { courseCode: "GST 114", title: "Logic, Philosophy and Human Existence", credits: 2, level: 100, semester: 2, remarks: "Compulsory" },
  { courseCode: "EPS 201", title: "Entrepreneurship Studies I", credits: 2, level: 100, semester: 2, remarks: "Compulsory" },

  // 200 Level - 1st Semester
  { courseCode: "CSC 201", title: "Computer Programming I", credits: 3, level: 200, semester: 1, remarks: "Core" },
  { courseCode: "CSC 203", title: "Discrete Structures", credits: 3, level: 200, semester: 1, remarks: "Core" },
  { courseCode: "CSC 205", title: "Operating Systems I", credits: 3, level: 200, semester: 1, remarks: "Core" },
  { courseCode: "MTH 201", title: "Mathematical Methods I", credits: 3, level: 200, semester: 1, remarks: "Cognate" },
  { courseCode: "GST 211", title: "History and Philosophy of Science", credits: 2, level: 200, semester: 1, remarks: "Compulsory" },
  { courseCode: "EPS 202", title: "Entrepreneurship Studies II", credits: 2, level: 200, semester: 1, remarks: "Compulsory" },

  // 200 Level - 2nd Semester
  { courseCode: "CSC 202", title: "Computer Programming II", credits: 3, level: 200, semester: 2, remarks: "Core" },
  { courseCode: "CSC 204", title: "Fundamentals of Data Structures", credits: 3, level: 200, semester: 2, remarks: "Core" },
  { courseCode: "CSC 206", title: "Computer Hardware", credits: 3, level: 200, semester: 2, remarks: "Core" },
  { courseCode: "CSC 208", title: "Foundations of Sequential Programming", credits: 3, level: 200, semester: 2, remarks: "Core" },
  { courseCode: "CSC 212", title: "Computer Architecture & Organization I", credits: 3, level: 200, semester: 2, remarks: "Core" },
  { courseCode: "STA 202", title: "Statistics for Physical Sciences and Engineering", credits: 3, level: 200, semester: 2, remarks: "Cognate" },

  // 300 Level - 1st Semester
  { courseCode: "CSC 301", title: "Structured Programming", credits: 3, level: 300, semester: 1, remarks: "Core" },
  { courseCode: "CSC 303", title: "Object-Oriented Programming", credits: 3, level: 300, semester: 1, remarks: "Core" },
  { courseCode: "CSC 305", title: "Systems Analysis and Design", credits: 3, level: 300, semester: 1, remarks: "Core" },
  { courseCode: "CSC 313", title: "Compiler Construction I", credits: 3, level: 300, semester: 1, remarks: "Core" },
  { courseCode: "CSC 315", title: "Computer Architecture & Organization II", credits: 3, level: 300, semester: 1, remarks: "Core" },
  { courseCode: "CSC 321", title: "Systems Programming", credits: 3, level: 300, semester: 1, remarks: "Core" },
  { courseCode: "CSC 333", title: "Computational Science & Numerical Methods", credits: 3, level: 300, semester: 1, remarks: "Core" },

  // 300 Level - 2nd Semester
  { courseCode: "CSC 399", title: "Student Industrial Work Experience Scheme (SIWES)", credits: 6, level: 300, semester: 2, remarks: "Core" },

  // 400 Level - 1st Semester
  { courseCode: "CSC 401", title: "Organization of Programming Languages", credits: 3, level: 400, semester: 1, remarks: "Core" },
  { courseCode: "CSC 403", title: "Software Engineering", credits: 3, level: 400, semester: 1, remarks: "Core" },
  { courseCode: "CSC 405", title: "Artificial Intelligence", credits: 3, level: 400, semester: 1, remarks: "Core" },
  { courseCode: "CSC 411", title: "Computer Networks/Communications", credits: 3, level: 400, semester: 1, remarks: "Core" },
  { courseCode: "CSC 421", title: "Net-Centric Computing", credits: 3, level: 400, semester: 1, remarks: "Core" },
  { courseCode: "CSC 433", title: "Computer Graphics and Visual Computing", credits: 3, level: 400, semester: 1, remarks: "Elective" },
  { courseCode: "CSC 497", title: "Research Methodology", credits: 2, level: 400, semester: 1, remarks: "Core" },

  // 400 Level - 2nd Semester
  { courseCode: "CSC 499", title: "Final Year Project", credits: 6, level: 400, semester: 2, remarks: "Core" },
  { courseCode: "CSC 404", title: "Data Management Systems", credits: 3, level: 400, semester: 2, remarks: "Core" },
  { courseCode: "CSC 412", title: "Formal Models of Computation", credits: 3, level: 400, semester: 2, remarks: "Core" },
  { courseCode: "CSC 416", title: "IT Project Management", credits: 3, level: 400, semester: 2, remarks: "Core" },
  { courseCode: "CSC 422", title: "Human-Computer Interaction", credits: 2, level: 400, semester: 2, remarks: "Core" },
];

import Grade from '../models/Grade.js';
import Invoice from '../models/Invoice.js';
import Complaint from '../models/Complaint.js';

export const seedDatabase = async () => {
  try {
    // 1. Wipe existing data for clean slate
    await Dashboard.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Grade.deleteMany({});
    await Invoice.deleteMany({});
    await Complaint.deleteMany({});
    console.log("Cleared existing database records");

    // 2. Seed Courses
    await Course.insertMany(defaultCourses);
    console.log("Seeded PCU CCMAS course curriculum");

    // Helper to get course by code
    const getCourse = async (code) => await Course.findOne({ courseCode: code });

    // 3. Define the 3 Mock Students
    const mockStudents = [
      {
        email: 'ahmed@pcu.edu.ng',
        matricNo: '2022/502',
        password: 'password123',
        name: 'Ahmed Adewole',
        batch: '2022',
        degree: 'Computer Science',
        currentSemester: 1, // Year 1, Semester 1
        levelStr: 'Level 100',
        semesterLabel: '1st',
        stage: '100L',
        creditsCompleted: 0,
        creditsRequired: 120,
        admissionType: 'UTME',
        gradesToSeed: [] // We will use a real Enrollment for him instead
      },
      {
        email: 'jane@pcu.edu.ng',
        matricNo: '2023/101',
        password: 'password123',
        name: 'Jane Doe',
        batch: '2023',
        degree: 'Computer Science',
        currentSemester: 4, // Year 2, Semester 2
        levelStr: 'Level 200',
        semesterLabel: '2nd',
        stage: '200L',
        creditsCompleted: 45,
        creditsRequired: 120,
        admissionType: 'Direct Entry',
        gradesToSeed: [
          { code: 'CSC 101', score: 72, passed: true, grade: 'A', attended: 20, total: 20 },
          { code: 'CSC 202', score: undefined, passed: false, attended: 15, total: 20 }
        ]
      },
      {
        email: 'michael@pcu.edu.ng',
        matricNo: '2021/304',
        password: 'password123',
        name: 'Michael Smith',
        batch: '2021',
        degree: 'Computer Science',
        currentSemester: 5, // Year 3, Semester 1
        levelStr: 'Level 300',
        semesterLabel: '1st',
        stage: '300L',
        creditsCompleted: 72,
        creditsRequired: 120,
        admissionType: 'UTME',
        gradesToSeed: [
          { code: 'CSC 201', score: 45, passed: true, grade: 'D', attended: 18, total: 20 },
          { code: 'CSC 301', score: undefined, passed: false, attended: 10, total: 10 }
        ]
      }
    ];

    // 4. Seed Users, Students, Dashboards, and related data
    for (const data of mockStudents) {
      // User
      const user = await User.create({
        email: data.email,
        matricNo: data.matricNo,
        passwordHash: data.password, // storing plaintext for demo purposes
        role: 'student'
      });

      // Student Profile
      const student = await Student.create({
        userId: user._id,
        matricNo: data.matricNo,
        name: data.name,
        batch: data.batch,
        degree: data.degree,
        currentSemester: data.currentSemester,
        creditsCompleted: data.creditsCompleted,
        creditsRequired: data.creditsRequired
      });

      // Dashboard
      await Dashboard.create({
        studentId: student._id,
        welcome: {
          name: data.name,
          matricNo: data.matricNo,
          level: data.levelStr,
          programme: data.degree,
          admissionType: data.admissionType,
          profileImage: "/assets/profile.jpg"
        },
        complaints: { total: 0, pending: 0, resolved: 0 },
        registration: { session: "2025/26", status: "Approved", unitsRegistered: 15, maxUnits: 24 },
        clearance: { completed: 4, total: 6, items: [ { label: "Library", status: "Done" }, { label: "Bursary", status: "Pending" } ] },
        semester: { label: data.semesterLabel, stage: data.stage, week: 4, totalWeeks: 12, examStarts: "May 12" },
        documents: { total: 2, items: [ { label: "Transcript", status: "Processing" } ] },
        disciplinary: { status: "Clean", warnings: 0, suspensionHistory: "None", standing: "Good standing" }
      });

      // Grades
      for (const gData of data.gradesToSeed) {
        const course = await getCourse(gData.code);
        if (course) {
          const semLabel = `Year ${Math.ceil(course.semester / 2)} - ${course.semester % 2 === 0 ? '2nd' : '1st'} Sem`;
          await Grade.create({
            studentId: student._id,
            courseId: course._id,
            semesterLabel: semLabel,
            score: gData.score,
            grade: gData.grade,
            passed: gData.passed,
            classesAttended: gData.attended,
            totalClasses: gData.total
          });
        }
      }

      // Invoice and Enrollment (just for Ahmed as requested to test locking)
      if (data.matricNo === '2022/502') {
        // Fetch all Year 1 Sem 1 courses to mock a genuine student checkout
        const sem1Courses = await Course.find({ level: 100, semester: 1 });
        const courseIds = sem1Courses.map(c => c._id);
        
        const enrollment = await Enrollment.create({
          studentId: student._id,
          semester: 1,
          status: 'locked',
          recommendedCourses: courseIds,
          selectedCourses: courseIds
        });

        await Invoice.create({
          studentId: student._id,
          enrollmentId: enrollment._id, // Genuine link!
          semester: 1, // Year 1, Sem 1
          status: 'pending',
          lineItems: [{ courseCode: "School Fees", amount: 150000 }],
          totalAmountDue: 150000
        });

        // Complaint for Ahmed
        await Complaint.create({
          studentId: student._id,
          ticketId: "TKT-99123",
          title: "Registration Error",
          description: "My courses are not fully displaying.",
          status: "pending"
        });
      }
    }

    console.log("Seeded Multi-User Database successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
