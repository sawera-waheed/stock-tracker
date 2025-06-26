"use client";

import { useEffect } from "react";
import { useStockStore } from "@/stores/stockStore";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  symbol: string;
  isMini?: boolean; // default false - full detailed view
}

const StockTrendWidget = ({ symbol, isMini = false }: Props) => {
  const {
    historicalData,
    movingAverages,
    trend,
    fetchHistoricalData,
    isLoading,
  } = useStockStore();

  useEffect(() => {
    if (symbol) {
      fetchHistoricalData(symbol);
    }
  }, [symbol, fetchHistoricalData]);

  // Determine trend color & icon
  const trendColor =
    trend === "uptrend"
      ? "text-green-400"
      : trend === "downtrend"
      ? "text-red-400"
      : trend === "sideways"
      ? "text-yellow-400"
      : "text-gray-400";

  const TrendIcon =
    trend === "uptrend"
      ? ArrowUpRight
      : trend === "downtrend"
      ? ArrowDownRight
      : trend === "sideways"
      ? Minus
      : Minus;

  // Mini mode: show simplified sparkline using Recharts with tooltip
  if (isMini) {
    if (isLoading) {
      return (
        <div className="h-16 flex items-center justify-center text-gray-400">
          Loading...
        </div>
      );
    }

    if (!historicalData.length) {
      return (
        <div className="h-16 flex items-center justify-center text-gray-400">
          No data
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={64}>
        <LineChart data={historicalData}>
          <XAxis dataKey="date" hide={true} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              borderColor: "#374151",
              color: "white",
              fontSize: 12,
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Close"]}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Full detailed mode
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Trend Analysis</h2>
      </div>

      {isLoading ? (
        <p className="text-gray-400">Loading trend data...</p>
      ) : !historicalData.length ? (
        <p className="text-gray-400">No historical data found for {symbol}</p>
      ) : (
        <>
          <div className="flex items-center space-x-2 mb-4">
            <TrendIcon className={cn("h-5 w-5", trendColor)} />
            <span className={cn("font-medium", trendColor)}>
              {trend ? trend.charAt(0).toUpperCase() + trend.slice(1) : "N/A"}
            </span>
          </div>

          <h3 className="text-white font-semibold mb-2 text-sm">
            5-Day Moving Average
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movingAverages}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#aaa" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "white",
                  }}
                  labelStyle={{ color: "#93c5fd" }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default StockTrendWidget;
