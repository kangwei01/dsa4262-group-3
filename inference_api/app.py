import json
import math
import pickle
import warnings
from pathlib import Path

import numpy as np
import shap
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / 'rf_model.pkl', 'rb') as model_file:
    MODEL = pickle.load(model_file)

with open(BASE_DIR / 'rf_config.json', 'r') as config_file:
    CONFIG = json.load(config_file)

FEATURES = CONFIG['features']
MODEL_STEP = MODEL.named_steps.get('model') or MODEL.named_steps.get('rf')
IMPUTER_STEP = MODEL.named_steps['imputer']
MODEL_CLASSES = list(MODEL_STEP.classes_)
HIGH_CLASS_INDEX = MODEL_CLASSES.index('high')
EXPLAINER = shap.TreeExplainer(MODEL_STEP)
FEATURE_LABELS = {
    'grp_aches': 'Physical aches',
    'sleepdificulty': 'Sleep difficulty',
    'health': 'Self-rated health',
    'schoolpressure': 'School pressure',
    'grp_fam_sup': 'Family support',
    'talkfather': 'Talk to father',
    'talkmother': 'Talk to mother',
    'emcsocmed8': 'Social media use',
    'studaccept': 'Peer acceptance',
    'grp_been_bullied': 'Bullying experience',
    'likeschool': 'Liking school',
    'famdec': 'Family decisions',
    'famhelp': 'Family help',
    'grp_teacher': 'Teacher support',
    'thinkbody': 'Body image',
    'grp_bfast': 'Breakfast habits',
    'studhelpful': 'Classmates helpful',
    'age': 'Age',
    'sex': 'Sex',
    'bodyheight': 'Height',
    'bodyweight': 'Weight',
}
FEATURE_ALIASES = {
    'talkfather': ['talkfather', 'grp_talk_father'],
    'talkmother': ['talkmother', 'grp_talk_mother'],
}
EXCLUDED = {'age', 'bodyheight', 'bodyweight', 'sex'}


def resolve_feature_value(payload, feature_name):
    for candidate in FEATURE_ALIASES.get(feature_name, [feature_name]):
        if candidate in payload:
            return payload[candidate]
    return None


def to_numeric_or_nan(value):
    if value in (None, ''):
        return np.nan
    try:
        return float(value)
    except (TypeError, ValueError):
        return np.nan


def get_high_class_shap_values(shap_values):
    if isinstance(shap_values, list):
        return np.asarray(shap_values[HIGH_CLASS_INDEX])[0]

    values = np.asarray(shap_values)

    if values.ndim == 2:
        return values[0]

    if values.ndim == 3:
        if values.shape[0] == len(MODEL_CLASSES):
            return values[HIGH_CLASS_INDEX, 0, :]
        if values.shape[1] == len(FEATURES) and values.shape[2] == len(MODEL_CLASSES):
            return values[0, :, HIGH_CLASS_INDEX]
        if values.shape[1] == len(MODEL_CLASSES) and values.shape[2] == len(FEATURES):
            return values[0, HIGH_CLASS_INDEX, :]

    raise ValueError(f'Unsupported SHAP output shape: {values.shape}')


def feature_label(feature_code):
    return FEATURE_LABELS.get(feature_code, feature_code)


def serialize_feature_value(value):
    if value is None:
        return None
    try:
        if math.isnan(value):
            return None
    except TypeError:
        pass
    return float(value)


def is_unfavourable(feature_code, value):
    if value is None:
        return False

    try:
        if math.isnan(value):
            return False
    except TypeError:
        pass

    if feature_code in EXCLUDED:
        return False
    if feature_code == 'grp_aches':
        return value < 4
    if feature_code == 'sleepdificulty':
        return value < 4
    if feature_code == 'health':
        return value > 2
    if feature_code == 'schoolpressure':
        return value > 2
    if feature_code == 'grp_fam_sup':
        return value < 4
    if feature_code in ('talkfather', 'grp_talk_father'):
        return value > 2
    if feature_code in ('talkmother', 'grp_talk_mother'):
        return value > 2
    if feature_code == 'emcsocmed8':
        return value == 2
    if feature_code == 'studaccept':
        return value > 3
    if feature_code == 'grp_been_bullied':
        return value > 2
    if feature_code == 'likeschool':
        return value > 3
    if feature_code == 'famdec':
        return value < 4
    if feature_code == 'famhelp':
        return value < 4
    if feature_code == 'grp_teacher':
        return value > 3
    if feature_code == 'thinkbody':
        return value in (1, 5)
    if feature_code == 'grp_bfast':
        return value < 4
    if feature_code == 'studhelpful':
        return value > 3
    return False


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
async def health():
    return {'status': 'ok'}


@app.post('/predict')
async def predict(payload: dict):
  ordered_values = {
    feature_name: to_numeric_or_nan(resolve_feature_value(payload, feature_name))
    for feature_name in FEATURES
  }
  input_frame = np.array([[ordered_values[feature_name] for feature_name in FEATURES]], dtype=float)

  with warnings.catch_warnings():
    warnings.filterwarnings('ignore', message='X does not have valid feature names, but SimpleImputer was fitted with feature names')
    predicted_class = str(MODEL.predict(input_frame)[0])
    predicted_probabilities = MODEL.predict_proba(input_frame)[0]

    probability_by_class = {
        label: float(predicted_probabilities[index])
        for index, label in enumerate(MODEL_CLASSES)
    }
    prob_low = probability_by_class.get('low', 0.0)
    prob_medium = probability_by_class.get('medium', 0.0)
    prob_high = probability_by_class.get('high', 0.0)
    confidence = max(prob_low, prob_medium, prob_high)

  with warnings.catch_warnings():
    warnings.filterwarnings('ignore', message='X does not have valid feature names, but SimpleImputer was fitted with feature names')
    imputed_frame = np.asarray(
      IMPUTER_STEP.transform(input_frame),
      dtype=float,
    )
  shap_values = EXPLAINER.shap_values(imputed_frame)
  shap_high = get_high_class_shap_values(shap_values)

  positive_indices = np.where(shap_high > 0)[0]
  ranked_indices = positive_indices[np.argsort(shap_high[positive_indices])[::-1]]
  positive_shap_features = [
    {
      'feature_code': FEATURES[index],
      'feature_label': feature_label(FEATURES[index]),
      'feature_value': serialize_feature_value(ordered_values[FEATURES[index]]),
      'shap_value': float(shap_high[index]),
    }
    for index in ranked_indices
  ]
  unfavourable_features = [
    {
      'feature_code': feature_name,
      'feature_label': feature_label(feature_name),
      'feature_value': serialize_feature_value(ordered_values[feature_name]),
    }
    for feature_name in FEATURES
    if is_unfavourable(feature_name, ordered_values[feature_name])
  ]
  shap_drivers = [item['feature_code'] for item in positive_shap_features[:3]]

  return {
    'pred_class': predicted_class,
    'prob_low': prob_low,
    'prob_medium': prob_medium,
    'prob_high': prob_high,
    'p_high': prob_high,
    'confidence': confidence,
    'risk_score': int(round((0.0 * prob_low + 0.5 * prob_medium + 1.0 * prob_high) * 100)),
    'shap_drivers': shap_drivers,
    'positive_shap_features': positive_shap_features,
    'unfavourable_features': unfavourable_features,
  }
