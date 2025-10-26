import { QRMonitor } from '@/components/qr-monitor';

export default function MonitorPage() {
  return (
    <main className="bg-slate-950">
      <QRMonitor
        wsUrl="ws://localhost:8000/ws/qr-data/"
        apiUrl="http://localhost:8000"
      />
    </main>
  );
}
