
interface ChartDataPoint {
    label: string;
    value: number;
    secondaryValue?: number;
}

interface HeartRateChartProps {
    data: number[];
    color?: string;
}

export function HeartRateChart({ data, color = "#6366f1" }: HeartRateChartProps) {
    if (!data || data.length === 0) return null;

    // Sampling to reduce DOM nodes if too many points (e.g. > 200)
    const MAX_POINTS = 200;
    const step = Math.ceil(data.length / MAX_POINTS);
    const sampledData = data.filter((_, i) => i % step === 0);

    const maxVal = Math.max(...sampledData);
    const minVal = Math.min(...sampledData);
    const range = maxVal - minVal || 1;

    // SVG scaling
    const points = sampledData.map((val, i) => {
        const x = (i / (sampledData.length - 1)) * 100;
        const y = 100 - ((val - minVal) / range) * 80 - 10; // keep padding
        return `${x},${y}`;
    }).join(' ');

    const fillPolygon = `0,100 ${points} 100,100`;

    return (
        <div className="w-full h-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={fillPolygon} fill="url(#hrGradient)" />
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute top-0 right-0 text-[10px] font-bold text-slate-300">Max: {maxVal}</div>
            <div className="absolute bottom-0 right-0 text-[10px] font-bold text-slate-300">Min: {minVal}</div>
        </div>
    );
}

export function LineChart({ data, color = "#6366f1" }: { data: ChartDataPoint[], color?: string }) {
    if (!data || data.length === 0) return <div className="text-slate-400 text-xs text-center p-4">Ingen data</div>;

    const values = data.map(d => d.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const range = (maxVal - minVal) || 1;
    const paddedMax = maxVal + range * 0.1;
    const paddedMin = Math.max(0, minVal - range * 0.1);
    const finalRange = paddedMax - paddedMin || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - paddedMin) / finalRange) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

                <polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />
            </svg>
            <div className="absolute top-0 right-0 text-[10px] font-bold text-slate-400 bg-white/80 px-1 rounded">Max: {maxVal}</div>
            <div className="absolute inset-x-0 bottom-0 h-8 flex items-end justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[10px] text-slate-400">{data[0].label}</span>
                <span className="text-[10px] text-slate-400">{data[data.length - 1].label}</span>
            </div>
        </div>
    );
}

export function BarChart({ data, color = "#6366f1" }: { data: ChartDataPoint[], color?: string }) {
    if (!data || data.length === 0) return <div className="text-slate-400 text-xs text-center p-4">Ingen data</div>;

    const values = data.map(d => d.value);
    const maxVal = Math.max(...values);

    return (
        <div className="w-full h-full flex items-end justify-between gap-1 pt-4">
            {data.map((d, i) => {
                const height = (d.value / maxVal) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                        <div
                            style={{ height: `${height}%`, backgroundColor: color }}
                            className="w-full rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                        ></div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 w-max">
                            <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-50">
                                {d.value}
                                <div className="text-[8px] font-normal opacity-70">{d.label}</div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
