"""
Utility functions for common operations.

Includes date range calculations, formatting helpers, and calculation utilities.
"""
from datetime import datetime, timedelta
from typing import Tuple, Optional
from decimal import Decimal
import calendar


def get_current_month_range() -> Tuple[datetime, datetime]:
    """
    Get start and end dates for the current month.

    Returns:
        Tuple of (start_date, end_date) for current month
    """
    now = datetime.now()
    start_date = datetime(now.year, now.month, 1)
    last_day = calendar.monthrange(now.year, now.month)[1]
    end_date = datetime(now.year, now.month, last_day, 23, 59, 59)
    return start_date, end_date


def get_date_range_for_period(period: str) -> Tuple[datetime, datetime]:
    """
    Get date range for a specified period.

    Args:
        period: Period type (week, month, quarter, year)

    Returns:
        Tuple of (start_date, end_date)

    Raises:
        ValueError: If invalid period specified
    """
    now = datetime.now()
    end_date = now

    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = datetime(now.year, now.month, 1)
    elif period == "quarter":
        # Get current quarter
        current_quarter = (now.month - 1) // 3 + 1
        quarter_start_month = (current_quarter - 1) * 3 + 1
        start_date = datetime(now.year, quarter_start_month, 1)
    elif period == "year":
        start_date = datetime(now.year, 1, 1)
    else:
        raise ValueError(f"Invalid period: {period}. Must be one of: week, month, quarter, year")

    return start_date, end_date


def get_month_range(year: int, month: int) -> Tuple[datetime, datetime]:
    """
    Get start and end dates for a specific month.

    Args:
        year: Year
        month: Month (1-12)

    Returns:
        Tuple of (start_date, end_date)

    Raises:
        ValueError: If invalid month/year
    """
    if not 1 <= month <= 12:
        raise ValueError(f"Invalid month: {month}. Must be 1-12")

    if not 1900 <= year <= 2100:
        raise ValueError(f"Invalid year: {year}. Must be 1900-2100")

    start_date = datetime(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = datetime(year, month, last_day, 23, 59, 59)
    return start_date, end_date


def get_year_range(year: int) -> Tuple[datetime, datetime]:
    """
    Get start and end dates for a specific year.

    Args:
        year: Year

    Returns:
        Tuple of (start_date, end_date)

    Raises:
        ValueError: If invalid year
    """
    if not 1900 <= year <= 2100:
        raise ValueError(f"Invalid year: {year}. Must be 1900-2100")

    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31, 23, 59, 59)
    return start_date, end_date


def get_last_n_months_range(months: int) -> Tuple[datetime, datetime]:
    """
    Get date range for the last N months.

    Args:
        months: Number of months to go back

    Returns:
        Tuple of (start_date, end_date)

    Raises:
        ValueError: If invalid months value
    """
    if months < 1:
        raise ValueError("Months must be at least 1")

    now = datetime.now()
    end_date = now

    # Calculate start date by going back N months
    start_month = now.month - months
    start_year = now.year

    while start_month <= 0:
        start_month += 12
        start_year -= 1

    start_date = datetime(start_year, start_month, 1)
    return start_date, end_date


def get_days_between(start_date: datetime, end_date: datetime) -> int:
    """
    Get number of days between two dates.

    Args:
        start_date: Start date
        end_date: End date

    Returns:
        Number of days
    """
    delta = end_date - start_date
    return delta.days + 1  # Include both start and end dates


def get_months_between(start_date: datetime, end_date: datetime) -> int:
    """
    Get approximate number of months between two dates.

    Args:
        start_date: Start date
        end_date: End date

    Returns:
        Number of months
    """
    months = (end_date.year - start_date.year) * 12
    months += end_date.month - start_date.month
    return max(months, 1)  # At least 1 month


def format_currency(amount: float, currency: str = "₦") -> str:
    """
    Format amount as currency string.

    Args:
        amount: Amount to format
        currency: Currency symbol (default: ₦)

    Returns:
        Formatted currency string

    Example:
        >>> format_currency(1234567.89)
        '₦1,234,567.89'
    """
    return f"{currency}{amount:,.2f}"


