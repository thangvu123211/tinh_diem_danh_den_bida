import { IconCue } from '../../../../shared/icons';
import './footer.css';

export default function Footer() {
  return (
    <footer className="ftr">
      <span className="ftr-icon">
        <IconCue />
      </span>
      <span className="ftr-muted">Designed by</span>
      <span className="ftr-name">Vu Viet Thang</span>
    </footer>
  );
}
