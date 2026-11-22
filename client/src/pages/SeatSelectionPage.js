import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSeatMap, holdSeats, releaseSeats } from '../api/seatApi';
import { MAX_SEATS, clearSeats, setSelected, startSession, toggleSeat } from '../store/seatSlice';
import useShowtimeSocket from '../hooks/useShowtimeSocket';
import SeatMap from '../components/seat/SeatMap';
import SeatLegend from '../components/seat/SeatLegend';
import CountdownTimer from '../components/booking/CountdownTimer';
import BookingSummary from '../components/booking/BookingSummary';
import '../styles/seat.css';

const REFRESH_DELAY_MS = 150;

const SeatSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.seats.selected);

  const [data, setData] = useState(null); // { showtime, room, seats }
  const [hold, setHold] = useState(null); // { expiresAt, offsetMs }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const holdRef = useRef(null); // phiên giữ ghế gần nhất đã biết từ server
  const busyRef = useRef(false);
  const refreshTimerRef = useRef(null);

  const setBusyFlag = (value) => {
    busyRef.current = value;
    setBusy(value);
  };

  // Server là nguồn dữ liệu chính xác: tải lại sơ đồ và phiên giữ ghế từ server.
  const loadMap = useCallback(async () => {
    const res = await getSeatMap(id);
    const { showtime, room, seats, hold: serverHold, serverTime } = res.data;
    const previousHold = holdRef.current;
    setData({ showtime, room, seats });

    if (serverHold) {
      const byId = new Map(seats.map((seat) => [seat.seatNumber, seat]));
      dispatch(
        setSelected(
          serverHold.seatNumbers.map((seatNumber) => ({
            id: seatNumber,
            type: byId.get(seatNumber)?.type ?? 'normal',
            price: byId.get(seatNumber)?.price ?? 0,
          }))
        )
      );
      holdRef.current = { expiresAt: serverHold.expiresAt };
      setHold({
        expiresAt: serverHold.expiresAt,
        offsetMs: new Date(serverTime).getTime() - Date.now(),
      });
      return;
    }

    dispatch(clearSeats());
    setHold(null);
    holdRef.current = null;

    // Phiên giữ ghế vừa hết hạn trên server (server dọn trước khi đồng hồ về 0):
    // đưa người dùng về trang phim như khi đồng hồ về 0.
    if (
      previousHold &&
      new Date(previousHold.expiresAt).getTime() <= new Date(serverTime).getTime() + 2000
    ) {
      navigate(showtime.movie ? `/movies/${showtime.movie}` : '/', { replace: true });
    }
  }, [id, dispatch, navigate]);

  useEffect(() => {
    let cancelled = false;
    holdRef.current = null;
    dispatch(startSession(id));
    setLoading(true);
    setError('');

    loadMap()
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Không tải được sơ đồ ghế');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, dispatch, loadMap, reloadKey]);

  // Cập nhật theo thời gian thực: có người giữ, hủy giữ, đặt vé hoặc hủy vé trong suất chiếu này.
  const scheduleRefresh = useCallback(() => {
    if (busyRef.current) return; // thao tác của chính mình sẽ tự tải lại sơ đồ
    clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      loadMap().catch(() => {});
    }, REFRESH_DELAY_MS);
  }, [loadMap]);

  useEffect(() => () => clearTimeout(refreshTimerRef.current), []);

  useShowtimeSocket(id, {
    'seat:held': scheduleRefresh,
    'seat:released': scheduleRefresh,
    'seat:booked': scheduleRefresh,
    'seat:cancelled': scheduleRefresh,
    onConnect: scheduleRefresh,
  });

  const selectedIds = useMemo(() => new Set(selected.map((seat) => seat.id)), [selected]);
  const total = useMemo(() => selected.reduce((sum, seat) => sum + seat.price, 0), [selected]);

  const movieId = data?.showtime?.movie;
  const handleExpire = useCallback(() => {
    dispatch(clearSeats());
    setHold(null);
    holdRef.current = null;
    navigate(movieId ? `/movies/${movieId}` : '/', { replace: true });
  }, [dispatch, navigate, movieId]);

  const handleToggle = async (seat) => {
    if (busy) return;

    const exists = selected.some((item) => item.id === seat.seatNumber);
    if (!exists && selected.length >= MAX_SEATS) {
      setNotice({ type: 'error', text: `Chỉ được chọn tối đa ${MAX_SEATS} ghế` });
      return;
    }

    const item = { id: seat.seatNumber, type: seat.type, price: seat.price };
    const nextIds = exists
      ? selected.filter((s) => s.id !== item.id).map((s) => s.id)
      : [...selected.map((s) => s.id), item.id];

    dispatch(toggleSeat(item));
    setNotice(null);
    setBusyFlag(true);
    try {
      if (nextIds.length === 0) await releaseSeats(id);
      else await holdSeats(id, nextIds);
      await loadMap();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Không giữ được ghế' });
      try {
        await loadMap(); // trả lại đúng trạng thái trên server
      } catch {
        /* giữ nguyên thông báo lỗi ở trên */
      }
    } finally {
      setBusyFlag(false);
    }
  };

  const handleClear = async () => {
    if (busy) return;
    setNotice(null);
    setBusyFlag(true);
    try {
      await releaseSeats(id);
      await loadMap();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Không hủy được phiên giữ ghế' });
    } finally {
      setBusyFlag(false);
    }
  };

  if (loading) {
    return (
      <main className="seat-page">
        <p className="seat-page__state">Đang tải sơ đồ ghế...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="seat-page">
        <div className="seat-page__state seat-page__state--error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--primary" onClick={() => setReloadKey((k) => k + 1)}>
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  if (!data || data.seats.length === 0) {
    return (
      <main className="seat-page">
        <p className="seat-page__state">Phòng chiếu này chưa có ghế.</p>
      </main>
    );
  }

  return (
    <main className="seat-page">
      <header className="seat-page__header">
        <h1>Chọn ghế</h1>
        <CountdownTimer expiresAt={hold?.expiresAt} offsetMs={hold?.offsetMs} onExpire={handleExpire} />
      </header>

      {notice && (
        <p className={`notice notice--${notice.type}`} role="alert">
          {notice.text}
        </p>
      )}

      <div className="seat-page__layout">
        <section className="seat-page__map">
          <SeatMap seats={data.seats} selectedIds={selectedIds} disabled={busy} onToggle={handleToggle} />
          <SeatLegend />
        </section>

        <BookingSummary
          showtime={data.showtime}
          room={data.room}
          selected={selected}
          total={total}
          maxSeats={MAX_SEATS}
          busy={busy}
          onClear={handleClear}
        />
      </div>
    </main>
  );
};

export default SeatSelectionPage;