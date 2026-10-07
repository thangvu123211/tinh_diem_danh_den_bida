import { useEffect, useState } from 'react';
import Modal from '../../modal/modal';
import { IconCheck, IconClose, IconCopy, IconDownload, IconShare } from '../../icons';
import './chia-se.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHARE_URL = 'https://tinh-diem-danh-den-bida.vercel.app/';
const SHARE_TEXT = 'Bảng tính điểm đánh đền bida — quét mã hoặc mở link để dùng ngay';

export default function ChiaSe({ open, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  // Mở lại hộp thoại thì reset trạng thái "Đã chép"
  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Sao chép link:', SHARE_URL);
    }
  }

  async function shareLink() {
    try {
      await navigator.share({ title: 'Bida Club', text: SHARE_TEXT, url: SHARE_URL });
    } catch {
      // Người dùng đóng bảng chia sẻ -> không làm gì
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth={380}>
      <div className="cs">
        <button className="cs-close" onClick={onClose} aria-label="Đóng">
          <IconClose />
        </button>

        <h2 className="cs-title">Chia sẻ Bida Club</h2>
        <p className="cs-sub">Đưa bạn bè quét mã để mở bảng tính điểm</p>

        <div className="cs-qr">
          <img src="/qr-code.svg" alt={`Mã QR dẫn tới ${SHARE_URL}`} width={240} height={240} />
        </div>

        <button className="cs-link" onClick={copyLink} title="Bấm để sao chép">
          <span>{SHARE_URL.replace('https://', '').replace(/\/$/, '')}</span>
          {copied ? <IconCheck /> : <IconCopy />}
        </button>

        <div className="cs-actions">
          {canShare ? (
            <button className="btn btn-primary" onClick={shareLink}>
              <IconShare />
              <span>Gửi link</span>
            </button>
          ) : (
            <button className="btn btn-primary" onClick={copyLink}>
              {copied ? <IconCheck /> : <IconCopy />}
              <span>{copied ? 'Đã chép!' : 'Chép link'}</span>
            </button>
          )}
          <a className="btn btn-outline" href="/qr-code.png" download="bida-club-qr.png">
            <IconDownload />
            <span>Tải QR</span>
          </a>
        </div>
      </div>
    </Modal>
  );
}
