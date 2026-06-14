/**
 * Mock course → module → lesson tree used by the "Assign to courses" picker
 * in the assignment setup wizard. Mirrors the structure shown in the designs.
 */

export interface TreeLesson {
  id: string;
  title: string;
}

export interface TreeModule {
  id: string;
  title: string;
  lessons: TreeLesson[];
}

export interface TreeCourse {
  id: string;
  title: string;
  level: string;
  moduleCount: number;
  lessonCount: number;
  studentCount: number;
  modules: TreeModule[];
}

export const courseTree: TreeCourse[] = [
  {
    id: "french-absolute-beginners",
    title: "French For Absolute Beginners",
    level: "A1",
    moduleCount: 8,
    lessonCount: 32,
    studentCount: 20,
    modules: [
      {
        id: "m1",
        title: "Module 1 - Introduction",
        lessons: [
          { id: "m1l1", title: "Lesson 1 - Basic Greetings & Introductions" },
          { id: "m1l2", title: "Lesson 2 - Numbers, Days & Time in French" },
          { id: "m1l3", title: "Lesson 3 - Everyday French Vocabulary" },
          { id: "m1l4", title: "Lesson 4 - Simple Conversations & Common Phrases" },
        ],
      },
      {
        id: "m2",
        title: "Module 2 - Conversational Basics",
        lessons: [
          { id: "m2l1", title: "Lesson 1 - Greetings in Context" },
          { id: "m2l2", title: "Lesson 2 - Asking Questions" },
          { id: "m2l3", title: "Lesson 3 - Talking About Yourself" },
          { id: "m2l4", title: "Lesson 4 - Daily Routines" },
        ],
      },
    ],
  },
  {
    id: "everyday-conversations",
    title: "Everyday Conversations",
    level: "A2",
    moduleCount: 8,
    lessonCount: 32,
    studentCount: 20,
    modules: [
      {
        id: "em1",
        title: "Module 1 - Out & About",
        lessons: [
          { id: "em1l1", title: "Lesson 1 - At the Café" },
          { id: "em1l2", title: "Lesson 2 - Shopping & Markets" },
          { id: "em1l3", title: "Lesson 3 - Directions" },
        ],
      },
      {
        id: "em2",
        title: "Module 2 - Making Plans",
        lessons: [
          { id: "em2l1", title: "Lesson 1 - Invitations" },
          { id: "em2l2", title: "Lesson 2 - Weekend Plans" },
        ],
      },
    ],
  },
];
