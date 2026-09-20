import { useLayoutEffect, useRef } from 'react';
import { gsap, motionQuery } from '../utils/animations';
import './CategoryFilter.css';

export function CategoryFilter({ categories, activeCategory, onChange, grupos = ['Todos'], activeGrupo = 'Todos', onChangeGrupo }) {
  const navRef = useRef(null);
  useLayoutEffect(() => {
    const nav = navRef.current;
    const line = nav.querySelector('.category-indicator');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let tween;
    const update = () => {
      const button = nav.querySelector('.category-button.active');
      if (!button) return;
      tween?.kill();
      tween = gsap.to(line, {
        x: button.offsetLeft, width: button.offsetWidth,
        duration: window.matchMedia(motionQuery).matches ? 0.28 : 0, ease: 'power3.out',
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    reduced.addEventListener('change', update);
    return () => { observer.disconnect(); reduced.removeEventListener('change', update); tween?.kill(); };
  }, [activeCategory]);

  return (
    <nav ref={navRef} className="category-filter" aria-label="Categorías de productos">
      <div className="category-scroll">
        {categories.map(category => (
          <button key={category} type="button" className={`category-button ${activeCategory === category ? 'active' : ''}`}
            onClick={() => onChange(category)} aria-pressed={activeCategory === category} aria-label={`Filtrar por ${category}`}>
            {category}
          </button>
        ))}
        <span className="category-indicator" aria-hidden="true" />
      </div>
      {activeCategory !== 'Todos' && grupos.length > 1 && (
        <div className="grupo-scroll" role="group" aria-label="Filtro de grupos">
          {grupos.map(grupo => (
            <button key={grupo} type="button" className={`grupo-button ${activeGrupo === grupo ? 'active' : ''}`}
              onClick={() => onChangeGrupo(grupo)} aria-pressed={activeGrupo === grupo} aria-label={`Filtrar por grupo ${grupo}`}>
              {grupo}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
