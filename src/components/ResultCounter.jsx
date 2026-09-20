import './ResultCounter.css';

export function ResultCounter({ count }) {
  return (
    <div className="result-counter" role="status" aria-live="polite" aria-atomic="true">
      <p className="result-text">
        {count === 1 
          ? `${count} resultado`
          : `${count} resultados`
        }
      </p>
    </div>
  );
}
