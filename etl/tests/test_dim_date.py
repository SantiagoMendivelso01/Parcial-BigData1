import pytest
from etl.etl_dim_date import generate_dim_date

def test_row_count():
    df = generate_dim_date('2024-01-01', '2024-01-31')
    assert len(df) == 31

def test_date_key_format():
    df = generate_dim_date('2024-01-01', '2024-01-01')
    assert df.iloc[0]['DateKey'] == 20240101

def test_columns_exist():
    df = generate_dim_date('2024-01-01', '2024-01-01')
    expected = ['DateKey','FullDate','Year','Quarter','Month','Day','DayOfWeek','IsHoliday']
    assert list(df.columns) == expected

def test_holiday_colombia():
    df = generate_dim_date('2024-01-01', '2024-01-01')
    assert df.iloc[0]['IsHoliday'] == True  # 1 enero es festivo

def test_quarter_calculation():
    df = generate_dim_date('2024-04-01', '2024-04-01')
    assert df.iloc[0]['Quarter'] == 2