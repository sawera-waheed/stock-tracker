import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  lastUpdate: string;
}

interface HistoricalDataPoint {
  date: string;
  close: number;
}

interface MovingAveragePoint {
  date: string;
  average: number;
}

interface StockStore {
  searchResults: Stock[];
  watchlist: Stock[];
  marketIndices: Stock[];
  isLoading: boolean;
  error: string | null;

  // Historical data & analysis
  historicalData: HistoricalDataPoint[];
  movingAverages: MovingAveragePoint[];
  trend: "uptrend" | "downtrend" | "sideways" | "insufficient data" | null;

  searchStocks: (query: string) => Promise<void>;
  fetchHistoricalData: (symbol: string) => Promise<void>;

  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (symbol: string) => void;
  fetchWatchlistData: () => Promise<void>;
  updateStockPrices: () => Promise<void>;
}

// Mock data helpers (same as before)
const mockStockData: { [key: string]: string } = {
  AAPL: "Apple Inc.",
  GOOGL: "Alphabet Inc.",
  MSFT: "Microsoft Corporation",
  TSLA: "Tesla Inc.",
  AMZN: "Amazon.com Inc.",
  META: "Meta Platforms Inc.",
  NVDA: "NVIDIA Corporation",
  NFLX: "Netflix Inc.",
  AMD: "Advanced Micro Devices",
  UBER: "Uber Technologies",
  SPOT: "Spotify Technology",
  COIN: "Coinbase Global",
  SQ: "Block Inc.",
  PYPL: "PayPal Holdings",
  ZOOM: "Zoom Video Communications",
};

const generateMockStock = (symbol: string, name: string): Stock => {
  const basePrice = Math.random() * 500 + 50;
  const change = (Math.random() - 0.5) * 20;
  const changePercent = (change / basePrice) * 100;

  return {
    symbol,
    name,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(Math.random() * 1000000000000) + 10000000000,
    high52Week: parseFloat((basePrice * (1 + Math.random() * 0.5)).toFixed(2)),
    low52Week: parseFloat((basePrice * (1 - Math.random() * 0.3)).toFixed(2)),
    lastUpdate: new Date().toISOString(),
  };
};

