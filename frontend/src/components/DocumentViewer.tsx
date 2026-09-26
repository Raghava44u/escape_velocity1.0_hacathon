import { useEffect, useState } from 'react';
import axios from 'axios';
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-react';

interface Props {
  documentId: string;
  selectedBbox?: number[] | null;
}

export default function DocumentViewer({ documentId, selectedBbox }: Props) {
  const [docData, setDocData] = useState<any>(null);
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/documents/${documentId}`);
        setDocData(res.data.document);
        const ext = res.data.document.filename.split('.').pop().toLowerCase();
        const fileType = res.data.document.file_type; // the backend returns file_type string

        if (fileType === "PDF" || ext === "pdf") {
            setPageUrl(`http://localhost:8000/media/uploads/${documentId}_page_1.png`);
        } else {
            setPageUrl(`http://localhost:8000/media/uploads/${documentId}.${ext}`);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDoc();
  }, [documentId]);

  return (
    <>
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between z-10">
        <h3 className="font-medium flex items-center gap-2">
          <MousePointer2 className="w-4 h-4 text-primary" /> Document Source
        </h3>
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg">
          <button onClick={() => setZoom(z => Math.max(z - 20, 50))} className="p-1.5 hover:bg-white/10 rounded"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-xs font-mono w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 20, 200))} className="p-1.5 hover:bg-white/10 rounded"><ZoomIn className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-white/10 rounded ml-1 border-l border-white/10"><Maximize className="w-4 h-4" /></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-black/60 relative custom-scrollbar flex items-start justify-center p-4">
        {/* Document Wrapper */}
        <div 
          className="relative bg-white shadow-2xl transition-transform origin-top inline-block"
          style={{ 
            transform: `scale(${zoom / 100})`, 
            minWidth: '800px', 
            minHeight: '1100px',
          }}
        >
          {pageUrl && (
            <div className="relative inline-block w-full">
              {/* Force it to be a block image so container wraps tightly around it */}
              <img 
                src={pageUrl} 
                className="w-full h-auto block pointer-events-none" 
                alt="Document page" 
              />
              
              {selectedBbox && selectedBbox.length === 4 && (
                <div 
                  className="absolute border-[3px] border-blue-500 bg-blue-500/20 rounded-sm pointer-events-none transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  style={{
                     top: `${selectedBbox[0] / 10}%`,
                     left: `${selectedBbox[1] / 10}%`,
                     height: `${(selectedBbox[2] - selectedBbox[0]) / 10}%`,
                     width: `${(selectedBbox[3] - selectedBbox[1]) / 10}%`
                  }}
                />
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
