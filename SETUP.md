# Quick Setup

## Step 1 — Clone the repo and pull the model

```bash
brew install git-lfs
git lfs install
git clone https://github.com/kangwei01/dsa4262-group-3.git
cd dsa4262-group-3
git lfs pull
```

This downloads the exported model file `inference_api/rf_model.pkl`, which is tracked with Git LFS.

## Step 2 — Start the inference API

```bash
cd inference_api
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
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
If you already cloned the repo before Git LFS was set up, run `git lfs install && git lfs pull` from the repo root to download the model file.
Run `rebuilt.ipynb` only if you want to retrain the model and regenerate `rf_model.pkl` and `rf_config.json`.
Python 3.11 is required for the inference API. Using Python 3.14 may trigger SciPy / scikit-learn build failures.
