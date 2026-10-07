import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useConfirm } from '../../../shared/confirm-dialog/confirm-dialog';
import {
  IconClose, IconGrid, IconList, IconPlus, IconRedo, IconRestart, IconUndo, IconUser,
} from '../../../shared/icons';
import './trang-chu.css';

export interface Player {
  id: number;
  name: string;
  score: number;
}

export interface MatchState {
  tranDauId: number;
  players: Player[];
}

type PendingMap = Record<number, number>;

const STORAGE_KEY = 'bida_match_data';
const MAX_HISTORY = 30;
const COMMIT_DELAY = 1500; // Sau 1,5s không bấm nữa mới chốt điểm dồn

function loadFromLocalStorage(): MatchState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: MatchState = JSON.parse(raw);
    if (!data?.tranDauId) return null;
    const players = (data.players || []).map(({ id, name, score }) => ({ id, name, score }));
    return { tranDauId: data.tranDauId, players };
  } catch (e) {
    console.error('Lỗi đọc LocalStorage:', e);
    return null;
  }
}

function saveToLocalStorage(tranDauId: number | null, players: Player[]): void {
  try {
    if (!tranDauId) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const data: MatchState = { tranDauId, players };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Bộ nhớ trình duyệt không khả dụng (chế độ riêng tư...) -> bỏ qua
  }
}

function withoutKey(map: PendingMap, id: number): PendingMap {
  const next = { ...map };
  delete next[id];
  return next;
}

const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
const scoreTone = (n: number) => (n > 0 ? 'score-pos' : n < 0 ? 'score-neg' : 'score-zero');

const pad = (n: number) => String(n).padStart(2, '0');

