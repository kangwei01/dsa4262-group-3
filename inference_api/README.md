## Inference API

FastAPI server that serves predictions from the trained Random Forest model.

### Prerequisites

Run `rebuilt.ipynb` from the project root first. It will export:
- `rf_model.pkl` — trained sklearn pipeline
- `rf_config.json` — feature list, importances, and score thresholds

### Setup

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Endpoints
GET /health — returns `{"status": "ok"}`
POST /predict — accepts `{"feature_name": value, ...}`, returns predicted class, probabilities, risk score, and SHAP drivers

Notes
rf_model.pkl is excluded from git (`.gitignore` covers `*.pkl`). You must generate it locally.
The server must be running at `localhost:8000` for the frontend to use live model predictions.
If the server is not running, the frontend falls back to local heuristic scoring automatically.
