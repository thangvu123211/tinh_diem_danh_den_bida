import type { ReactNode } from 'react';
import Modal from '../../modal/modal';
import {
  IconBolt, IconClose, IconGrid, IconList, IconPlus, IconRedo, IconRestart, IconUndo,
} from '../../icons';
import './huong-dan-su-dung.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    tag: 'Bước 1',
    title: 'Nhập tên người chơi',
    body: <>Nhập tên người chơi vào ô và ấn nút <strong>"Thêm"</strong> (hoặc Enter).</>,
  },
  {
    tag: 'Bước 2',
    title: 'Ghi điểm & trừ điểm',
    body: (
      <>
        Dùng nút <strong>"+"</strong> để tăng điểm hoặc <strong>"−"</strong> để trừ điểm. Bấm liên tục để
        dồn điểm, sau 1,5 giây điểm sẽ được chốt. Khi tổng điểm bị lệch, huy hiệu cảnh báo sẽ hiện ngay.
      </>
    ),
  },
  {
    tag: 'Bước 3',
    title: 'Hoàn thành trận đấu',
    body: (
      <>
        <strong>Xác nhận kết quả</strong> khi tổng điểm đã cân bằng (bằng 0). Sau đó bấm{' '}
        <strong>"Ván mới"</strong> để bắt đầu trận tiếp theo.
      </>
    ),
  },
];

const quickActions: { demo: ReactNode; text: string }[] = [
  {
    demo: <span className="hd-chip hd-chip-warn"><IconRestart /> Ván mới</span>,
    text: 'Xóa điểm hiện tại để bắt đầu trận mới.',
  },
  {
    demo: <span className="hd-chip hd-chip-dark"><IconPlus /> Thêm</span>,
    text: 'Thêm cơ thủ mới vào bảng điểm.',
  },
  {
    demo: <span className="hd-chip hd-chip-outline"><IconUndo /> Hoàn tác</span>,
    text: 'Hủy thao tác cộng/trừ vừa nhập.',
  },
  {
    demo: <span className="hd-chip hd-chip-outline">Quay lại <IconRedo /></span>,
    text: 'Khôi phục thao tác vừa hoàn tác.',
  },
  {
    demo: (
      <span className="hd-pm">
        <span className="hd-sq hd-sq-light">−</span>
        <span className="hd-sq hd-sq-dark">+</span>
      </span>
    ),
    text: 'Tăng hoặc giảm điểm từng cơ thủ.',
  },
  {
    demo: <span className="hd-x"><IconClose /></span>,
    text: 'Xóa cơ thủ khỏi bảng điểm.',
  },
];

export default function HuongDanSuDung({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={640}>
      <div className="hd-head">
        <button className="hd-close" onClick={onClose} aria-label="Đóng">
          <IconClose />
        </button>
        <span className="hd-kicker">
          <span className="hd-dot" /> Cẩm nang luật chơi
        </span>
        <h2>Hướng Dẫn Sử Dụng</h2>
      </div>

      <div className="hd-body">
        {steps.map((s, i) => (
          <div key={s.tag} className="hd-step">
            <div className="hd-step-num">{i + 1}</div>
            <div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          </div>
        ))}

        <div className="hd-box">
          <h4>Chế độ xem</h4>
          <div className="hd-grid">
            <div className="hd-item">
              <span className="hd-chip hd-chip-dark"><IconList /> Danh sách</span>
              <span>Hàng dọc, dễ theo dõi thứ tự lượt đánh.</span>
            </div>
            <div className="hd-item">
              <span className="hd-chip hd-chip-dark"><IconGrid /> Lưới</span>
              <span>Dạng ô lưới, gọn khi chơi đông người.</span>
            </div>
          </div>
        </div>

        <div className="hd-box">
          <h4><IconBolt /> Thao tác nhanh</h4>
          <div className="hd-grid">
            {quickActions.map(a => (
              <div key={a.text} className="hd-item">
                {a.demo}
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hd-foot">
        <button className="btn btn-primary hd-ok" onClick={onClose}>Đã hiểu, chơi thôi!</button>
      </div>
    </Modal>
  );
}
