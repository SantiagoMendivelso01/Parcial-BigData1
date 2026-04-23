import pytest
from datetime import date
import pandas as pd

# Copiamos la función aquí para no depender de imports de Glue
import holidays
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

def test_row_count():
    df = generate_dim_date('2024-01-01', '2024-01-31')
    assert len(df) == 31

def test_date_key_format():
    df = generate_dim_date('2024-01-01', '2024-01-01')
    assert df.iloc[0]['DateKey'] == 20240101

def test_columns_exist():
    df = generate_dim_date('2024-01-01', '2024-01-01')
    expected = ['DateKey', 'FullDate', 'Year', 'Quarter', 'Month', 'Day', 'DayOfWeek', 'IsHoliday']
    assert list(df.columns) == expected

def test_holiday_colombia():
    df = generate_dim_date('2024-01-01', '2024-01-01')
    assert df.iloc[0]['IsHoliday'] == True  # 1 enero es festivo en Colombia

def test_quarter_calculation():
    df = generate_dim_date('2024-04-01', '2024-04-01')
    assert df.iloc[0]['Quarter'] == 2

def test_day_of_week():
    df = generate_dim_date('2024-01-01', '2024-01-01')
    assert df.iloc[0]['DayOfWeek'] == 'Monday'

def test_year_field():
    df = generate_dim_date('2024-06-15', '2024-06-15')
    assert df.iloc[0]['Year'] == 2024

def test_month_field():
    df = generate_dim_date('2024-06-15', '2024-06-15')
    assert df.iloc[0]['Month'] == 6