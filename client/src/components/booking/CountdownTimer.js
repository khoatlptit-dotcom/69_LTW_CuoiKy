import useCountdown from '../../hooks/useCountdown';

const pad = (n) => String(n).padStart(2, '0');

const CountdownTimer = ({ expiresAt, offsetMs, onExpire }) => {
  const left = useCountdown(expiresAt, offsetMs, onExpire);
  if (left === null) return null;

  const urgent = left <= 60;
  return (
    <div className={`countdown${urgent ? ' countdown--urgent' : ''}`} role="timer">
      <span className="countdown__label">Thời gian giữ ghế còn lại</span>
      <strong className="countdown__time">
        {pad(Math.floor(left / 60))}:{pad(left % 60)}
      </strong>
    </div>
  );
};

export default CountdownTimer;