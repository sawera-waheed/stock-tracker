import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Check,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStockStore, Stock } from "@/stores/stockStore";
import { cn } from "@/lib/utils";

interface StockCardProps {
  stock: Stock;
}

export const StockCard = ({ stock }: StockCardProps) => {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useStockStore();
  const [isAdding, setIsAdding] = useState(false);

  const isInWatchlist = watchlist.some((s) => s.symbol === stock.symbol);
  const isPositive = stock.change >= 0;

  const handleWatchlistToggle = async () => {
    setIsAdding(true);

    if (isInWatchlist) {
      removeFromWatchlist(stock.symbol);
    } else {
      addToWatchlist(stock);
    }

    // Simulate async operation
    setTimeout(() => setIsAdding(false), 300);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <Card className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-white text-lg">{stock.symbol}</h3>
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
            <p className="text-gray-400 text-sm font-medium">{stock.name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWatchlistToggle}
            disabled={isAdding}
            className={cn(
              "h-8 w-8 p-0 transition-colors",
              isInWatchlist
                ? "text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            )}
          >
            {isAdding ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isInWatchlist ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-2xl font-bold text-white">
                  ${stock.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive ? "text-green-400" : "text-red-400"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {stock.change.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isPositive ? "text-green-400" : "text-red-400"
                  )}
                >
                  ({isPositive ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-gray-400 text-xs">
                <BarChart3 className="h-3 w-3" />
                <span>Vol: {(stock.volume / 1e6).toFixed(1)}M</span>
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Cap: {formatNumber(stock.marketCap)}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-700">
            <div className="flex justify-between text-xs text-gray-400">
              <span>52W Low: ${stock.low52Week.toFixed(2)}</span>
              <span>52W High: ${stock.high52Week.toFixed(2)}</span>
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      ((stock.price - stock.low52Week) /
                        (stock.high52Week - stock.low52Week)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
