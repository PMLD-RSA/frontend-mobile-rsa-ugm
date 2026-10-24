/**
 * Tipe Data Resmi Frontend Mobile (SI-POTA RSA UGM)
 * Selaras dengan Skema Backend Core VPS & Web BFF
 */

export type UserRole = "admin" | "operator" | "viewer";
export type AlertLevel = "WARNING" | "CRITICAL";
export type AlertStatus = "active" | "resolved";
export type GatewayStatus = "online" | "offline";
export type NodeStatus = "active" | "offline" | "error";
export type TankStatusCategory = "NORMAL" | "WARNING" | "CRITICAL";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface WaterLevelReading {
  id: number;
  tankId: string;
  sensorNodeId?: string | null;
  levelPercent: string | number;
  volumeLiters: string | number;
  rawValue?: string | number | null;
  rssi?: number | null;
  recordedAt: string;
}

export interface Alert {
  id: number;
  tankId: string;
  tankName?: string;
  level: AlertLevel;
  message: string;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface SensorNode {
  id: string;
  tankId?: string | null;
  gatewayId?: string | null;
  deviceCode: string;
  sensorType: string;
  status: NodeStatus;
  lastRssi?: number | null;
  lastSeen?: string | null;
  createdAt?: string;
}

export interface Tank {
  id: string;
  name: string;
  location?: string | null;
  capacityLiters: string | number;
  minThresholdPercent: string | number;
  maxThresholdPercent: string | number;
  latitude?: string | null;
  longitude?: string | null;
  createdAt?: string;
  updatedAt?: string;

  latestReading?: WaterLevelReading | null;
  activeAlert?: Alert | null;
  nodes?: SensorNode[];
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}
