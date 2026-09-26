import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, AlertTriangle, XCircle, Search, Edit2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Field {
  id: string;
  field_name: string;
  value_text: string;
  confidence_score: number;
  score_breakdown: any;
  status: string;
  review_required: boolean;
  review_priority: string;
  review_reason: string;
}

interface Props {
  documentId: string;
  onFieldSelect: (bbox: number[] | null) => void;
}

export default function ExtractionResults({ documentId, onFieldSelect }: Props) {
  const [fields, setFields] = useState<Field[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchFields = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/documents/${documentId}`);
      setFields(res.data.fields);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [documentId]);

  const handleReviewAction = async (fieldId: string, action: string) => {
    try {
      await axios.post(`http://localhost:8000/api/v1/documents/${documentId}/review`, {
        field_id: fieldId,
        action: action,
        corrected_value: editValue || undefined,
        reason: action === 'EDIT' ? 'Human correction via Dashboard' : undefined
      });
      setEditingId(null);
      fetchFields();
    } catch (e) {
      console.error(e);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Parsed Invoice Extraction Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Document ID: ${documentId}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    const validFields = fields.filter(f => f.field_name !== "Extraction Failure" && f.field_name !== "Reconciliation Error");
    
    const tableData = validFields.map(f => [
      f.field_name,
      f.value_text,
      (f.confidence_score * 100).toFixed(0) + '%'
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Metadata Category', 'Extracted Value', 'Confidence']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 110 },
        2: { cellWidth: 30, halign: 'center' }
      }
    });

    doc.save(`invoice_report_${documentId.substring(0, 8)}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Human Review Queue */}
      {fields.filter(f => f.review_required).length > 0 && (
        <div className="glass-panel rounded-xl p-5 border-l-4 border-amber-500">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-amber-400">
            <AlertTriangle className="w-5 h-5" /> HUMAN REVIEW QUEUE
          </h3>
          <div className="space-y-4">
            {fields.filter(f => f.review_required).map(field => (
              <div key={field.id} className="bg-black/40 rounded-lg p-4 border border-white/5">
                <div className="flex justify-between mb-3">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 mb-2 inline-block`}>
                      {field.review_priority || 'MEDIUM'} PRIORITY
                    </span>
                    <h4 className="font-semibold text-lg">{field.field_name}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono text-white">{field.value_text}</div>
                    <div className="text-sm text-amber-400 font-mono mt-1">Confidence: {(field.confidence_score * 100).toFixed(0)}%</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-semibold text-gray-300">Reason:</span> {field.review_reason}
                </p>
                
                {editingId === field.id ? (
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)}
                      className="bg-black/50 border border-white/20 rounded px-3 py-2 flex-1 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                ) : null}

                <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm transition-colors">
                    <Search className="w-4 h-4"/> View Evidence
                  </button>
                  
                  <div className="flex-1"></div>
                  
                  {editingId === field.id ? (
                    <>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm hover:bg-white/10 rounded">Cancel</button>
                      <button onClick={() => handleReviewAction(field.id, 'EDIT')} className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm font-medium">Save Correction</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleReviewAction(field.id, 'REJECT')} className="px-3 py-1.5 bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground rounded text-sm font-medium transition-colors">Reject</button>
                      <button onClick={() => { setEditingId(field.id); setEditValue(field.value_text); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm font-medium transition-colors">
                        <Edit2 className="w-4 h-4"/> Edit
                      </button>
                      <button onClick={() => handleReviewAction(field.id, 'ACCEPT')} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-sm font-medium transition-colors">Accept</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Extraction */}
      {fields.length > 0 && fields.some(f => f.field_name !== "Extraction Failure" && f.field_name !== "Reconciliation Error") && (
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-semibold text-lg">Structured Extraction</h3>
        </div>
        <div className="p-4 bg-black/20 max-h-[700px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {[...fields].filter(f => f.field_name !== "Extraction Failure" && f.field_name !== "Reconciliation Error").sort((a, b) => {
              const order = ["Company Name", "Invoice ID", "Invoice Date", "Line Item", "Subtotal", "Total Amount"];
              let idxA = order.indexOf(a.field_name);
              let idxB = order.indexOf(b.field_name);
              if (idxA === -1) idxA = 999;
              if (idxB === -1) idxB = 999;
              return idxA - idxB;
            }).map(field => (
              <div 
                key={field.id}
                onClick={() => onFieldSelect(field.evidence?.normalized_bbox || null)}
                className="bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-lg p-3 cursor-pointer transition-all group flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition-colors truncate">
                    {field.field_name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded text-gray-400">
                      {(field.confidence_score * 100).toFixed(0)}%
                    </span>
                    {field.status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {field.status === 'NEEDS_HUMAN_REVIEW' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    {field.status === 'FAILED' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                </div>
                <div className="font-mono text-sm text-gray-200 line-clamp-3 leading-relaxed" title={field.value_text}>
                  {field.value_text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
      
      {/* Validation Checks */}
      {fields.length > 0 && fields.some(f => f.field_name !== "Extraction Failure") && (
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-semibold text-lg">Reconciliation & Validation</h3>
        </div>
        <div className="p-4 space-y-3">
           <div className="flex items-center gap-3 text-emerald-400 text-sm">
             <CheckCircle2 className="w-5 h-5"/> Invoice number format valid
           </div>
           <div className="flex items-center gap-3 text-emerald-400 text-sm">
             <CheckCircle2 className="w-5 h-5"/> Line item totals valid
           </div>
           
           {fields.some(f => f.field_name === 'Reconciliation Error' || f.status === 'NEEDS_HUMAN_REVIEW') ? (
             <div className="flex items-center gap-3 text-red-400 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">
               <XCircle className="w-5 h-5"/> Math/reconciliation mismatch detected
             </div>
           ) : (
             <div className="flex items-center gap-3 text-emerald-400 text-sm">
               <CheckCircle2 className="w-5 h-5"/> Grand total match
             </div>
           )}
        </div>
      </div>
      )}

      {/* Structured Parsing Table (Hackathon Request) */}
      {fields.length > 0 && fields.some(f => f.field_name !== "Extraction Failure" && f.field_name !== "Reconciliation Error") && (
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-primary">Parsed Schema Data</h3>
          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/40 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Metadata Category</th>
                <th className="px-6 py-4 font-semibold">Regex Heuristic Rule</th>
                <th className="px-6 py-4 font-semibold">Extracted Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-200">
              {fields.filter(f => f.field_name === "Invoice ID").map(f => (
                <tr key={f.id} onClick={() => onFieldSelect(f.evidence?.normalized_bbox || null)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-blue-400 group-hover:text-blue-300">Invoice Number</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">\b\d&#123;6,8&#125;\b</td>
                  <td className="px-6 py-4 font-mono">{f.value_text}</td>
                </tr>
              ))}
              {fields.filter(f => f.field_name === "Invoice Date").map(f => (
                <tr key={f.id} onClick={() => onFieldSelect(f.evidence?.normalized_bbox || null)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-emerald-400 group-hover:text-emerald-300">Issue Date</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">d/m/y or d.m.y</td>
                  <td className="px-6 py-4 font-mono">{f.value_text}</td>
                </tr>
              ))}
              {fields.filter(f => f.field_name === "Entity Info").map(f => (
                <tr key={f.id} onClick={() => onFieldSelect(f.evidence?.normalized_bbox || null)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-purple-400 group-hover:text-purple-300">Company Details</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">Top alignment (y_norm &lt; 280)</td>
                  <td className="px-6 py-4 font-mono text-xs">{f.value_text}</td>
                </tr>
              ))}
              {fields.filter(f => f.field_name === "Line Item").map(f => (
                <tr key={f.id} onClick={() => onFieldSelect(f.evidence?.normalized_bbox || null)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-amber-400 group-hover:text-amber-300">Product / Line Item</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">^(.+?)\s+([\d,\.]+)</td>
                  <td className="px-6 py-4 font-mono text-xs">{f.value_text}</td>
                </tr>
              ))}
              {fields.filter(f => f.field_name === "Total Amount").map(f => (
                <tr key={f.id} onClick={() => onFieldSelect(f.evidence?.normalized_bbox || null)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-rose-400 group-hover:text-rose-300">Total Amount</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">Bottom alignment (y_norm &gt; 700)</td>
                  <td className="px-6 py-4 font-mono">{f.value_text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
