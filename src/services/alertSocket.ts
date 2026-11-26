import { Alert, NodeStatus } from '../types';
import { ENV } from '../config/env';
import { getAuthToken } from './secureStore';

export interface WsLevelUpdatePayload {
  tankId: string;
  levelPercent: number;
  volumeLiters: number;
  distanceCm?: number | null;
  rssi?: number | null;
  recordedAt: string;
}

export interface WsNodeStatusPayload {
  nodeCode?: string;
  tankId?: string;
  status?: NodeStatus;
  rssi?: number | null;
  lastSeen?: string;
}

type AlertSocketEvent =
  | { type: 'ALERT_TRIGGERED'; data: Alert }
  | { type: 'ALERT_RESOLVED'; data: { id: number } }
  | { type: 'LEVEL_UPDATE'; data: WsLevelUpdatePayload }
  | { type: 'NODE_STATUS'; data: WsNodeStatusPayload };

interface AlertSocketHandlers {
  token?: string | null;
  onAlert: (alert: Alert) => void;
  onResolved?: (alertId: number) => void;
  onLevelUpdate?: (update: WsLevelUpdatePayload) => void;
  onNodeStatus?: (update: WsNodeStatusPayload) => void;
  onError?: () => void;
}

function parseEvent(rawMessage: string): AlertSocketEvent | null {
  try {
    const parsed: unknown = JSON.parse(rawMessage);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const event = parsed as { type?: unknown; data?: Record<string, unknown>; timestamp?: unknown };
    const data = event.data;
    if (typeof data !== 'object' || data === null) return null;

    if (event.type === 'ALERT_TRIGGERED') {
      return {
        type: 'ALERT_TRIGGERED',
        data: {
          id: Number(data.id),
          tankId: String(data.tankId ?? data.tank_id ?? ''),
          tankName: (data.tankName ?? data.tank_name) as string | undefined,
          level: (data.level === 'CRITICAL' ? 'CRITICAL' : 'WARNING'),
          message: String(data.message ?? ''),
          status: 'active',
          createdAt: String(data.createdAt ?? data.timestamp ?? event.timestamp ?? new Date().toISOString()),
        },
      };
    }

    if (event.type === 'ALERT_RESOLVED') {
      const id = Number(data.id);
      return Number.isFinite(id) ? { type: 'ALERT_RESOLVED', data: { id } } : null;
    }

    if (event.type === 'LEVEL_UPDATE') {
      const tankId = String(data.tank_id ?? data.tankId ?? '');
      if (!tankId) return null;
      return {
        type: 'LEVEL_UPDATE',
        data: {
          tankId,
          levelPercent: Number(data.level_percent ?? data.levelPercent ?? 0),
          volumeLiters: Number(data.volume_liters ?? data.volumeLiters ?? 0),
          distanceCm:
            data.distance_cm != null
              ? Number(data.distance_cm)
              : data.raw_value != null
              ? Number(data.raw_value)
              : null,
          rssi: data.rssi != null ? Number(data.rssi) : null,
          recordedAt: String(data.timestamp ?? data.recordedAt ?? event.timestamp ?? new Date().toISOString()),
        },
      };
    }

    if (event.type === 'NODE_STATUS') {
      const rawStatus = String(data.status ?? '').toLowerCase();
      const status: NodeStatus | undefined =
        rawStatus === 'online' || rawStatus === 'active'
          ? 'active'
          : rawStatus === 'offline'
          ? 'offline'
          : rawStatus === 'error'
          ? 'error'
          : undefined;
      return {
        type: 'NODE_STATUS',
        data: {
          nodeCode: (data.node_code ?? data.nodeCode) as string | undefined,
          tankId: (data.tank_id ?? data.tankId) as string | undefined,
          status,
          rssi: data.rssi != null ? Number(data.rssi) : null,
          lastSeen: String(data.last_seen ?? data.lastSeen ?? data.timestamp ?? event.timestamp ?? new Date().toISOString()),
        },
      };
    }
  } catch (error: unknown) {
    console.warn('[WS] Payload WebSocket tidak valid:', error);
    return null;
  }
  return null;
}

export function connectAlertSocket(handlers: AlertSocketHandlers): () => void {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isClosed = false;

  const connect = async () => {
    if (isClosed) return;

    const jwt = handlers.token || (await getAuthToken());
    if (isClosed || !jwt) return;

    const wsUrl = `${ENV.WS_URL}${ENV.WS_URL.includes('?') ? '&' : '?'}token=${encodeURIComponent(jwt)}`;
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      if (isClosed && socket) {
        socket.close();
      }
    };

    socket.onmessage = (event) => {
      const parsed = parseEvent(String(event.data));
      if (!parsed) return;
      if (parsed.type === 'ALERT_TRIGGERED') handlers.onAlert(parsed.data);
      if (parsed.type === 'ALERT_RESOLVED') handlers.onResolved?.(parsed.data.id);
      if (parsed.type === 'LEVEL_UPDATE') handlers.onLevelUpdate?.(parsed.data);
      if (parsed.type === 'NODE_STATUS') handlers.onNodeStatus?.(parsed.data);
    };

    socket.onerror = () => handlers.onError?.();

    socket.onclose = (event) => {
      if (isClosed) return;
      if (event.code === 1008) {
        console.warn('[WS] Ditolak server (1008): token tidak valid.');
        return;
      }
      reconnectTimer = setTimeout(() => {
        void connect();
      }, 5000);
    };
  };

  void connect();

  return () => {
    isClosed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
    socket = null;
  };
}
