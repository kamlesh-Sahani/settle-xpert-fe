import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Tooltip } from "antd";
import DynamicModal from "./DynamicModal";
import { FaDownload, FaFilePdf, FaFileAlt, FaSearchPlus, FaSearchMinus, FaTimes, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileCode, FaSpinner } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight, FiDownloadCloud } from "react-icons/fi";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import classNames from "classnames";

export interface FilePreviewData {
    url: string;
    name: string;
    type?: string;
}

export interface dynamicFilePreviewerPropsType {
    isOpen: boolean;
    onClose: () => void;
    files?: FilePreviewData[];
}

const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || '';

const isImage = (file: FilePreviewData) => {
    if (file.type?.startsWith('image')) return true;
    const ext = getExt(file.name);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(ext);
};

const isPdf = (file: FilePreviewData) => {
    if (file.type === 'pdf' || file.type === 'application/pdf') return true;
    const ext = getExt(file.name);
    return ext === 'pdf';
};

const isWord = (ext: string) => ['doc', 'docx'].includes(ext);
const isExcel = (ext: string) => ['xls', 'xlsx', 'csv'].includes(ext);
const isPowerpoint = (ext: string) => ['ppt', 'pptx'].includes(ext);
const isText = (ext: string) => ext === 'txt';
const isHtml = (ext: string) => ['htm', 'html'].includes(ext);

const isOfficeDoc = (file: FilePreviewData) => {
    const ext = getExt(file.name);
    return isWord(ext) || isExcel(ext) || isPowerpoint(ext);
};

const isTextOrHtml = (file: FilePreviewData) => {
    const ext = getExt(file.name);
    return isText(ext) || isHtml(ext) || file.type?.startsWith('text/');
};

