# MindBridge — Early Support System
### Prototype Walkthrough

> MindBridge is an early mental health detection tool for secondary school teachers. This document walks through the prototype screens. For full design rationale and model details, refer to the project report.

---

## Table of Contents

1. [Student Flow](#student-flow)
2. [Teacher Flow](#teacher-flow)
3. [Teacher Actions](#teacher-actions)
4. [Prototype Credentials](#prototype-credentials)

---

## Student Flow

### Sign In

![Student Sign In](docs/screenshots/Student_Sign_in_Page.png)

Students sign in with their school email and a personal wellbeing passcode.

For the student demo flow, use a student identifier in the name@school.edu format, for example priyas@school.edu. The student question page only appears after a teacher has opened a survey window, so turn on the weekly pulse or monthly check-in from the teacher dashboard before testing the student view.

---

### Onboarding & Consent

![Onboarding and Consent](docs/screenshots/Onboarding_and_Consent.png)

First-time students are shown what the check-in is for and how their answers will be used before proceeding.

---

### Weekly Check-In Questions

![Weekly Question](docs/screenshots/Example_of_Weekly_Question.png)

Students answer 5 short questions about the past 7 days covering physical and emotional wellbeing.

---

### Monthly Questions

![Monthly Question](docs/screenshots/Example_of_Monthly_Question.png)

Slower-changing baseline questions are asked once a month or on first check-in.

---

### Free Text Note

![Free Text](docs/screenshots/Free_Text.png)

Students can optionally share anything else they want their teacher to know before submitting.

---

### Post-Submission Screen

![Student Support Page](docs/screenshots/Student_Support_Page.png)

After submitting, students receive personalised wellbeing tips and links to local support resources.

---

## Teacher Flow

### Sign In

![Teacher Sign In](docs/screenshots/Teacher_Sign_in_Page.png)

Teachers sign in via a separate screen using their school email and teacher passcode.

---

### Dashboard

![Teacher Dashboard](docs/screenshots/Teacher_Dashboard.png)

The dashboard surfaces students needing review, with risk scores, trend sparklines, support bands, and recommended next steps.

---

### Student Detail Page

![Student Detail Page](docs/screenshots/Student_Detail_Page.png)

Each student has a detailed view showing their predicted risk score, model confidence, driving factors, weekly trend, and an action panel.

---

### Action Panel — Check In / Monitor

![Next Action Check In Monitor](docs/screenshots/Next_Action_Check_in_Monitor.png)

When a student has been in the monitoring band for 3 consecutive weeks, the system recommends a private check-in.

---

### Action Panel — Continue Routine Support

![Next Action Continue Routine Support](docs/screenshots/Next_Action_Continue_Routine_Support_Routine.png)

When a student is below the monitoring threshold, the system recommends continuing routine support with no immediate action required.

---

## Teacher Actions

### Check In Privately

![Check In and Outcome Log](docs/screenshots/Check_In_and_Outcome_Log_Page.png)

A suggested check-in script is generated for the teacher. The teacher logs the outcome and sets a follow-up date after the conversation.

---

### Contact Parents

![Contacting Parents](docs/screenshots/Contacting_Parents.png)

A draft parent message is generated for the teacher to review, edit, and send.

---

### Escalate to Counsellor

![Escalate to Counsellor](docs/screenshots/Escalation_to_counsellor.png)

The teacher reviews an auto-generated student summary and confirms before sharing it with the school counsellor.

---

## Prototype Credentials

| Role | Email | Passcode |
|---|---|---|
| Teacher | `wellbeing@school.edu` | `teacher1234` |
| Counsellor | `counsellor@school.edu` | `counsellor1234` |

---

*MindBridge — Early Support System · Prototype v1*
