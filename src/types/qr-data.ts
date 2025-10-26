export interface QRData {
  id?: string;
  station_id: string;
  flight_number: string;
  customer_name: string;
  drawer_id: string;
  created_at: string;
}

export interface WebSocketMessage {
  type: 'qr_data_created' | 'latest_qr' | 'error' | 'connection_status';
  data?: QRData | QRData[];
  message?: string;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  qrDataList: QRData[];
  totalCount: number;
  lastUpdate: Date | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  error: string | null;
}
