import { Search } from 'lucide-react';
import './EmptyState.css';

export function EmptyState({ onReset }) {
  return (
    <section className="empty-state">
      <div className="empty-state-content">
        <Search size={48} className="empty-state-icon" />
        <h2 className="empty-state-title">No encontramos productos</h2>
        <p className="empty-state-description">
          Prueba con otro nombre o selecciona otra categoría.
        </p>
        <button className="empty-state-button" onClick={onReset}>
          Ver todos los productos
        </button>
      </div>
    </section>
  );
}