/** Định dạng thời lượng: mm:ss, hoặc h:mm:ss khi quá 1 giờ */
function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function TrangChu() {
  const confirm = useConfirm();

  const [initial] = useState(loadFromLocalStorage);
  const [tranDauId, setTranDauId] = useState<number | null>(initial?.tranDauId ?? null);
  const [players, setPlayers] = useState<Player[]>(initial?.players ?? []);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isGridView, setIsGridView] = useState(false);

  // Stack lịch sử cho Hoàn tác (Undo) & Quay lại (Redo)
  const [history, setHistory] = useState<Player[][]>([]);
  const [redoStack, setRedoStack] = useState<Player[][]>([]);

  // Điểm đang dồn của từng người chơi (chưa chốt)
  const [pending, setPending] = useState<PendingMap>({});
  const pendingRef = useRef<PendingMap>({});
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const playersRef = useRef(players);
  playersRef.current = players;

  const inputRef = useRef<HTMLInputElement>(null);

  const totalScore = players.reduce((sum, p) => sum + p.score, 0);
  const isScoreInvalid = players.length > 0 && totalScore !== 0;
  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;

  // Tự lưu mỗi khi trận đấu thay đổi
  useEffect(() => {
    saveToLocalStorage(tranDauId, players);
  }, [tranDauId, players]);

  // Đồng hồ thời gian chơi: tranDauId chính là thời điểm thêm người chơi đầu tiên
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!tranDauId) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [tranDauId]);
  const elapsed = tranDauId ? now - tranDauId : 0;

  // Dọn timer khi rời trang
  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  function setPendingMap(next: PendingMap) {
    pendingRef.current = next;
    setPending(next);
  }

  function clearAllPending() {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
    setPendingMap({});
  }

  function pushHistory(snapshot: Player[]) {
    setHistory(h => [...h, snapshot].slice(-MAX_HISTORY));
    // Hành động mới -> xóa nhánh redo
    setRedoStack([]);
  }

  function addPlayer() {
    const name = newPlayerName.trim();
    if (!name) {
      inputRef.current?.focus();
      return;
    }

    if (!tranDauId) setTranDauId(Date.now());

    pushHistory(players);
    setPlayers([...players, { id: Date.now() + Math.floor(Math.random() * 1000), name, score: 0 }]);
    setNewPlayerName('');
    inputRef.current?.focus();
  }

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') addPlayer();
  }

  // ==========================================
  // CỘNG / TRỪ DỒN ĐIỂM + TIMER CHỐT ĐIỂM
  // ==========================================
  function updateScore(id: number, change: number) {
    const current = pendingRef.current[id] || 0;

    // Lưu snapshot Undo ở lần bấm đầu tiên của chuỗi
    if (!current) pushHistory(players);

    setPendingMap({ ...pendingRef.current, [id]: current + change });

    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      const value = pendingRef.current[id] || 0;
      delete timers.current[id];
      setPendingMap(withoutKey(pendingRef.current, id));
      if (value !== 0) {
        setPlayers(ps => ps.map(p => (p.id === id ? { ...p, score: p.score + value } : p)));
      }
    }, COMMIT_DELAY);
  }

  async function removePlayer(id: number) {
    const player = playersRef.current.find(p => p.id === id);
    const ok = await confirm(`Bạn có chắc muốn xóa người chơi "${player?.name ?? ''}" không?`);
    if (!ok) return;

    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setPendingMap(withoutKey(pendingRef.current, id));

    const remaining = playersRef.current.filter(p => p.id !== id);
    if (remaining.length === 0) {
      setTranDauId(null);
      setHistory([]);
      setRedoStack([]);
    } else {
      pushHistory(playersRef.current);
    }
    setPlayers(remaining);
  }

  async function newGame() {
    const ok = await confirm('Bạn có chắc chắn muốn tạo ván mới? Toàn bộ người chơi và điểm số sẽ bị xóa.');
    if (!ok) return;

    clearAllPending();
    setTranDauId(null);
    setPlayers([]);
    setHistory([]);
    setRedoStack([]);
  }

  function undo() {
    if (!canUndo) return;
    clearAllPending();
    setRedoStack(r => [...r, players]);
    setPlayers(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
  }

  function redo() {
    if (!canRedo) return;
    clearAllPending();
    setHistory(h => [...h, players]);
    setPlayers(redoStack[redoStack.length - 1]);
    setRedoStack(r => r.slice(0, -1));
  }

  // ==========================================
  // CÁC PHẦN HIỂN THỊ NHỎ
  // ==========================================
  const ball = (i: number) => (
    <div className={`ball ball-c${i % 8} ${i % 16 < 8 ? 'ball-solid' : 'ball-stripe'}`}>
      <span>{i + 1}</span>
    </div>
  );

  const pendingChip = (id: number) => {
    const value = pending[id];
    if (!value) return null;
    return (
      <span key={value} className={`pending ${value > 0 ? 'pending-plus' : 'pending-minus'}`}>
        {fmt(value)}
      </span>
    );
  };

  const scoreButtons = (id: number, name: string) => (
    <>
      <button className="score-btn score-minus" onClick={() => updateScore(id, -1)} aria-label={`Trừ điểm ${name}`}>
        −
      </button>
      <button className="score-btn score-plus" onClick={() => updateScore(id, 1)} aria-label={`Cộng điểm ${name}`}>
        +
      </button>
    </>
  );

  const removeButton = (id: number, name: string) => (
    <button className="remove-btn" onClick={() => removePlayer(id)} aria-label={`Xóa ${name}`}>
      <IconClose />
    </button>
  );

  return (
    <div className="tc">
      {/* ===== BẢNG ĐIỂM ===== */}
      <section className="board">
        <div className="board-diamonds">
          {Array.from({ length: 8 }, (_, i) => <span key={i} />)}
        </div>

        <span className="board-kicker">Trận đấu hôm nay</span>
        <h1 className="board-title">Bảng Tính Điểm Đánh Đền Bida</h1>

        {/* Vùng trạng thái cố định chiều cao -> layout không bị nhảy */}
        <div className="board-status">
          {isScoreInvalid ? (
            <span className="status status-warn">
              <span className="status-dot" />
              Đang lệch <b>{fmt(totalScore)}</b>
            </span>
          ) : players.length > 0 ? (
            <span className="status status-ok">Điểm đã cân bằng</span>
          ) : (
            <span className="status status-idle">Thêm cơ thủ để bắt đầu</span>
          )}
        </div>

        <div className="board-stats">
          <div>
            <b>{players.length}</b>
            <span>cơ thủ</span>
          </div>
          <div>
            <b className={tranDauId ? 'board-timer' : ''}>{fmtDuration(elapsed)}</b>
            <span>thời gian chơi</span>
          </div>
        </div>
      </section>

      <div className="tc-body">
        {/* ===== THANH CÔNG CỤ ===== */}
        <div className="toolbar">
          <button className="btn btn-warn" onClick={newGame}>
            <IconRestart />
            <span>Ván mới</span>
          </button>

          <div className="toolbar-right">
            <button className="btn btn-outline" onClick={undo} disabled={!canUndo}>
              <IconUndo />
              <span>Hoàn tác</span>
            </button>

            {canRedo && (
              <button className="btn btn-outline btn-appear" onClick={redo}>
                <span>Quay lại</span>
                <IconRedo />
              </button>
            )}

            <div className="segmented" role="tablist">
              <button className={!isGridView ? 'active' : ''} onClick={() => setIsGridView(false)} aria-label="Danh sách">
                <IconList />
                <span className="hide-sm">Danh sách</span>
              </button>
              <button className={isGridView ? 'active' : ''} onClick={() => setIsGridView(true)} aria-label="Lưới">
                <IconGrid />
                <span className="hide-sm">Lưới</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== THÊM NGƯỜI CHƠI ===== */}
        <div className="add-bar">
          <span className="add-icon">
            <IconUser />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Nhập tên người chơi..."
            maxLength={30}
            enterKeyHint="done"
          />
          <button className="add-btn" onClick={addPlayer}>
            <IconPlus />
            <span className="hide-sm">Thêm</span>
          </button>
        </div>

        {/* ===== TRỐNG ===== */}
        {players.length === 0 && (
          <div className="empty">
            <div className="empty-ball">
              <span>8</span>
            </div>
            <p className="empty-title">Bàn đã sẵn sàng</p>
            <p className="empty-text">Thêm người đầu tiên để bắt đầu ván bida 🎱</p>
          </div>
        )}

        {/* ===== DANH SÁCH DỌC ===== */}
        {!isGridView && players.length > 0 && (
          <div className="list">
            {players.map((p, i) => (
              <div key={p.id} className="row">
                {ball(i)}
                <div className="row-name">{p.name}</div>

                <div className="row-score">
                  <span className={`score ${scoreTone(p.score)}`}>{fmt(p.score)}</span>
                  <span className="pending-slot">{pendingChip(p.id)}</span>
                </div>

                <div className="row-actions">{scoreButtons(p.id, p.name)}</div>
                {removeButton(p.id, p.name)}
              </div>
            ))}
          </div>
        )}

        {/* ===== LƯỚI ===== */}
        {isGridView && players.length > 0 && (
          <div className="grid">
            {players.map((p, i) => (
              <div key={p.id} className="card">
                {removeButton(p.id, p.name)}
                {ball(i)}
                <p className="card-name">{p.name}</p>

                <div className="card-score">
                  <span className={`score score-lg ${scoreTone(p.score)}`}>{fmt(p.score)}</span>
                  <span className="pending-slot pending-slot-center">{pendingChip(p.id)}</span>
                </div>

                <div className="card-actions">{scoreButtons(p.id, p.name)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
