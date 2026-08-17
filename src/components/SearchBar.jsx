import { Search, X } from 'lucide-react';
import './SearchBar.css';

export function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="search-container">
      <div className="search-wrapper">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="¿Qué producto estás buscando?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Buscar productos"
        />
        {value && (
          <button
            className="search-clear"
            onClick={onClear}
            aria-label="Limpiar búsqueda"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
