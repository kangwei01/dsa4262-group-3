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

![Student Sign In](screenshots/Student%20Sign%20in%20Page.png)

Students sign in with their school email and a personal wellbeing passcode.

For the student demo flow, use a student identifier in the name@school.edu format, for example priyas@school.edu. The student question page only appears after a teacher has opened a survey window, so turn on the weekly pulse or monthly check-in from the teacher dashboard before testing the student view.

---

### Onboarding & Consent

![Onboarding and Consent](screenshots/Onboarding%20and%20Consent.png)

First-time students are shown what the check-in is for and how their answers will be used before proceeding.

---

### Weekly Check-In Questions

![Weekly Question](screenshots/Example%20of%20Weekly%20Question.png)

Students answer 5 short questions about the past 7 days covering physical and emotional wellbeing.

---

### Monthly Questions

![Monthly Question](screenshots/Example%20of%20Monthly%20Question.png)

Slower-changing baseline questions are asked once a month or on first check-in.

---

### Free Text Note

![Free Text](screenshots/Free%20Text.png)

Students can optionally share anything else they want their teacher to know before submitting.

---

### Post-Submission Screen

![Student Support Page](screenshots/Student%20Support%20Page.png)

After submitting, students receive personalised wellbeing tips and links to local support resources.

---

## Teacher Flow

### Sign In

![Teacher Sign In](screenshots/Teacher%20Sign%20in%20Page.png)

Teachers sign in via a separate screen using their school email and teacher passcode.

---

### Dashboard

![Teacher Dashboard](screenshots/Teacher%20Dashboard.png)

The dashboard surfaces students needing review, with risk scores, trend sparklines, support bands, and recommended next steps.

---

### Student Detail Page

![Student Detail Page](screenshots/Student%20Detail%20Page.png)

Each student has a detailed view showing their predicted risk score, model confidence, driving factors, weekly trend, and an action panel.

---

### Action Panel — Check In / Monitor

![Next Action Check In Monitor](screenshots/Next%20Action%20Check%20in%20Monitor.png)

When a student has been in the monitoring band for 3 consecutive weeks, the system recommends a private check-in.

---

### Action Panel — Continue Routine Support

![Next Action Continue Routine Support](screenshots/Next%20Action%20Continue%20Routine%20Support%20Routine.png)

When a student is below the monitoring threshold, the system recommends continuing routine support with no immediate action required.

---

## Teacher Actions

### Check In Privately

![Check In and Outcome Log](screenshots/Check%20In%20and%20Outcome%20Log%20Page.png)

A suggested check-in script is generated for the teacher. The teacher logs the outcome and sets a follow-up date after the conversation.

---

### Contact Parents

![Contacting Parents](screenshots/Contacting%20Parents.png)

A draft parent message is generated for the teacher to review, edit, and send.

---

### Escalate to Counsellor

![Escalate to Counsellor](screenshots/Escalation%20to%20counsellor.png)

The teacher reviews an auto-generated student summary and confirms before sharing it with the school counsellor.

---

## Prototype Credentials

| Role | Email | Passcode |
|---|---|---|
| Teacher | `wellbeing@school.edu` | `teacher1234` |
| Counsellor | `counsellor@school.edu` | `counsellor1234` |

---

*MindBridge — Early Support System · Prototype v1*
