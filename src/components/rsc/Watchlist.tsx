import { useEffect } from "react";
import { Star, TrendingUp, TrendingDown, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStockStore } from "@/stores/stockStore";
import { cn } from "@/lib/utils";

export const Watchlist = () => {
  const {
    watchlist,
    removeFromWatchlist,
    updateStockPrices,
    fetchWatchlistData,
  } = useStockStore();

  useEffect(() => {
    const interval = setInterval(() => {
      if (watchlist.length > 0) {
        updateStockPrices();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [watchlist.length, updateStockPrices]);

  const handleRefresh = () => {
    fetchWatchlistData();
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 sticky top-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <CardTitle className="text-white">Watchlist</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-gray-400 text-sm">
          {watchlist.length} {watchlist.length === 1 ? "stock" : "stocks"}{" "}
          tracked
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {watchlist.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No stocks in watchlist</p>
            <p className="text-gray-500 text-xs mt-1">
              Add stocks to track them here
            </p>
          </div>
        ) : (
          watchlist.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div
                key={stock.symbol}
                className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white text-sm">
                        {stock.symbol}
                      </span>
                      <div
                        className={cn(
                          "p-0.5 rounded-full",
                          isPositive ? "bg-green-500/20" : "bg-red-500/20"
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-2.5 w-2.5 text-green-400" />
                        ) : (
                          <TrendingDown className="h-2.5 w-2.5 text-red-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs truncate">
                      {stock.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWatchlist(stock.symbol)}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-end">
                    <span className="text-white font-semibold">
                      ${stock.price.toFixed(2)}
                    </span>
                    <div className="text-right">
                      <div
                        className={cn(
                          "text-xs font-medium",
                          isPositive ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {isPositive ? "+" : ""}
                        {stock.change.toFixed(2)}
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          isPositive ? "text-green-400" : "text-red-400"
                        )}
                      >
                        ({isPositive ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Vol: {(stock.volume / 1e6).toFixed(1)}M</span>
                    <span>
                      {new Date(stock.lastUpdate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
