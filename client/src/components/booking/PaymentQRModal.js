import { useState } from "react";
import { PAYMENT } from "../../config/payment";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

const PaymentQRModal = ({ booking, busy, error, onDone, onCancel }) => {
  const [imgError, setImgError] = useState(false);
  const code = `DATVE ${String(booking._id).slice(-6).toUpperCase()}`;
  const qrUrl =
    `https://img.vietqr.io/image/${PAYMENT.bankId}-${PAYMENT.accountNo}-compact2.png` +
    `?amount=${booking.totalPrice}` +
    `&addInfo=${encodeURIComponent(code)}` +
    `&accountName=${encodeURIComponent(PAYMENT.accountName)}`;

  return (
    <div className="payment-modal" role="dialog" aria-modal="true">
      <div className="payment-modal__box">
        <h2>Thanh toán đặt vé</h2>
        {imgError ? (
          <p>Không tải được mã QR. Vui lòng kiểm tra kết nối mạng.</p>
        ) : (
          <img
            className="payment-modal__qr"
            src={qrUrl}
            alt="Mã QR thanh toán"
            onError={() => setImgError(true)}
          />
        )}
        <p>
          Số tiền: <strong>{formatCurrency(booking.totalPrice)}</strong>
        </p>
        <p>
          Ghế: <strong>{booking.seats.join(", ")}</strong>
        </p>
        <p>
          Nội dung chuyển khoản: <strong>{code}</strong>
        </p>

        {error && <p className="payment-modal__error">{error}</p>}

        <div className="payment-modal__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onDone}
            disabled={busy}
          >
            Tôi đã thanh toán
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onCancel}
            disabled={busy}
          >
            {busy ? "Đang hủy..." : "Hủy đặt vé"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentQRModal;