def calculate_percentage(part: float, total: float) -> float:
    """
    Calculate percentage with zero-division handling.

    Args:
        part: Part value
        total: Total value

    Returns:
        Percentage (0-100)
    """
    if total == 0:
        return 0.0
    return round((part / total) * 100, 2)


def calculate_average(values: list) -> float:
    """
    Calculate average with zero-length handling.

    Args:
        values: List of numeric values

    Returns:
        Average value
    """
    if not values:
        return 0.0
    return round(sum(values) / len(values), 2)


def calculate_variance(values: list) -> float:
    """
    Calculate variance of a list of values.

    Args:
        values: List of numeric values

    Returns:
        Variance
    """
    if not values or len(values) < 2:
        return 0.0

    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return round(variance, 2)


def calculate_standard_deviation(values: list) -> float:
    """
    Calculate standard deviation of a list of values.

    Args:
        values: List of numeric values

    Returns:
        Standard deviation
    """
    variance = calculate_variance(values)
    return round(variance ** 0.5, 2)


def calculate_coefficient_of_variation(values: list) -> float:
    """
    Calculate coefficient of variation (CV) as percentage.

    CV = (standard deviation / mean) * 100

    Useful for measuring consistency of spending/income.

    Args:
        values: List of numeric values

    Returns:
        Coefficient of variation as percentage
    """
    if not values:
        return 0.0

    mean = sum(values) / len(values)
    if mean == 0:
        return 0.0

    std_dev = calculate_standard_deviation(values)
    cv = (std_dev / mean) * 100
    return round(cv, 2)


def safe_decimal_to_float(value: Optional[Decimal]) -> float:
    """
    Safely convert Decimal to float with None handling.

    Args:
        value: Decimal value or None

    Returns:
        Float value (0.0 if None)
    """
    if value is None:
        return 0.0
    return float(value)


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to maximum length with suffix.

    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated (default: "...")

    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def get_financial_health_grade(score: float) -> str:
    """
    Convert financial health score to letter grade.

    Args:
        score: Score (0-100)

    Returns:
        Grade (A-F)
    """
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"


def get_budget_status(utilization_percentage: float) -> str:
    """
    Determine budget status based on utilization percentage.

    Args:
        utilization_percentage: Percentage of budget used

    Returns:
        Status: healthy, warning, critical, or exceeded
    """
    if utilization_percentage > 100:
        return "exceeded"
    elif utilization_percentage >= 85:
        return "critical"
    elif utilization_percentage >= 70:
        return "warning"
    else:
        return "healthy"


def is_date_in_range(
    date: datetime,
    start_date: datetime,
    end_date: datetime
) -> bool:
    """
    Check if a date falls within a date range (inclusive).

    Args:
        date: Date to check
        start_date: Range start date
        end_date: Range end date

    Returns:
        True if date is in range
    """
    return start_date <= date <= end_date


def get_quarter_for_month(month: int) -> int:
    """
    Get quarter number (1-4) for a given month.

    Args:
        month: Month (1-12)

    Returns:
        Quarter (1-4)

    Raises:
        ValueError: If invalid month
    """
    if not 1 <= month <= 12:
        raise ValueError(f"Invalid month: {month}. Must be 1-12")

    return (month - 1) // 3 + 1


def get_month_name(month: int) -> str:
    """
    Get month name from month number.

    Args:
        month: Month number (1-12)

    Returns:
        Month name

    Raises:
        ValueError: If invalid month
    """
    if not 1 <= month <= 12:
        raise ValueError(f"Invalid month: {month}. Must be 1-12")

    return calendar.month_name[month]


def format_date_range(start_date: datetime, end_date: datetime) -> str:
    """
    Format date range as readable string.

    Args:
        start_date: Start date
        end_date: End date

    Returns:
        Formatted string

    Example:
        >>> format_date_range(datetime(2026, 1, 1), datetime(2026, 1, 31))
        'January 1, 2026 - January 31, 2026'
    """
    start_str = start_date.strftime("%B %d, %Y")
    end_str = end_date.strftime("%B %d, %Y")
    return f"{start_str} - {end_str}"
