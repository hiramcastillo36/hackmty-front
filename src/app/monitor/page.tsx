import { QRMonitor } from '@/components/qr-monitor';

export default function MonitorPage() {
  return (
    <main className="bg-slate-950">
      <QRMonitor
        wsUrl="ws://172.191.94.124:8000/ws/qr-data/"
        apiUrl="http://172.191.94.124:8000"
      />
    </main>
  );
}
