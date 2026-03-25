import pandas as pd
import glob
import os

print('--- DATASET PROFILING ---')
for file in glob.glob('data/*.csv'):
    print(f'\n--- {os.path.basename(file)} ---')
    try:
        df = pd.read_csv(file)
        print(f'Shape: {df.shape}')
        print(f'Columns: {list(df.columns)}')
        print(f'Data Types:')
        print(df.dtypes.to_dict())
        print(f'First row:')
        print(df.iloc[0].to_dict())
    except Exception as e:
        print(f'Error reading: {e}')
