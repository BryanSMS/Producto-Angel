import { tienda } from '../config/tienda';
import './Header.css';

export function Header({ children }) {
  return (
    <header className="header">
      <div className="header-logo">
        <span className="header-icon-badge" aria-hidden="true"><i /></span>
        <p className="header-title">{tienda.nombre}</p>
      </div>
      {children}
    </header>
  );
}
