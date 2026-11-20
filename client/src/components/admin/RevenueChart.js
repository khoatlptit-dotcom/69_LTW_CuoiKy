import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { formatPrice } from '../../utils/format';

const RevenueChart = ({ data, xKey, type = 'bar' }) => {
  if (!data?.length) return <p>Chưa có dữ liệu trong khoảng thời gian này</p>;
  const Chart = type === 'line' ? LineChart : BarChart;

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip formatter={(v) => formatPrice(v)} />
          {type === 'line' ? (
            <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2563eb" />
          ) : (
            <Bar dataKey="revenue" name="Doanh thu" fill="#2563eb" />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;