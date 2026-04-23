import sys
import boto3
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import holidays
import io
from datetime import date, timedelta
from awsglue.utils import getResolvedOptions
from awsglue.job import Job
from awsglue.context import GlueContext
from pyspark.context import SparkContext

args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

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

df = generate_dim_date()
table = pa.Table.from_pandas(df)
buffer = io.BytesIO()
pq.write_table(table, buffer)
buffer.seek(0)

s3 = boto3.client('s3')
s3.put_object(
    Bucket='chinook-sm-pbd2',
    Key='dw/dim_date/dim_date.parquet',
    Body=buffer.getvalue()
)

print("✅ dim_date cargada exitosamente")
job.commit()