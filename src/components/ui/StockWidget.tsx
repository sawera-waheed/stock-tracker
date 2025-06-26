"use client";

import { useEffect, useState } from "react";
import { fetchLiveQuote, fetchHistoricalDaily } from "@/lib/stockApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type LiveData = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

type HistoricalData = {
  date: string;
  close: number;
};

export const StockWidget = ({ symbol = "AAPL" }: { symbol?: string }) => {
  const [live, setLive] = useState<LiveData | null>(null);
  const [history, setHistory] = useState<HistoricalData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [liveData, historicalData] = await Promise.all([
          fetchLiveQuote(symbol),
          fetchHistoricalDaily(symbol),
        ]);
        setLive(liveData);
        setHistory(historicalData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stock data.");
      }
    };

    load();
    const interval = setInterval(load, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, [symbol]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!live || history.length === 0)
    return <div className="text-gray-400">Loading...</div>;

  const isPositive = live.change >= 0;

  return (
    <div className="bg-gray-900 p-6 rounded-xl text-white shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">
        📈 {live.symbol} Stock Overview
      </h2>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-3xl font-bold">${live.price.toFixed(2)}</p>
          <p className={isPositive ? "text-green-400" : "text-red-400"}>
            {isPositive ? "+" : ""}
            {live.change.toFixed(2)} ({live.changePercent.toFixed(2)}%)
          </p>
        </div>
        <span className="text-sm text-gray-400">Updated every 15s</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
