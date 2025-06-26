const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export async function fetchStockQuote(
  symbol: string
): Promise<StockQuote | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) return null;

    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
    };
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
}

export const fetchLiveQuote = async (symbol: string) => {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const quote = data["Global Quote"];

    // 🛡️ SAFETY CHECK
    if (!quote || !quote["01. symbol"]) {
      console.warn("No quote returned for symbol:", symbol, data);
      return null; // return null or fallback value
    }

    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      volume: parseInt(quote["06. volume"]),
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("API error for symbol:", symbol, error);
    return null; // fallback or mock logic can be placed here
  }
};

export const fetchHistoricalDaily = async (symbol: string) => {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data["Note"]) {
      // API rate limit message
      console.warn("Alpha Vantage API rate limit hit:", data["Note"]);
      return [];
    }

    if (data["Error Message"]) {
      // Invalid API call or symbol
      console.warn("Alpha Vantage API error:", data["Error Message"]);
      return [];
    }

    const series = data["Time Series (Daily)"];

    if (!series || typeof series !== "object") {
      console.warn("No daily time series data available for:", symbol, data);
      return [];
    }

    return Object.entries(series).map(([date, value]: any) => ({
      date,
      close: parseFloat(value["4. close"]),
    }));
  } catch (error) {
    console.error("Failed to fetch historical daily data:", error);
    return [];
  }
};
