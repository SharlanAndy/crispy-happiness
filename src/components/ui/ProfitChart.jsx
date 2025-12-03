import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-neutral-200">
        <p className="text-base font-medium text-black mb-1">{payload[0].payload.time}</p>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-sm bg-[#3B82F6]" />
          <span className="text-sm text-neutral-600">Profit</span>
          <span className="text-base font-medium text-black">{payload[0].value} U</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ProfitChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300} minHeight={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#999999', fontSize: 14 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#999999', fontSize: 14 }}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="profit"
          stroke="#3B82F6"
          strokeWidth={3}
          fill="url(#colorProfit)"
          dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, fill: '#3B82F6' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
