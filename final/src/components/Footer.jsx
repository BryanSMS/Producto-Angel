import { tienda } from '../config/tienda';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">{tienda.footerTexto}</p>
      </div>
    </footer>
  );
}
