import './ResultCounter.css';

export function ResultCounter({ count }) {
  return (
    <div className="result-counter">
      <p className="result-text">
        {count === 1 
          ? `${count} producto disponible` 
          : `${count} productos disponibles`
        }
      </p>
    </div>
  );
}
