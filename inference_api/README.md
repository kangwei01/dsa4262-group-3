## Inference API

FastAPI server that serves predictions from the trained Random Forest model.

### Prerequisites

Make sure the repository has been cloned with Git LFS enabled so the model file is available locally:

```bash
brew install git-lfs
git lfs install
git lfs pull
```

`rf_model.pkl` is tracked through Git LFS. Run `full_analysis_pipeline.ipynb` only if you want to retrain the model and regenerate:
- `rf_model.pkl` — trained sklearn pipeline
- `rf_config.json` — feature list, importances, and score thresholds

### Python Version

Use **Python 3.11** for this API. This is required for reliable installation of `scipy`, `scikit-learn`, and related dependencies. Newer versions such as Python 3.14 may fail by trying to build SciPy from source.

### Setup

```bash
/opt/homebrew/bin/python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Endpoints
GET /health — returns `{"status": "ok"}`
POST /predict — accepts `{"feature_name": value, ...}`, returns predicted class, probabilities, risk score, and SHAP drivers

Notes
rf_model.pkl is included through Git LFS. If the file is missing, run `git lfs pull` from the repository root.
The server must be running at `localhost:8000` for the frontend to use live model predictions.
If the server is not running, the frontend falls back to local heuristic scoring automatically.
