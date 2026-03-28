import { parseLocalDate, formatDate } from '../utils/api';

export default function DateNav({ selectedDate, onDateChange }) {
  const parsed = parseLocalDate(selectedDate);

  const prev = new Date(parsed);
  prev.setDate(parsed.getDate() - 1);

  const next = new Date(parsed);
  next.setDate(parsed.getDate() + 1);

  const today = new Date();
  const isToday = formatDate(parsed) === formatDate(today);

  const label = parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="date-nav">
      <button
        className="date-btn"
        onClick={() => onDateChange(formatDate(prev))}
        aria-label="Previous day"
      >
        ‹
      </button>

      <div className="date-center">
        <span className="date-label">{label}</span>
        <input
          type="date"
          className="date-picker"
          value={selectedDate}
          max={formatDate(today)}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
        />
      </div>

      <button
        className="date-btn"
        onClick={() => onDateChange(formatDate(next))}
        disabled={isToday}
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  );
}
