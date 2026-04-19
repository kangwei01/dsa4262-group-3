# Quick Setup

## Step 1 — Generate the model

Open and run `rebuilt.ipynb` in Jupyter. This exports `rf_model.pkl` and `rf_config.json` into `inference_api/`.

Requirements: Python 3.10+, the packages used in the notebook, and the HBSC data in `HBSC_data/`.

## Step 2 — Start the inference API

```bash
cd inference_api
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Confirm it is running: open `http://localhost:8000/health` — should return `{"status":"ok"}`.

## Step 3 — Start the frontend

```bash
cd wellbeing-platform
cp .env.example .env   # leave values as-is for demo mode
npm install
npm run dev
```

Open `http://localhost:5173`.

## Notes

If the inference API is not running, the frontend falls back to local heuristic scoring automatically — the app still works.
In demo mode (`VITE_APP_ID=your_app_id`), authentication is bypassed and seed data is used.
`rf_model.pkl` is excluded from git (122 MB). You must generate it from the notebook.
