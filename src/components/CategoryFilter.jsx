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
    <nav className="category-filter" aria-label="Categorías de productos">
      <div className="category-scroll">
        {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => onChange(category)}
              aria-pressed={activeCategory === category}
              aria-label={`Filtrar por ${category}`}
            >
              <span>{category}</span>
            </button>
        ))}
      </div>

      {showGrupos && (
        <div className="grupo-scroll" role="group" aria-label="Filtro de grupos">
          {grupos.map((grupo) => (
            <button
              key={grupo}
              type="button"
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
    </nav>
  );
}
