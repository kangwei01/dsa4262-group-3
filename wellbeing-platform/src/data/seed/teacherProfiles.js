export const seedTeacherProfiles = [
  {
    id: 'teacher_1',
    name: 'Ms Tan',
    teacher_identifier: 'wellbeing@school.edu',
    teacher_passcode: 'teacher1234',
    role: 'teacher',
    school_name: 'MindBridge Secondary',
    can_view_all_students: false,
  },
  {
    id: 'teacher_2',
    name: 'School Counsellor',
    teacher_identifier: 'counsellor@school.edu',
    teacher_passcode: 'counsellor1234',
    role: 'counsellor',
    school_name: 'MindBridge Secondary',
    can_view_all_students: true,
  },
];

export const teacherProfileByIdentifier = Object.fromEntries(
  seedTeacherProfiles.map((teacher) => [teacher.teacher_identifier, teacher]),
);
