"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/rsc/SearchBar";
import { StockCard } from "@/components/rsc/StockCard";
import { Watchlist } from "@/components/rsc/Watchlist";
import { MarketOverview } from "@/components/rsc/MarketOverview";
import { useStockStore } from "@/stores/stockStore";
import { TrendingUp, Activity, Eye } from "lucide-react";
import { StockWidget } from "@/components/ui/StockWidget";
import StockTrendWidget from "@/components/ui/StockTrendWidget";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { LogoutButton } from "@/components/ui/LogoutButton";
const Index = () => {
  const { searchResults, watchlist, searchStocks, fetchWatchlistData } =
    useStockStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSymbol, setActiveSymbol] = useState<string>("IBM");

  useEffect(() => {
    fetchWatchlistData();
    searchStocks("AAPL,GOOGL,MSFT,TSLA,AMZN");
  }, [fetchWatchlistData, searchStocks]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      searchStocks(query).then(() => {
        const results = useStockStore.getState().searchResults;
        if (results.length > 0) {
          setActiveSymbol(results[0].symbol);
        }
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    StockTracker Pro
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Real-time market intelligence
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Markets Open</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Search Section */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Search Stocks
                  </h2>
                </div>
                <SearchBar onSearch={handleSearch} />
              </div>

              {/* Market Overview with multiple mini trend widgets */}
              <MarketOverview />

              {/* Trend Analysis - detailed for active symbol */}
              <StockTrendWidget symbol={activeSymbol} />

              {/* Individual Stock Widget */}
              <StockWidget symbol={activeSymbol} />

              {/* Search Results or Popular Stocks */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : "Popular Stocks"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((stock) => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Watchlist */}
            <div className="lg:col-span-1">
              <Watchlist />
            </div>
          </div>
        </div>
      </div>
      <LogoutButton />
    </ProtectedRoute>
  );
};

export default Index;
