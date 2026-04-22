# DSA4262 Group 3 — Student Wellbeing Modelling & Intervention Prototype

![Python](https://img.shields.io/badge/Python-3.11-required-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688) ![License](https://img.shields.io/badge/course-DSA4262-orange)

## Overview

This project builds a machine learning pipeline to predict student mental health risk using the HBSC 2018 dataset, and connects it to a functional web-based wellbeing platform for schools. The platform supports student check-ins, teacher monitoring, and personalised support recommendations.

The system uses a trained Random Forest classifier (3-class: Routine / Monitor / Flagged) to produce a predicted risk score. Student responses from the platform are sent to a local FastAPI inference server, which returns a risk score, class probabilities, and SHAP-derived feature drivers. These drive the teacher dashboard and student support cards.

---

## Repository Structure

```text
dsa4262-group-3/
├── full_analysis_pipeline.ipynb      # Canonical ML notebook — data processing, model training, export
├── inference_api/                   # FastAPI backend serving model predictions
│   ├── app.py                      # /predict and /health endpoints
│   ├── rf_config.json              # Model features, importances, and score thresholds
│   ├── requirements.txt            # Python dependencies
│   └── rf_model.pkl                # Trained model tracked via Git LFS
├── wellbeing-platform/             # React/Vite frontend prototype
│   ├── src/
│   │   ├── pages/                  # Student check-in, feedback, and teacher dashboard views
│   │   ├── lib/rfModel.js          # Feature definitions, question bank, support card library
│   │   └── services/               # Inference API integration and local fallback scoring
│   └── package.json
├── HBSC_data/                      # HBSC dataset, documentation, and feature engineering references
│   ├── HBSC2018OAed1.1.csv         # Raw HBSC 2018 dataset
│   ├── HBSC_2018_Codebook.pdf      # Official variable definitions and survey documentation
│   ├── feature_question_mapping.xlsx   # Final selected features, question mapping, and collection frequency
│   └── hbsc_variable_groupings.xlsx    # Variable grouping definitions and aggregation logic
└── README.md
```

---

## ML Notebook — `full_analysis_pipeline.ipynb`

This notebook implements the full model-development workflow, from raw HBSC survey data to a deployable distress-risk classifier.

**What it does end-to-end**
1. Loads and cleans HBSC 2018 data
   - Reads `HBSC_data/HBSC2018OAed1.1.csv` (semicolon-separated).
   - Standardizes common missing-value tokens (e.g., "NA", "...", blank strings).
   - Cleans and type-coerces key structural fields (e.g., age/sex/country-related columns).
2. Builds the distress target
   - Constructs a distress score from psychosomatic items (`feellow`, `irritable`, `nervous`, `lifesat`).
   - Reverses scales where needed so direction is consistent.
   - Produces a normalized continuous target (`distress_score_100`, higher = worse distress).
   - Validates internal consistency with Cronbach’s alpha.
3. Performs EDA (raw + target)
   - Country-level, age-level, and feature-level distribution checks.
   - Distress distribution/ranking views.
   - Correlation-based signal checks for potential predictors.
4. Runs workbook-driven feature engineering
   - Reads feature definitions from `HBSC_data/hbsc_variable_groupings.xlsx`.
   - Applies aggregation rules (e.g., grouped means, max/min logic, binary OR, breakfast sum-adjustment).
   - Uses complete-case logic within grouped inputs.
   - Produces:
      - engineered feature matrix
      - feature manifest/metadata
   - Keeps non-omitted model features from the plan (56 engineered features before model selection).
5. Creates 3-class classification target
   - Converts continuous distress score into classes using quantile thresholds:
     - low: below 75th percentile
     - medium: 75th–85th percentile
     - high: above 85th percentile
   - In current notebook outputs, cutoffs are approximately 50.00 and 62.50.
6. Trains and tunes Random Forest
   - Pipeline: `SimpleImputer(strategy="median")` + `RandomForestClassifier`.
   - Light grid search with stratified CV, optimizing recall of the high-risk class.
   - Notebook output reports best RF hyperparameters and CV high-risk recall.
7. Runs repeated out-of-sample evaluation
   - Repeated train/test splits with stratification by age-band + sex (+ class-aware balancing).
   - Computes pooled metrics: accuracy, macro/weighted F1, class-wise precision/recall/F1, kappa, confusion matrix.
   - Ranks features by RF importance and compares:
     - 80% cumulative-importance set
     - 90% cumulative-importance set
   - Selects final deployment set from 80% coverage (21 features).
8. Builds deployment inference/explanation flow
   - Fits final RF on the full labeled sample with selected features.
   - Generates class probabilities and confidence fields.
   - Uses SHAP TreeExplainer for per-student explanations (focused on high-risk contribution).
   - Applies rule-based “unfavourable response” logic for recommendation triggers.
   - Includes error analysis and a playground section for manual scenario simulation.

**For day-to-day use, you do not need to run the notebook first.** The exported model file is already included in the repository through Git LFS. Run `full_analysis_pipeline.ipynb` only if you want to retrain or regenerate the model artifacts.

---

## Inference API — `inference_api/`

A FastAPI server that loads the trained model and serves predictions.

**Endpoints:**
- `GET /health` — health check
- `POST /predict` — accepts a JSON object of student feature values, returns predicted class, class probabilities, predicted risk score, and top SHAP feature drivers

**Predicted Risk Score formula:**
```text
risk_score = (0 × P(Routine) + 0.5 × P(Monitor) + 1.0 × P(Flagged)) × 100
```
This is a heuristic proxy for relative risk, not a clinically validated scale.

**Setup:**
```bash
cd inference_api
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
Note:
1. If the `python` command is not recognised, use `python3` instead.

2. Requires `rf_model.pkl` to be present locally. If you cloned the repository normally, run `git lfs pull` once after cloning to download the model file.

3. **Python 3.11 is required for the inference API.** Newer versions such as Python 3.14 may fail when installing `scipy` / `scikit-learn` dependencies.

---

## Frontend Platform — `wellbeing-platform/`

A React/Vite web app demonstrating the full student–teacher workflow.

**Student view:** Weekly and monthly check-in survey → personalised support cards on submission.

**Teacher view:** Dashboard with predicted risk scores, trend sparklines, SHAP-driven key factors, and escalation tools.

**Setup:**
```bash
cd wellbeing-platform
npm install
```

Create a `.env` file in `wellbeing-platform/`:
```text
VITE_APP_ID=your_app_id
VITE_APP_BASE_URL=your_backend_url
VITE_FUNCTIONS_VERSION=prod
```

Then run:
```bash
npm run dev
```
Note:
1. The app runs at `http://localhost:5173`.

2. For the student demo flow, use a student identifier in the `name@school.edu` format, for example `lebronj@school.edu`.
   The student question page only appears after a teacher has opened a survey window, so turn on the weekly pulse or monthly check-in from the teacher
   dashboard before testing the student view.

---

## Demo Credentials

Use the following seeded credentials for the prototype submission.

### Staff Accounts

| Role | Login ID | Passcode |
|---|---|---|
| Teacher | `wellbeing@school.edu` | `teacher1234` |
| Counsellor | `counsellor@school.edu` | `counsellor1234` |

### Student Demo Accounts

| Student | Login ID | Passcode |
|---|---|---|
| Priya S. | `priyas@school.edu` | `priya1234` |
| Ethan K. | `ethank@school.edu` | `ethan1234` |
| Kobe Bryant | `kobeb@school.edu` | `kobe1234` |
| LeBron James | `lebronj@school.edu` | `lebron1234` |
| Zoe A. | `zoea@school.edu` | `zoe1234` |

To test a student account, first sign in as the teacher and open either the weekly pulse or monthly check-in from the dashboard. Students will only see the survey after a teacher has opened it.

---

## Running the Full Stack Locally

### 1. Clone and download the model file

```bash
brew install git-lfs        # one-time setup on macOS
git lfs install             # one-time setup on your machine
git clone https://github.com/kangwei01/dsa4262-group-3.git
cd dsa4262-group-3
git lfs pull
```

If you already cloned the repository earlier, run only:

```bash
git lfs install
git lfs pull
```

### 2. Start the backend and frontend

```bash
# Terminal 1 — ML inference server
cd inference_api
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn app:app --reload --port 8000

# Terminal 2 — Frontend
cd wellbeing-platform
npm run dev
```
Note:
1. If the `python` command is not recognised, use `python3` instead.

2. Navigate to `http://localhost:5173`. The student check-in flow will call `localhost:8000/predict` on submission.

3. When testing the prototype:
- Use student identifiers in the `name@school.edu` format, for example `lebronj@school.edu`.
- The teacher must turn on either the weekly pulse or the monthly check-in before students can see and submit the survey questions.

---

## Demo Mode

When `VITE_APP_ID` is set to `your_app_id` (the default), the app runs in **demo mode**:
- Authentication is bypassed; a mock student session is used
- Student profile data is loaded from local seed data
- The inference API is still called if running; otherwise the app falls back to local heuristic scoring
- The prototype is designed around **one check-in per student per day**. If the same student submits again 5 to 10 minutes later on the same day, the app treats it as the same daily snapshot rather than a second independent record
- All UI features remain functional for demonstration purposes

---

## Limitations

- `rf_model.pkl` is included through Git LFS. Anyone cloning the repository must have Git LFS installed and run `git lfs pull` so the actual model file is downloaded locally.
- The platform's auth and data persistence layer (Base44) requires a live backend for production use. In local demo mode, data is stored in browser `localStorage` only and does not persist across devices.
- Repeated same-day submissions for the same student are not a supported analysis use case in demo mode. The latest submission is intended to replace that day's snapshot rather than create multiple trend points.
- The predicted risk score is a research prototype and has not been clinically validated.
- Python 3.11 is required for the inference API environment. Node.js 18+ is recommended for the frontend.

---

## Screenshots

> See [`docs/Prototype Walkthrough.md`](docs/Prototype%20Walkthrough.md) for the screenshot-based walkthrough of the prototype.

---

## Dependencies

**Python (inference API):** fastapi, uvicorn, scikit-learn, shap, numpy, pandas

**Node (frontend):** React 18, Vite, Tailwind CSS, Radix UI, TanStack Query, React Router, Framer Motion
