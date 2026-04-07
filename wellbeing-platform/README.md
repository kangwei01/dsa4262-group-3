# Student Wellbeing Platform

This folder contains the frontend application for the student wellbeing intervention workflow built from the `benrfv3` model outputs.

## What Is Included

- student weekly check-in flow
- one-time onboarding questions for profile variables
- student feedback page with support-focused guidance
- teacher dashboard with current risk, weekly trends, intervention actions, and batch survey opening
- teacher login, follow-up queue, counsellor handoff queue, and parent communication outbox
- question dashboard that maps the current selected `benrfv3` features into the app question bank
- backend entity definitions for `StudentProfile`, `StudentCheckIn`, `TeacherAction`, `CounsellorCase`, and `ParentCommunication`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create an environment file with the app details:

```bash
VITE_APP_ID=your_app_id
VITE_APP_BASE_URL=your_backend_url
```

3. Start the dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Project Notes

- Shared question, scoring, and support logic lives in `src/lib/rfModel.js`.
- Backend reads and writes are centralized in `src/services/wellbeingService.js`.
- Student identity tracking uses `student_identifier` so one-time answers are stored per student.
- Teacher access is protected by a prototype teacher sign-in layer that scopes the dashboard and queues to the signed-in teacher account.
- Grouped HBSC variables use summarized umbrella phrasing in the UI, while the dashboard still shows which raw HBSC items were combined.
