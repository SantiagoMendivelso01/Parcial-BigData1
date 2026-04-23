import boto3
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import holidays
import io
from datetime import date, timedelta

def generate_dim_date(start='2000-01-01', end='2030-12-31'):
    co_holidays = holidays.Colombia(years=range(2000, 2031))
    rows = []
    current = date.fromisoformat(start)
    end_date = date.fromisoformat(end)
    
    while current <= end_date:
        rows.append({
            'DateKey':   int(current.strftime('%Y%m%d')),
            'FullDate':  current.isoformat(),
            'Year':      current.year,
            'Quarter':   (current.month - 1) // 3 + 1,
            'Month':     current.month,
            'Day':       current.day,
            'DayOfWeek': current.strftime('%A'),
            'IsHoliday': current in co_holidays
        })
        current += timedelta(days=1)
    return pd.DataFrame(rows)

def run_etl():
    df = generate_dim_date()
    table = pa.Table.from_pandas(df)
    buffer = io.BytesIO()
    pq.write_table(table, buffer)
    buffer.seek(0)
    
    s3 = boto3.client(
        's3',
        region_name='us-east-1',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        aws_session_token=os.environ['AWS_SESSION_TOKEN']
    )
    
    s3.put_object(
        Bucket=os.environ['S3_BUCKET'],
        Key='dw/dim_date/dim_date.parquet',
        Body=buffer.getvalue()
    )
    print("✅ dim_date cargada exitosamente")

if __name__ == '__main__':
    import os
    run_etl()
