import { Alert } from '../types';
import { ENV } from '../config/env';

type AlertSocketEvent =
  | { type: 'ALERT_TRIGGERED'; data: Alert }
  | { type: 'ALERT_RESOLVED'; data: { id: number } };

interface AlertSocketHandlers {
  onAlert: (alert: Alert) => void;
  onResolved?: (alertId: number) => void;
  onError?: () => void;
}

function parseEvent(rawMessage: string): AlertSocketEvent | null {
  try {
    const parsed: unknown = JSON.parse(rawMessage);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const event = parsed as { type?: unknown; data?: unknown };
    if (event.type === 'ALERT_TRIGGERED' && typeof event.data === 'object' && event.data !== null) {
      return { type: event.type, data: event.data as Alert };
    }
    if (event.type === 'ALERT_RESOLVED' && typeof event.data === 'object' && event.data !== null) {
      const data = event.data as { id?: unknown };
      return typeof data.id === 'number' ? { type: event.type, data: { id: data.id } } : null;
    }
  } catch (error: unknown) {
    console.warn('[Alerts] Payload WebSocket tidak valid:', error);
    return null;
  }
  return null;
}

export function connectAlertSocket(handlers: AlertSocketHandlers): () => void {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isClosed = false;

  const connect = () => {
    if (isClosed) return;
    socket = new WebSocket(ENV.WS_URL);
    socket.onmessage = (event) => {
      const parsed = parseEvent(event.data);
      if (!parsed) return;
      if (parsed.type === 'ALERT_TRIGGERED') handlers.onAlert(parsed.data);
      if (parsed.type === 'ALERT_RESOLVED') handlers.onResolved?.(parsed.data.id);
    };
    socket.onerror = () => handlers.onError?.();
    socket.onclose = () => {
      if (!isClosed) reconnectTimer = setTimeout(connect, 5000);
    };
  };

  connect();

  return () => {
    isClosed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    socket?.close();
    socket = null;
  };
}
