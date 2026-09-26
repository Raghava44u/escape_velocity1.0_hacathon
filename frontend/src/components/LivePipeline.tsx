import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Loader2, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface PipelineEvent {
  event_id: string;
  stage: string;
  stage_number: int;
  status: string;
  title: string;
  message: string;
  duration_ms?: number;
  details?: any;
}

interface Props {
  documentId: string;
  onFinish: () => void;
}

export default function LivePipeline({ documentId, onFinish }: Props) {
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sse = new EventSource(`http://localhost:8000/api/v1/events/${documentId}`);
    
    sse.onmessage = (e) => {
      const data: PipelineEvent = JSON.parse(e.data);
      
      setEvents(prev => {
        const existingIdx = prev.findIndex(ev => ev.stage === data.stage && ev.status === data.status);
        if (existingIdx >= 0) return prev;
        
        // Remove older status of same stage if COMPLETED or FAILED or WARNING
        const filtered = prev.filter(ev => ev.stage !== data.stage || ev.status === 'COMPLETED' || ev.status === 'FAILED' || ev.status === 'WARNING');
        
        // Only keep the latest event for a stage if it's completing
        if (data.status !== 'RUNNING') {
           const finalArr = prev.filter(ev => ev.stage !== data.stage);
           return [...finalArr, data].sort((a,b) => a.stage_number - b.stage_number);
        }
        
        return [...prev, data].sort((a,b) => a.stage_number - b.stage_number);
      });

      if (data.stage === 'final' && data.status !== 'RUNNING') {
        setTimeout(onFinish, 1000);
        sse.close();
      }
    };

    return () => sse.close();
  }, [documentId, onFinish]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col overflow-hidden border-border/50">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ActivityIcon /> Processing Timeline
        </h3>
        <span className="text-xs font-mono text-muted-foreground bg-black/40 px-2 py-1 rounded">
          DOC: {documentId.split('-')[0]}
        </span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="relative border-l-2 border-white/10 ml-3 space-y-6 pb-4">
          {events.map((ev, i) => (
            <div key={`${ev.stage}-${ev.status}-${i}`} className="relative pl-6">
              <span className="absolute -left-[11px] top-1 bg-background rounded-full">
                {getStatusIcon(ev.status)}
              </span>
              
              <div className={`p-3 rounded-lg border ${
                ev.status === 'RUNNING' ? 'border-blue-500/30 bg-blue-500/5' :
                ev.status === 'WARNING' ? 'border-amber-500/30 bg-amber-500/5' :
                ev.status === 'FAILED' ? 'border-red-500/30 bg-red-500/5' :
                'border-white/5 bg-white/5'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm text-foreground/90">{ev.stage_number}. {ev.title}</h4>
                  {ev.duration_ms && <span className="text-xs text-muted-foreground font-mono">{ev.duration_ms}ms</span>}
                </div>
                <p className={`text-sm ${
                  ev.status === 'FAILED' ? 'text-red-400' :
                  ev.status === 'WARNING' ? 'text-amber-400' :
                  'text-muted-foreground'
                }`}>
                  {ev.message}
                </p>
                
                {ev.details && Object.keys(ev.details).length > 0 && ev.status !== 'RUNNING' && (
                  <div className="mt-2 text-xs bg-black/40 p-2 rounded text-muted-foreground font-mono whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(ev.details, null, 2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
)