// Utility: Fetch historical daily data safely with fallback
const fetchHistoricalDaily = async (
  symbol: string
): Promise<HistoricalDataPoint[]> => {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data["Note"]) {
      console.warn("Alpha Vantage rate limit hit:", data["Note"]);
      return [];
    }
    if (data["Error Message"]) {
      console.warn("Alpha Vantage error:", data["Error Message"]);
      return [];
    }

    const series = data["Time Series (Daily)"];
    if (!series || typeof series !== "object") {
      console.warn("No daily time series for", symbol);
      return [];
    }

    // Return sorted oldest to newest (AlphaVantage returns newest first)
    const entries = Object.entries(series)
      .map(([date, val]: [string, any]) => ({
        date,
        close: parseFloat(val["4. close"]),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return entries;
  } catch (err) {
    console.error("Failed fetching historical data", err);
    return [];
  }
};

// Utility: Calculate moving average
const movingAverage = (
  data: HistoricalDataPoint[],
  windowSize: number
): MovingAveragePoint[] => {
  const averages: MovingAveragePoint[] = [];
  if (data.length < windowSize) return averages;

  for (let i = 0; i <= data.length - windowSize; i++) {
    const windowSlice = data.slice(i, i + windowSize);
    const sum = windowSlice.reduce((acc, val) => acc + val.close, 0);
    averages.push({
      date: windowSlice[windowSize - 1].date,
      average: parseFloat((sum / windowSize).toFixed(2)),
    });
  }
  return averages;
};

// Utility: Detect trend (compare avg of first & last period)
const detectTrend = (
  data: HistoricalDataPoint[],
  period: number
): "uptrend" | "downtrend" | "sideways" | "insufficient data" => {
  if (data.length < period * 2) return "insufficient data";

  const startAvg =
    data.slice(0, period).reduce((acc, val) => acc + val.close, 0) / period;
  const endAvg =
    data.slice(data.length - period).reduce((acc, val) => acc + val.close, 0) /
    period;

  const diffPercent = ((endAvg - startAvg) / startAvg) * 100;
  if (diffPercent > 2) return "uptrend";
  if (diffPercent < -2) return "downtrend";
  return "sideways";
};

export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
      searchResults: [],
      watchlist: [],
      marketIndices: [],
      isLoading: false,
      error: null,

      historicalData: [],
      movingAverages: [],
      trend: null,

      searchStocks: async (query: string) => {
        set({ isLoading: true, error: null });
        const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
        const symbols = query.split(",").map((s) => s.trim().toUpperCase());
        const results: Stock[] = [];

        const fallbackToMock = (symbol: string) => {
          const name = mockStockData[symbol] || symbol;
          results.push(generateMockStock(symbol, name));
        };

        try {
          for (const symbol of symbols) {
            const res = await fetch(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
            );
            const data = await res.json();

            const quote = data["Global Quote"];
            if (quote && quote["01. symbol"]) {
              results.push({
                symbol: quote["01. symbol"],
                name: quote["01. symbol"],
                price: parseFloat(quote["05. price"]),
                change: parseFloat(quote["09. change"]),
                changePercent: parseFloat(
                  quote["10. change percent"].replace("%", "")
                ),
                volume: parseInt(quote["06. volume"]),
                marketCap: 0,
                high52Week: 0,
                low52Week: 0,
                lastUpdate: new Date().toISOString(),
              });
            } else {
              fallbackToMock(symbol);
            }
          }

          set({ searchResults: results, isLoading: false });
        } catch (error) {
          symbols.forEach(fallbackToMock);
          set({
            searchResults: results,
            isLoading: false,
            error: "API failed or rate limit hit — showing mock data.",
          });
        }
      },

      fetchHistoricalData: async (symbol: string) => {
        set({ isLoading: true, error: null });

        const data = await fetchHistoricalDaily(symbol);
        if (data.length === 0) {
          set({
            historicalData: [],
            movingAverages: [],
            trend: null,
            isLoading: false,
          });
          return;
        }

        const ma5 = movingAverage(data, 5);
        const trend = detectTrend(data, 10);

        set({
          historicalData: data,
          movingAverages: ma5,
          trend,
          isLoading: false,
        });
      },

      addToWatchlist: (stock: Stock) => {
        const { watchlist } = get();
        if (!watchlist.find((s) => s.symbol === stock.symbol)) {
          set({ watchlist: [...watchlist, stock] });
        }
      },

      removeFromWatchlist: (symbol: string) => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter((s) => s.symbol !== symbol) });
      },

      fetchWatchlistData: async () => {
        const { watchlist, searchStocks } = get();
        if (watchlist.length === 0) return;

        const symbols = watchlist.map((s) => s.symbol).join(",");
        await searchStocks(symbols);

        const { searchResults } = get();
        const updatedWatchlist = watchlist.map((watchedStock) => {
          const freshData = searchResults.find(
            (s) => s.symbol === watchedStock.symbol
          );
          return freshData || watchedStock;
        });

        set({ watchlist: updatedWatchlist });
      },

      updateStockPrices: async () => {
        const { searchResults, watchlist } = get();

        const updatedResults = searchResults.map((stock) => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: stock.change + (Math.random() - 0.5) * 0.5,
          lastUpdate: new Date().toISOString(),
        }));

        const updatedWatchlist = watchlist.map((stock) => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: stock.change + (Math.random() - 0.5) * 0.5,
          lastUpdate: new Date().toISOString(),
        }));

        set({ searchResults: updatedResults, watchlist: updatedWatchlist });
      },
    }),
    {
      name: "stock-store",
      partialize: (state) => ({ watchlist: state.watchlist }),
    }
  )
);
