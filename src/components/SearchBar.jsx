import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export function SearchBar({ value, onChange, onClear }) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="search-container" role="search" aria-label="Consulta de productos">
      <div className="search-wrapper">
        <Search size={24} className="search-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder="Buscar por nombre, marca o código…"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Buscar productos"
        />
        {value && (
          <button
            className="search-clear"
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
