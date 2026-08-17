import { tienda } from '../config/tienda';
import './HeroMessage.css';

export function HeroMessage() {
  return (
    <section className="hero-message">
      <div className="hero-container">
        <h2 className="hero-title">{tienda.heroTitulo}</h2>
        <p className="hero-description">{tienda.heroDescripcion}</p>
      </div>
    </section>
  );
}
