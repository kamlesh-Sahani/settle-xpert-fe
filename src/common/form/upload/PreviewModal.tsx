"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Tooltip } from "antd";
import DynamicModal from "@/common/dynamic/DynamicModal";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import { FiRotateCw, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { AiOutlineDownload } from "react-icons/ai";
import { LuFlipHorizontal, LuFlipVertical } from "react-icons/lu";
import type { UploadFile } from "antd";
import classNames from "classnames";
import { getFileIcon, getFileColorClass, getPreviewStrategy } from "./fileTypes";

export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: UploadFile[];
  initialIndex?: number;
  onDelete?: (file: UploadFile) => void;
}

const getSrc = (file: UploadFile): string => {
  return file.url || file.thumbUrl || file.preview || "";
};

const ensurePreview = async (file: UploadFile): Promise<string> => {
  if (file.url || file.thumbUrl || file.preview) return file.url || file.thumbUrl || file.preview || "";
  if (file.originFileObj) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj as File);
      reader.onload = () => resolve(reader.result as string);
    });
  }
  return "";
};

const readTextFile = async (file: UploadFile): Promise<string> => {
  if (file.originFileObj) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file.originFileObj as File);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject("Failed to read text file.");
    });
  }
  return "Cannot preview text for remote files yet.";
};

const readSpreadsheet = async (file: UploadFile): Promise<{ cols: string[]; rows: any[][] }> => {
  if (file.originFileObj) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const XLSX = await import("xlsx-js-style");
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
          
          if (json.length > 0) {
            // First row as cols, rest as rows. Pad missing cols if needed.
            const cols = (json[0] as string[]).map((c, i) => c || `Col ${i+1}`);
            const rows = json.slice(1);
            resolve({ cols, rows });
          } else {
            resolve({ cols: [], rows: [] });
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject("Failed to read spreadsheet file.");
      reader.readAsArrayBuffer(file.originFileObj as File);
    });
  }
  return { cols: [], rows: [] };
};

const formatSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function PreviewModal({
  isOpen,
  onClose,
  files,
  initialIndex = 0,
  onDelete,
}: PreviewModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewTable, setPreviewTable] = useState<{cols: string[], rows: any[][]}|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Image Transform State
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const currentFile = files[selectedIndex] || files[0];
  const hasMultiple = files.length > 1;

  const strategy = currentFile ? getPreviewStrategy(currentFile.name || "", currentFile.type || "") : "fallback";

  const resolvePreview = useCallback(async () => {
    if (!currentFile) return;
    setIsLoading(true);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    
    const strat = getPreviewStrategy(currentFile.name || "", currentFile.type || "");
    
    try {
      if (strat === "text") {
        const text = await readTextFile(currentFile);
        setPreviewText(text);
        setPreviewSrc("");
        setPreviewTable(null);
      } else if (strat === "spreadsheet") {
        const table = await readSpreadsheet(currentFile);
        setPreviewTable(table);
        setPreviewSrc("");
        setPreviewText("");
      } else if (strat !== "fallback") {
        const src = await ensurePreview(currentFile);
        setPreviewSrc(src);
        setPreviewText("");
        setPreviewTable(null);
      } else {
        setPreviewSrc("");
        setPreviewText("");
        setPreviewTable(null);
      }
    } catch (err) {
      console.error(err);
      setPreviewSrc("");
      setPreviewText("");
      setPreviewTable(null);
    } finally {
      if (strat !== "image") {
        setIsLoading(false);
      }
    }
  }, [currentFile]);

  useMemo(() => {
    resolvePreview();
  }, [resolvePreview]);

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex < files.length - 1) setSelectedIndex((i) => i + 1);
  };
  
  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex > 0) setSelectedIndex((i) => i - 1);
  };

  const handleDownload = useCallback(async (downloadAll = false) => {
    if (files.length === 0) return;
    setIsDownloading(true);
    
    try {
      // Fake delay for single file, actual await for zip
      if (!downloadAll || files.length === 1) {
        await new Promise(res => setTimeout(res, 500)); 
        const fileToDownload = downloadAll ? files[0] : (currentFile || files[0]);
        const src = getSrc(fileToDownload);
        if (!src) return;
        const a = document.createElement("a");
        a.href = src;
        a.download = fileToDownload.name || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // Download all as zip
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const file of files) {
        const src = getSrc(file);
        if (src) {
          if (src.startsWith("data:")) {
            const base64Data = src.split(",")[1];
            zip.file(file.name || "download", base64Data, { base64: true });
          } else {
            const response = await fetch(src);
            const blob = await response.blob();
            zip.file(file.name || "download", blob);
          }
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attachments.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download", err);
    } finally {
      setIsDownloading(false);
    }
  }, [currentFile, files]);

  const _handleDelete = useCallback(() => {
    if (currentFile && onDelete) {
      onDelete(currentFile);
      if (files.length <= 1) {
        onClose();
      } else if (selectedIndex === files.length - 1) {
        setSelectedIndex(selectedIndex - 1);
      }
    }
  }, [currentFile, onDelete, files.length, selectedIndex, onClose]);

  if (!isOpen || files.length === 0) return null;

  return (
    <DynamicModal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      className="w-[90vw] h-[90vh] overflow-hidden"
      bodyClassName="p-0 flex flex-col h-full overflow-hidden"
    >
      <TransformWrapper initialScale={1} centerOnInit minScale={0.2} maxScale={8} disabled={strategy !== "image"}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <div className="flex flex-col h-full w-full bg-background">
            
            {/* Custom Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-secondary">
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-text-primary">Preview</div>
                
                {/* Zoom Controls (Reserve space always to prevent layout flicker) */}
                <div className={classNames("flex items-center bg-background border border-border rounded-md shadow-sm overflow-hidden transition-opacity duration-200", strategy !== "image" && "opacity-0 pointer-events-none")}>
                  <Tooltip title="Zoom Out" placement="bottom">
                    <button onClick={() => zoomOut()} className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors">
                      <FaSearchMinus size={14} />
                    </button>
                  </Tooltip>
                  <div className="w-px h-5 bg-border" />
                  <Tooltip title="Zoom In" placement="bottom">
                    <button onClick={() => zoomIn()} className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors">
                      <FaSearchPlus size={14} />
                    </button>
                  </Tooltip>
                  <div className="w-px h-5 bg-border" />
                  <Tooltip title="Rotate Left" placement="bottom">
                    <button onClick={() => setRotation(r => r - 90)} className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">
                      <FiRotateCcw size={14} />
                    </button>
                  </Tooltip>
                  <div className="w-px h-5 bg-border" />
                  <Tooltip title="Rotate Right" placement="bottom">
                    <button onClick={() => setRotation(r => r + 90)} className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">
                      <FiRotateCw size={14} />
                    </button>
                  </Tooltip>
                  <div className="w-px h-5 bg-border" />
                  <Tooltip title="Flip Horizontal" placement="bottom">
                    <button onClick={() => setFlipH(f => !f)} className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">
                      <LuFlipHorizontal size={14} />
                    </button>
                  </Tooltip>
                  <div className="w-px h-5 bg-border" />
                  <Tooltip title="Flip Vertical" placement="bottom">
                    <button onClick={() => setFlipV(f => !f)} className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors">
                      <LuFlipVertical size={14} />
                    </button>
                  </Tooltip>
                  <div className="w-px h-5 bg-border" />
                  <Tooltip title="Reset" placement="bottom">
                    <button
                      onClick={() => {
                        resetTransform();
                        setRotation(0);
                        setFlipH(false);
                        setFlipV(false);
                      }}
                      className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xs font-medium px-1">Reset</span>
                    </button>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip title="Download All" placement="bottom">
                  <button onClick={() => handleDownload(true)} disabled={isDownloading} className="w-8 h-8 flex items-center justify-center rounded border border-orange-500 text-orange-500 hover:bg-orange-50 transition-colors shadow-sm bg-white disabled:opacity-50">
                    {isDownloading ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <AiOutlineDownload size={18} />}
                  </button>
                </Tooltip>

                <div className="w-px h-5 bg-border mx-1" />

                <button onClick={onClose} className="px-3 h-8 bg-transparent hover:bg-primary/10 text-primary text-sm font-semibold rounded transition-colors">
                  Cancel
                </button>
              </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 relative group/canvas flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
                
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {hasMultiple && (
                  <>
                    <button onClick={goPrev} disabled={selectedIndex === 0} className={classNames("absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 text-2xl font-bold transition-all cursor-pointer", selectedIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/canvas:opacity-100")}>‹</button>
                    <button onClick={goNext} disabled={selectedIndex === files.length - 1} className={classNames("absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-700 text-2xl font-bold transition-all cursor-pointer", selectedIndex === files.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/canvas:opacity-100")}>›</button>
                  </>
                )}

                {/* --- RENDERING LOGIC --- */}
                {previewSrc && strategy === "image" && (
                  <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "grab" }}>
                    <Image
                      src={previewSrc}
                      alt={currentFile.name || "Preview"}
                      width={1200}
                      height={800}
                      unoptimized
                      className="max-w-full max-h-full object-contain"
                      style={{ transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`, transition: "transform 0.25s ease-in-out" }}
                      onLoad={() => setIsLoading(false)}
                      onError={() => setIsLoading(false)}
                    />
                  </TransformComponent>
                )}

                {previewSrc && strategy === "media" && (
                  currentFile.type?.startsWith("audio/") ? (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 gap-4">
                      <span className={classNames("text-6xl mb-4", getFileColorClass(currentFile?.name || "", currentFile?.type || ""))}>
                        {getFileIcon(currentFile.name, currentFile.type, { size: 160 })}
                      </span>
                      <audio src={previewSrc} controls className="w-full max-w-md" onCanPlay={() => setIsLoading(false)} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-black">
                      <video src={previewSrc} controls className="max-w-full max-h-full" onCanPlay={() => setIsLoading(false)} />
                    </div>
                  )
                )}

                {previewSrc && strategy === "iframe" && (
                  <iframe src={previewSrc} className="w-full h-full bg-white border-0" sandbox="allow-scripts allow-same-origin" onLoad={() => setIsLoading(false)} title="Document Preview" />
                )}

                {previewText && strategy === "text" && (
                  <div className="w-full h-full bg-white overflow-auto p-4 flex justify-start items-start text-left">
                    <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-words max-w-full">
                      {previewText}
                    </pre>
                  </div>
                )}

                {previewTable && strategy === "spreadsheet" && (
                  <div className="w-full h-full bg-white overflow-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                      <thead>
                        <tr>
                          {previewTable.cols.map((col, i) => (
                            <th key={i} className="sticky top-0 bg-gray-100 border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewTable.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
                            {previewTable.cols.map((_, j) => (
                              <td key={j} className="px-4 py-2 text-sm text-gray-600 truncate max-w-[300px]" title={row[j]}>{row[j]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewSrc && strategy === "pdf" && (
                  <iframe src={previewSrc} className="w-full h-full bg-white border-0" onLoad={() => setIsLoading(false)} title="PDF Preview" />
                )}

                {strategy === "fallback" && (
                  <div className="flex flex-col items-center justify-center gap-4 w-full h-full bg-white">
                    <div className={getFileColorClass(currentFile.name, currentFile.type)}>
                      {getFileIcon(currentFile.name, currentFile.type, { size: 160 })}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{currentFile.name}</p>
                      {currentFile.size && <p className="text-xs text-gray-400 mt-1">{formatSize(currentFile.size)}</p>}
                    </div>
                    <button onClick={() => handleDownload(false)} disabled={isDownloading} className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-50">
                      {isDownloading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <AiOutlineDownload size={16} />}
                      {isDownloading ? "Downloading..." : "Download File"}
                    </button>
                  </div>
                )}
                
              </div>

              {/* Sidebar */}
              {hasMultiple && (
                <div className="w-48 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto p-3 gap-2">
                  {files.map((file, index) => {
                    const selected = index === selectedIndex;
                    const fileSrc = file.thumbUrl || file.url || file.preview || "";
                    const fileStrategy = getPreviewStrategy(file.name || "", file.type || "");

                    return (
                      <div key={file.uid || index} className="relative group/sidebar-item">
                        <button type="button" onClick={() => setSelectedIndex(index)} className={classNames("w-full rounded-lg border overflow-hidden transition-all cursor-pointer flex-shrink-0 bg-white text-left", selected ? "border-primary ring-1 ring-primary/30" : "border-gray-200 hover:border-gray-300")}>
                          <div className="w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden relative">
                            {fileSrc && fileStrategy === "image" ? (
                              <Image src={fileSrc} alt={file.name || "Thumbnail"} fill unoptimized className="object-cover" />
                            ) : (
                              <div className={classNames("scale-75", getFileColorClass(file.name, file.type))}>
                                {getFileIcon(file.name, file.type, { size: 64 })}
                              </div>
                            )}
                          </div>
                          <div className="px-2 py-1.5 text-[11px] text-gray-600 truncate" title={file.name}>{file.name}</div>
                        </button>
                        
                        {onDelete && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(file);
                              if (files.length <= 1) onClose();
                              else if (index <= selectedIndex && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
                            }}
                            className="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 shadow-sm opacity-100 transition-colors cursor-pointer"
                            title="Delete File"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}
      </TransformWrapper>
    </DynamicModal>
  );
}