const DynamicFilePreviewer = (props: dynamicFilePreviewerPropsType) => {
    const { isOpen, onClose, files = [] } = props;
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isFileLoading, setIsFileLoading] = useState(true);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, status: '' });

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setSelectedIndex(0);
            setIsFileLoading(true);
            setDownloadProgress({ current: 0, total: 0, status: '' });
        }
    }

    const [prevFiles, setPrevFiles] = useState(files);
    const [prevSelectedIndex, setPrevSelectedIndex] = useState(selectedIndex);
    
    if (files !== prevFiles || selectedIndex !== prevSelectedIndex) {
        setPrevFiles(files);
        setPrevSelectedIndex(selectedIndex);
        setIsFileLoading(true);
    }

    useEffect(() => {
        if (files.length > 0) {
            const current = files[selectedIndex] || files[0];
            const isSupported = isImage(current) || isPdf(current) || isOfficeDoc(current) || isTextOrHtml(current);
            if (!isSupported) {
                const timer = setTimeout(() => setIsFileLoading(false), 300);
                return () => clearTimeout(timer);
            }
        }
    }, [selectedIndex, files]);

    if (!isOpen || files.length === 0) return null;

    const currentFile = files[selectedIndex] || files[0];

    // Route external URLs through our local Next.js API proxy to completely bypass browser CORS blocks
    const getFetchUrl = (url: string) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return `/api/proxy-download?url=${encodeURIComponent(url)}`;
        }
        return url;
    };

    const downloadSingleFile = async (file: FilePreviewData) => {
        setIsDownloading(true);
        try {
            const fetchUrl = getFetchUrl(file.url);
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const { saveAs } = await import("file-saver");
            saveAs(blob, file.name);
        } catch (error) {
            console.warn("Fetch failed via proxy. Falling back to direct navigation.", error);
            const a = document.createElement("a");
            a.href = file.url;
            a.target = "_blank";
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadAllAsZip = async () => {
        if (files.length === 0) return;
        setIsDownloadingAll(true);
        setDownloadProgress({ current: 0, total: files.length, status: 'fetching' });

        try {
            const [{ default: JSZip }, { saveAs }] = await Promise.all([
                import("jszip"),
                import("file-saver")
            ]);
            const zip = new JSZip();
            let addedCount = 0;
            const failedFiles: FilePreviewData[] = [];

            const promises = files.map(async (file, index) => {
                try {
                    const fetchUrl = getFetchUrl(file.url);
                    const response = await fetch(fetchUrl);
                    if (!response.ok) throw new Error("Not OK");
                    const blob = await response.blob();
                    const ext = file.name.split('.').pop() || 'file';
                    const filename = file.name.includes('.') ? file.name : `${file.name}-${index}.${ext}`;
                    zip.file(filename, blob);
                    addedCount++;
                } catch (e) {
                    console.error("Could not fetch file for zip: ", file.name, e);
                    failedFiles.push(file);
                } finally {
                    setDownloadProgress(prev => ({ ...prev, current: prev.current + 1 }));
                }
            });

            await Promise.all(promises);

            if (addedCount > 0) {
                setDownloadProgress(prev => ({ ...prev, status: 'zipping' }));
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "attachments.zip");
            }

            // For files that failed entirely, trigger direct downloads (browsers may block multiple popups)
            if (failedFiles.length > 0) {
                if (addedCount === 0) {
                    alert("Unable to fetch any files securely. Opening them individually...");
                }
                failedFiles.forEach((file, i) => {
                    setTimeout(() => {
                        const a = document.createElement("a");
                        a.href = file.url;
                        a.target = "_blank";
                        a.download = file.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }, i * 500);
                });
            }
        } catch (error) {
            console.error("Failed to generate zip", error);
        } finally {
            setIsDownloadingAll(false);
            setDownloadProgress({ current: 0, total: 0, status: '' });
        }
    };

    const handleNext = () => {
        if (selectedIndex < files.length - 1) setSelectedIndex(selectedIndex + 1);
    };

    const handlePrev = () => {
        if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
    };

    const renderThumbnailContent = (file: FilePreviewData) => {
        if (isImage(file)) {
            return <Image src={file.url} alt={file.name || "Thumbnail"} fill unoptimized className="object-cover" />;
        }
        if (isPdf(file)) {
            return <FaFilePdf size={28} className="text-danger" />;
        }
        const ext = getExt(file.name);
        if (isWord(ext)) return <FaFileWord size={28} className="text-primary" />;
        if (isExcel(ext)) return <FaFileExcel size={28} className="text-success" />;
        if (isPowerpoint(ext)) return <FaFilePowerpoint size={28} className="text-warning" />;
        if (isHtml(ext)) return <FaFileCode size={28} className="text-purple-500" />;

        return <FaFileAlt size={28} className="text-text-secondary" />;
    };

    const showSidebar = files.length > 1;

    return (
        <DynamicModal
            isOpen={isOpen}
            onClose={onClose}
            hideCloseButton
        >
            <div className="flex flex-col h-full w-full font-sans relative">

                {/* Flat, Minimal Header */}
                <div className="flex justify-between items-center px-5 py-3 border-b border-border bg-background flex-shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <h2 className="text-base font-semibold text-text-primary truncate max-w-sm md:max-w-xl" title={currentFile.name}>
                                {currentFile.name}
                            </h2>
                            {showSidebar && (
                                <span className="text-xs text-text-secondary font-medium mt-0.5">
                                    {selectedIndex + 1} of {files.length}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {showSidebar && (
                            <button
                                onClick={downloadAllAsZip}
                                disabled={isDownloadingAll}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-secondary text-text-primary rounded transition-all text-sm font-medium border border-transparent hover:border-border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isDownloadingAll ? <FaSpinner className="animate-spin text-text-secondary" /> : <FiDownloadCloud size={16} className="text-text-secondary" />}
                                <span>
                                    {isDownloadingAll
                                        ? (downloadProgress.status === 'zipping'
                                            ? "Creating ZIP..."
                                            : `Fetching ${downloadProgress.current}/${downloadProgress.total}`)
                                        : "Download All"}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => downloadSingleFile(currentFile)}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded transition-all text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload size={12} />}
                            <span>Download</span>
                        </button>
                        <div className="h-5 w-px bg-border mx-2"></div>
                        <Tooltip title="Close" placement="bottom">
                            <button
                                onClick={onClose}
                                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-secondary rounded transition-all cursor-pointer"
                            >
                                <FaTimes size={18} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden h-full">
                    {/* Main Preview Canvas */}
                    <div className="flex-1 bg-background flex flex-col relative overflow-hidden group/preview border-r border-border">

                        {/* Loading Overlay Spinner for canvas */}
                        {isFileLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-3">
                                    <FaSpinner className="animate-spin text-primary" size={32} />
                                    <span className="text-sm font-medium text-text-secondary">Loading Document...</span>
                                </div>
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        {showSidebar && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    disabled={selectedIndex === 0}
                                    className={classNames(
                                        "absolute left-2 top-1/2 -translate-y-1/2 z-40 p-2 rounded bg-background border border-border text-text-secondary flex items-center justify-center shadow-sm transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed",
                                        selectedIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/preview:opacity-100 hover:text-primary hover:border-primary"
                                    )}
                                >
                                    <FiChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={selectedIndex === files.length - 1}
                                    className={classNames(
                                        "absolute right-2 top-1/2 -translate-y-1/2 z-40 p-2 rounded bg-background border border-border text-text-secondary flex items-center justify-center shadow-sm transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed",
                                        selectedIndex === files.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/preview:opacity-100 hover:text-primary hover:border-primary"
                                    )}
                                >
                                    <FiChevronRight size={20} />
                                </button>
                            </>
                        )}

                        {isImage(currentFile) ? (
                            <TransformWrapper initialScale={1} centerOnInit minScale={0.2} maxScale={8}>
                                {({ zoomIn, zoomOut, resetTransform }) => (
                                    <>
                                        {/* Inline Zoom Controls */}
                                        <div className="absolute top-2 right-2 z-50 flex items-center bg-background border border-border rounded shadow-sm opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200">
                                            <Tooltip title="Zoom Out" placement="bottom">
                                                <button onClick={() => zoomOut()} className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors cursor-pointer">
                                                    <FaSearchMinus size={14} />
                                                </button>
                                            </Tooltip>
                                            <div className="w-px h-4 bg-border"></div>
                                            <Tooltip title="Reset Zoom" placement="bottom">
                                                <button onClick={() => resetTransform()} className="px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors cursor-pointer">
                                                    1:1
                                                </button>
                                            </Tooltip>
                                            <div className="w-px h-4 bg-border"></div>
                                            <Tooltip title="Zoom In" placement="bottom">
                                                <button onClick={() => zoomIn()} className="p-2 text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors cursor-pointer">
                                                    <FaSearchPlus size={14} />
                                                </button>
                                            </Tooltip>
                                        </div>
                                        <TransformComponent
                                            wrapperStyle={{ width: "100%", height: "100%" }}
                                            contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "grab" }}
                                        >
                                            <Image
                                                src={currentFile.url}
                                                alt={currentFile.name || "Preview"}
                                                width={1200}
                                                height={800}
                                                unoptimized
                                                className="max-w-full max-h-full object-contain"
                                                onLoad={() => setIsFileLoading(false)}
                                                onError={() => setIsFileLoading(false)}
                                            />
                                        </TransformComponent>
                                    </>
                                )}
                            </TransformWrapper>
                        ) : isPdf(currentFile) ? (
                            <div className="w-full h-full p-0 relative">
                                <object data={currentFile.url} type="application/pdf" className="w-full h-full bg-background" onLoad={() => setIsFileLoading(false)}>
                                    <iframe
                                        src={`https://docs.google.com/gview?url=${encodeURIComponent(currentFile.url)}&embedded=true`}
                                        className="w-full h-full border-none bg-background"
                                        title={currentFile.name}
                                        onLoad={() => setIsFileLoading(false)}
                                    />
                                </object>
                            </div>
                        ) : isOfficeDoc(currentFile) ? (
                            <div className="w-full h-full p-0">
                                <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentFile.url)}`}
                                    title={currentFile.name}
                                    className="w-full h-full border-none bg-background"
                                    onLoad={() => setIsFileLoading(false)}
                                />
                            </div>
                        ) : isTextOrHtml(currentFile) ? (
                            <div className="w-full h-full p-0">
                                <iframe
                                    src={currentFile.url}
                                    title={currentFile.name}
                                    className="w-full h-full border-none bg-background"
                                    onLoad={() => setIsFileLoading(false)}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-text-primary p-6 bg-background">
                                <div className="border border-border p-10 rounded-lg flex flex-col items-center max-w-sm w-full text-center space-y-4 shadow-sm">
                                    <FaFileAlt size={40} className="text-text-secondary opacity-50" />
                                    <div className="text-lg font-medium text-text-primary">Cannot Preview Natively</div>
                                    <div className="text-sm text-text-secondary leading-relaxed">
                                        This specific file type requires a native application to view. Please download it directly.
                                    </div>
                                    <button
                                        onClick={() => downloadSingleFile(currentFile)}
                                        disabled={isDownloading}
                                        className="mt-2 px-5 py-2.5 bg-secondary hover:bg-border border border-border text-text-primary rounded transition-all text-sm font-medium flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload size={14} />}
                                        {isDownloading ? "Downloading..." : "Download File"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Minimal Right Sidebar */}
                    {showSidebar && (
                        <div className="w-64 bg-background flex flex-col h-full flex-shrink-0 z-20">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {files.map((file, index) => {
                                    const selected = selectedIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedIndex(index)}
                                            className={classNames(
                                                "cursor-pointer rounded border transition-all flex flex-col bg-background",
                                                selected
                                                    ? "border-primary shadow-sm"
                                                    : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className="w-full aspect-video flex items-center justify-center overflow-hidden border-b border-border bg-secondary relative">
                                                {renderThumbnailContent(file)}
                                            </div>
                                            <div className="p-2 text-xs font-medium text-text-primary truncate" title={file.name}>
                                                {file.name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DynamicModal>
    );
};

export default DynamicFilePreviewer;