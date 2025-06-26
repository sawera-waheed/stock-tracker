"use client";

import { useEffect, useState } from "react";
import { Globe, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fetchStockQuote } from "@/lib/stockApi";
import StockTrendWidget from "@/components/ui/StockTrendWidget";

interface MarketIndex {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const indexMap = [
  { symbol: "IBM", name: "IBM" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "TSLA", name: "Tesla" },
];

export const MarketOverview = () => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const results = await Promise.all(
        indexMap.map(async (item) => {
          const data = await fetchStockQuote(item.symbol);
          return {
            name: item.name,
            symbol: item.symbol,
            ...data,
          };
        })
      );

      const validResults = results
        .filter(
          (r) =>
            typeof r.price === "number" &&
            typeof r.change === "number" &&
            typeof r.changePercent === "number"
        )
        .map((r) => ({
          ...r,
          price: r.price!,
          change: r.change!,
          changePercent: r.changePercent!,
        }));

      setIndices(validResults);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load market data.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Globe className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Market Overview
            </h2>
            <p className="text-gray-400 text-sm">Major indices performance</p>
          </div>
          <div className="ml-auto flex items-center space-x-2 text-green-400">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((index) => {
            const isPositive = index.change >= 0;
            return (
              <div
                key={index.symbol}
                className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm">
                    {index.name}
                  </span>
                  <div
                    className={cn(
                      "p-1 rounded-full",
                      isPositive ? "bg-green-500/20" : "bg-red-500/20"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-1 mb-2">
                  <div className="text-white font-bold text-lg">
                    {index.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isPositive ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {index.change.toFixed(2)}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        isPositive ? "text-green-400" : "text-red-400"
                      )}
                    >
                      ({isPositive ? "+" : ""}
                      {index.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Mini trend widget */}
                <StockTrendWidget symbol={index.symbol} isMini />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
