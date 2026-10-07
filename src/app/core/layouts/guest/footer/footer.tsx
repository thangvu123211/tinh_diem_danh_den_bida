import { IconCue } from '../../../../shared/icons';
import './footer.css';

export default function Footer() {
  return (
    <footer className="ftr">
      <span className="ftr-icon">
        <IconCue />
      </span>
      <span className="ftr-muted">Designed by</span>
      <a
        className="ftr-name"
        href="https://trang-ca-nhan-vvt.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Vu Viet Thang
      </a>
    </footer>
  );
}
