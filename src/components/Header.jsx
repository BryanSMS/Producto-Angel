import { Store } from 'lucide-react';
import { tienda } from '../config/tienda';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <span className="header-icon-badge">
            <Store size={18} strokeWidth={2} />
          </span>
          <p className="header-title">{tienda.nombre}</p>
        </div>
        <p className="header-subtitle">Uso interno</p>
      </div>
    </header>
  );
}
