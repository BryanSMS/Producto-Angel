import { LayoutGrid } from 'lucide-react';
import { getCategoryVisual } from '../utils/categoryVisuals';
import './CategoryFilter.css';

export function CategoryFilter({
  categories,
  activeCategory,
  onChange,
  grupos = ['Todos'],
  activeGrupo = 'Todos',
  onChangeGrupo,
}) {
  const showGrupos = activeCategory !== 'Todos' && grupos.length > 1;

  return (
    <div className="category-filter">
      <div className="category-scroll">
        {categories.map((category) => {
          const isTodos = category === 'Todos';
          const Icon = isTodos ? LayoutGrid : getCategoryVisual(category).icon;

          return (
            <button
              key={category}
              className={`category-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => onChange(category)}
              aria-pressed={activeCategory === category}
              aria-label={`Filtrar por ${category}`}
            >
              <Icon size={16} strokeWidth={2} className="category-button-icon" />
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      {showGrupos && (
        <div className="grupo-scroll" aria-label="Filtro de grupos">
          {grupos.map((grupo) => (
            <button
              key={grupo}
              className={`grupo-button ${activeGrupo === grupo ? 'active' : ''}`}
              onClick={() => onChangeGrupo(grupo)}
              aria-pressed={activeGrupo === grupo}
              aria-label={`Filtrar por grupo ${grupo}`}
            >
              {grupo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
