# PISA 2022 Student Questionnaire Dataset (Split Parquet Format)

## Overview
The original PISA dataset `CY08MSP_STU_QQQ.SAV` (~2.1 GB) exceeds GitHub's 100 MB file size limit.  
To make the dataset version-controllable and reproducible within this repository, it has been converted from **SPSS (.sav)** format into **compressed Parquet files** and split into multiple parts.

This conversion preserves:
- column names
- row count
- data types (as closely as possible)
- missing values

The files together reconstruct the original dataset.

---

## File Structure

```
data/
  raw_parquet/
    CY08MSP_STU_QQQ.part001.parquet
    CY08MSP_STU_QQQ.part002.parquet
    CY08MSP_STU_QQQ.part003.parquet
    ...
```

Each file:
- contains a **subset of rows**
- shares the **same schema**
- is **< 100 MB** to comply with GitHub limits

---

## How to Load the Dataset

To reconstruct the full dataset in Python:

```python
from pathlib import Path
import pandas as pd

data_dir = Path("data/raw_parquet")
files = sorted(data_dir.glob("CY08MSP_STU_QQQ.part*.parquet"))

df = pd.concat([pd.read_parquet(f) for f in files], ignore_index=True)

print(df.shape)
df.head()
```

---

## Recommended Workflow for EDA

Because the full dataset is large, it is recommended to create a **smaller processed subset** for analysis.

Example:

```python
cols_needed = [
    "CNT", "CNTSCHID", "ST004D01T", "ESCS"
]

df_subset = df[cols_needed].copy()
df_subset.to_parquet("data/processed/pisa_subset.parquet", index=False)
```

Future notebooks can then load:

```python
df = pd.read_parquet("data/processed/pisa_subset.parquet")
```

---

## Why Parquet?

Parquet provides several advantages over `.sav`:

- significantly smaller file size
- faster loading in Python
- efficient column-based reads
- better compatibility with modern data science workflows

---

## Notes

- The dataset originates from **OECD PISA 2022 Student Questionnaire data**.
- The conversion was performed using `pyreadstat` and `pyarrow`.
- Value labels from the original SPSS file are preserved in the accompanying metadata files.

---

## Reconstructing the Original Dataset

The split Parquet files together represent the full dataset.  
To reconstruct the full dataset:

```python
df = pd.concat([pd.read_parquet(f) for f in files], ignore_index=True)
```

The resulting DataFrame should match the original `.sav` structure.