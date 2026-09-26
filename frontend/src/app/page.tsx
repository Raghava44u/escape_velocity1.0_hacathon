"use client";

import { useState } from 'react';
import UploadArea from '@/components/UploadArea';
import LivePipeline from '@/components/LivePipeline';
import DocumentViewer from '@/components/DocumentViewer';
import ExtractionResults from '@/components/ExtractionResults';
import { ShieldCheck, Activity, Eye, LayoutDashboard, Database, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [selectedBbox, setSelectedBbox] = useState<number[] | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              VERIDOC AI
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Trusted Intelligence Engine
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="flex items-center gap-2 text-primary"><LayoutDashboard className="w-4 h-4"/> Dashboard</a>
          <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"><Database className="w-4 h-4"/> Data Studio</a>
          <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"><Activity className="w-4 h-4"/> Analytics</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {!documentId ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl font-extrabold mb-4">Enterprise Document Verification</h2>
              <p className="text-lg text-muted-foreground">
                Upload real-world documents to extract structured data with field-level confidence, integrity checks, and validation.
              </p>
            </div>
            <UploadArea onUploadSuccess={(id) => setDocumentId(id)} />
            
            <div className="mt-16 grid grid-cols-3 gap-6 w-full max-w-4xl text-center">
              <div className="glass-panel p-6 rounded-xl flex flex-col items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <h3 className="font-semibold">Zero Hallucination</h3>
                <p className="text-sm text-muted-foreground">Never invents missing digits or data.</p>
              </div>
              <div className="glass-panel p-6 rounded-xl flex flex-col items-center gap-3">
                <Eye className="w-8 h-8 text-blue-500" />
                <h3 className="font-semibold">Evidence Mapping</h3>
                <p className="text-sm text-muted-foreground">Every field links directly to source.</p>
              </div>
              <div className="glass-panel p-6 rounded-xl flex flex-col items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-purple-500" />
                <h3 className="font-semibold">Tamper Detection</h3>
                <p className="text-sm text-muted-foreground">Finds anomalies and integrity signals.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
            <div className="col-span-4 h-full overflow-hidden flex flex-col gap-4">
              <LivePipeline 
                documentId={documentId} 
                onFinish={() => setPipelineFinished(true)} 
              />
            </div>
            <div className="col-span-8 h-full flex flex-col gap-4">
              {pipelineFinished ? (
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="glass-panel rounded-xl overflow-hidden h-full flex flex-col relative">
                    <DocumentViewer documentId={documentId} selectedBbox={selectedBbox} />
                  </div>
                  <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                    <ExtractionResults documentId={documentId} onFieldSelect={setSelectedBbox} />
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-xl h-full flex items-center justify-center flex-col gap-6">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-4 rounded-full border-b-2 border-purple-500 animate-spin" style={{ animationDuration: '2s' }}></div>
                    <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold animate-pulse">Processing Document</h3>
                    <p className="text-muted-foreground text-sm mt-2">Running through intelligence pipeline...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
