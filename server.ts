process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // CORS Bypass Proxy for public m3u8 playlists
  app.get("/api/proxy-m3u8", async (req, res) => {
    const streamUrl = req.query.url as string;
    if (!streamUrl) {
      return res.status(400).send("Missing 'url' query parameter");
    }

    try {
      console.log(`[m3u8 Proxy] Fetching: ${streamUrl}`);
      const response = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': '*/*',
        }
      });

      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch stream: Status ${response.status}`);
      }

      const text = await response.text();
      
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Cache-Control", "no-cache");

      const parsedUrl = new URL(streamUrl);
      const baseUrl = parsedUrl.origin + parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1);

      const rewrittenLines = text.split(/\r?\n/).map(line => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith('#')) return trimmed;
        
        let absoluteUrl = trimmed;
        try {
          if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            if (trimmed.startsWith('/')) {
              absoluteUrl = parsedUrl.origin + trimmed;
            } else {
              absoluteUrl = baseUrl + trimmed;
            }
          }
        } catch (e) {
          absoluteUrl = trimmed;
        }

        // Recursively proxy nested m3u8 playlists
        if (absoluteUrl.includes('.m3u8')) {
          return `/api/proxy-m3u8?url=${encodeURIComponent(absoluteUrl)}`;
        }

        return absoluteUrl;
      });

      res.send(rewrittenLines.join("\n"));
    } catch (err: any) {
      console.warn(`[m3u8 Proxy] Error fetching stream (${streamUrl}):`, err.message || err);
      if (err.code === 'ENOTFOUND' || err.message?.includes('getaddrinfo') || err.message?.includes('fetch failed')) {
        return res.status(502).send(`Error proxying stream: Host resolution failed (ENOTFOUND). The channel stream is currently offline.`);
      }
      res.status(500).send(`Error proxying stream: ${err.message}`);
    }
  });

  // Stream Health Check Endpoint
  app.post("/api/check-health", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      let response;
      try {
        response = await fetch(url, {
          method: "HEAD",
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': '*/*',
          },
          signal: controller.signal
        });
      } catch (headErr) {
        // Fallback to GET if HEAD failed/is not allowed by server
        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 6000);
        response = await fetch(url, {
          method: "GET",
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': '*/*',
          },
          signal: fallbackController.signal
        });
        clearTimeout(fallbackTimeoutId);
      }

      clearTimeout(timeoutId);

      if (response && response.ok) {
        return res.json({ status: "online", statusCode: response.status });
      } else {
        return res.json({ 
          status: "offline", 
          statusCode: response ? response.status : 0, 
          error: response ? `Status ${response.status}` : "No response" 
        });
      }
    } catch (err: any) {
      console.warn(`[Health Check] Error checking: ${url}`, err.message);
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        return res.json({ status: "offline", statusCode: 408, error: "Timeout (6 seconds)" });
      }
      return res.json({ status: "offline", statusCode: 500, error: err.message || "Failed to reach host" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Skhanda TV running on http://localhost:${PORT}`);
  });
}

startServer();
