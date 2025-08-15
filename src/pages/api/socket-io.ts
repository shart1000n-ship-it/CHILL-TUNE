import type { NextApiRequest, NextApiResponse } from "next";
import type { JWT } from "next-auth/jwt";
import { Server as IOServer } from "socket.io";
import { getToken } from "next-auth/jwt";
import type { Server as HTTPServer } from "http";

type SocketServer = HTTPServer & { io?: IOServer };
type NextApiResponseWithSocket = NextApiResponse & { socket: NextApiResponse["socket"] & { server: HTTPServer } };

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (process.env.DISABLE_SOCKET_IO === "true" || process.env.VERCEL === "1") {
    return res.status(404).json({ error: "Socket.IO disabled in this environment" });
  }
  const httpServer = res.socket.server as unknown as SocketServer;
  if (!httpServer.io) {
    const io = new IOServer(httpServer, {
      path: "/api/socket-io",
      addTrailingSlash: false,
      cors: { origin: true, methods: ["GET", "POST"] },
    });
    httpServer.io = io;

    io.on("connection", async (socket) => {
      const token = await getToken({ req: socket.request as unknown as NextApiRequest });
      const userName = (typeof token?.name === "string" ? token.name : undefined) || "Guest";

      const userImage = (token && typeof (token as JWT).picture === "string") ? ((token as JWT).picture as string) : undefined;

      socket.on(
        "chat:send",
        (payload: { text?: string; emoji?: string; name?: string } | undefined) => {
          const displayName = (payload?.name && String(payload.name).slice(0, 40)) || userName || "Guest";
          const message = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            userName: displayName,
            userImage: userImage ?? null,
            text: payload?.text,
            emoji: payload?.emoji,
            createdAt: Date.now(),
          };
          io.emit("chat:message", message);
        }
      );
    });
  }

  res.end();
}



