import { useState } from 'react';
import { Link } from 'react-router-dom';
import HuongDanSuDung from '../../../../shared/dialogs/huong-dan-su-dung/huong-dan-su-dung';
import ChiaSe from '../../../../shared/dialogs/chia-se/chia-se';
import { IconInfo, IconShare } from '../../../../shared/icons';
import './header.css';

export default function Header() {
  const [showGuide, setShowGuide] = useState(false);
  const [showShare, setShowShare] = useState(false);

  return (
    <header className="hdr">
      <div className="hdr-inner">
        {/* Logo: bi số 8 */}
        <Link to="/" className="hdr-logo">
          <div className="hdr-ball">
            <span className="hdr-ball-shine" />
            <span className="hdr-ball-num">8</span>
          </div>
          <div className="hdr-brand">
            <span className="hdr-name">Bida Club</span>
            <span className="hdr-tag">ĐÁNH ĐỀN BI-A</span>
          </div>
        </Link>

        <div className="hdr-actions">
          <button
            type="button"
            className="hdr-share"
            onClick={() => setShowShare(true)}
            aria-label="Chia sẻ mã QR"
            title="Chia sẻ mã QR"
          >
            <IconShare />
            <span className="hdr-share-text">Chia sẻ</span>
          </button>

          <button type="button" className="hdr-guide" onClick={() => setShowGuide(true)}>
            <span className="hdr-guide-icon">
              <IconInfo />
            </span>
            <span>Cách sử dụng</span>
          </button>
        </div>
      </div>

      <HuongDanSuDung open={showGuide} onClose={() => setShowGuide(false)} />
      <ChiaSe open={showShare} onClose={() => setShowShare(false)} />
    </header>
  );
}
