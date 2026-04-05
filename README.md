# DSA4262 Group 3

This repository contains our DSA4262 project work on student wellbeing modelling and the accompanying intervention prototype.

## Repository Structure

- `HBSC_data/`: HBSC 2018 source files and the grouping workbook used in feature engineering.
- `PISA_data/`: PISA questionnaire/codebook assets and parquet outputs used in related exploratory work.
- `benrfv3.ipynb`: main random forest v3 notebook.
- `benrfv3_run.py`: script version of the v3 random forest pipeline.
- `benrfv3_selected_feature_manifest.csv`: selected v3 features, including grouped variables and grouped question wording.
- `benrfv3_final_predictions.csv`: final v3 modelling output used to inspect feature scales and predictions.
- `wellbeing-platform/`: frontend app and backend entity definitions for the student, teacher, and questions dashboards.

## Key Modelling Files

- `benrfv2.ipynb`, `benrfv3.ipynb`: notebook experiments for the random forest pipeline.
- `elasticnet_*`, `lasso_*`, `rf_*`: model comparison outputs and summaries.
- `*_feature_importance.csv`, `*_oos_results.csv`, `*_final_predictions.csv`: exported modelling results.

## Wellbeing Platform

The `wellbeing-platform/` folder contains the integrated dashboard application:

- student check-in flow with one-time and weekly questions
- student support report without showing distress scores
- teacher dashboard with score trends and consecutive-distress flags
- question dashboard showing the 31 selected v3 features

To run it locally:

```bash
cd wellbeing-platform
npm install
npm run dev
```

To build it:

```bash
cd wellbeing-platform
npm run build
```

## Notes

- Grouped HBSC variables are defined by `HBSC_data/hbsc_variable_groupings.xlsx`.
- For grouped features, the prototype uses umbrella phrasing that summarizes the grouped idea rather than copying a single raw HBSC item verbatim.
- Local-only files such as `node_modules`, `dist`, `.claude`, and zip archives are ignored.
