import React from "react";
import Image from "next/image";

export type PreviewStrategy = "image" | "media" | "iframe" | "pdf" | "text" | "spreadsheet" | "fallback";

export interface FileCategory {
  id: string;
  name: string;
  extensions: string[];
  iconPath: string;
  previewStrategy: PreviewStrategy;
}

export const FILE_CATEGORIES: FileCategory[] = [
  { id: "pdf", name: "PDF Document", extensions: ["pdf"], iconPath: "/icons/pdf-colored.png", previewStrategy: "pdf" },
  { id: "word", name: "Word Document", extensions: ["doc", "docx", "odt"], iconPath: "/icons/word-colored.png", previewStrategy: "fallback" },
  { id: "text", name: "Plain & Rich Text", extensions: ["txt", "rtf", "md"], iconPath: "/icons/file.png", previewStrategy: "text" },
  { id: "spreadsheet", name: "Spreadsheet", extensions: ["xls", "xlsx", "xlsm", "ods", "wk1", "wk3"], iconPath: "/icons/excel-icon.png", previewStrategy: "spreadsheet" },
  { id: "csv_tsv", name: "Data Table", extensions: ["csv", "tsv"], iconPath: "/icons/csv-icon.png", previewStrategy: "spreadsheet" },
  { id: "presentation", name: "Presentation", extensions: ["ppt", "pptx", "pps", "odp", "key"], iconPath: "/icons/PPT.svg", previewStrategy: "fallback" },
  { id: "image_raster", name: "Image", extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic", "avif", "ico", "tif", "tiff"], iconPath: "/icons/file.png", previewStrategy: "image" },
  { id: "image_raw", name: "RAW Image", extensions: ["cr2", "cr3", "nef", "arw", "dng", "orf", "raf"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "vector", name: "Vector Graphic", extensions: ["svg"], iconPath: "/icons/file.png", previewStrategy: "image" },
  { id: "vector_fallback", name: "Vector Graphic", extensions: ["eps", "ai", "cdr", "wmf", "emf"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "audio", name: "Audio", extensions: ["mp3", "wav", "aac", "ogg", "flac", "aiff", "mid", "midi", "wma", "m4a", "opus"], iconPath: "/icons/mp3-icon.png", previewStrategy: "media" },
  { id: "video", name: "Video", extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm", "mpeg", "mpg", "m4v", "3gp"], iconPath: "/icons/Video.svg", previewStrategy: "media" },
  { id: "archive", name: "Archive", extensions: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "cab", "iso"], iconPath: "/icons/Zip.svg", previewStrategy: "fallback" },
  { id: "source_code", name: "Source Code", extensions: ["js", "ts", "tsx", "py", "java", "go", "c", "cpp", "cs", "rs", "php", "rb", "swift", "kt", "dart", "scala", "sh", "sql", "h"], iconPath: "/icons/file.png", previewStrategy: "text" },
  { id: "web", name: "Web File", extensions: ["html", "css", "scss", "less", "jsx", "xml", "json", "jsonl", "yaml", "yml"], iconPath: "/icons/file.png", previewStrategy: "iframe" },
  { id: "config", name: "Configuration", extensions: ["ini", "env", "toml", "cfg", "conf", "properties"], iconPath: "/icons/file.png", previewStrategy: "text" },
  { id: "executable", name: "Executable / App", extensions: ["exe", "msi", "dll", "app", "dmg", "apk", "ipa"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "database", name: "Database", extensions: ["sqlite", "db", "sqlite3", "mdb", "accdb", "parquet", "orc", "avro", "bson", "msgpack"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "design", name: "Design File", extensions: ["psd", "xd", "fig", "sketch", "indd"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "cad", name: "CAD / Engineering", extensions: ["dwg", "dxf", "step", "stp", "iges", "igs", "stl", "ifc"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "3d_model", name: "3D Model", extensions: ["obj", "fbx", "gltf", "glb", "blend", "usd", "3ds"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "ebook", name: "E-book", extensions: ["epub", "mobi", "azw", "azw3", "fb2"], iconPath: "/icons/pdf-colored.png", previewStrategy: "fallback" },
  { id: "font", name: "Font", extensions: ["ttf", "otf", "woff", "woff2", "eot"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "certificate", name: "Certificate / Key", extensions: ["pem", "cer", "crt", "p12", "pfx", "key"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "email", name: "Email", extensions: ["eml", "msg", "mbox", "pst", "ost"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "logs_backups", name: "Log / Backup", extensions: ["log", "bak", "dump", "tmp"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "scientific", name: "Scientific / GIS", extensions: ["nc", "h5", "fits", "shp", "geojson", "kml"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "game", name: "Game File", extensions: ["unitypackage", "uasset", "rom", "sav", "pak"], iconPath: "/icons/Zip.svg", previewStrategy: "fallback" },
  { id: "container", name: "Virtualization", extensions: ["vmdk", "vdi", "qcow2", "ova", "ovf"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
  { id: "misc", name: "Miscellaneous", extensions: ["torrent", "ics", "vcf", "srt", "vtt", "bin"], iconPath: "/icons/file.png", previewStrategy: "fallback" },
];

const getExt = (fileName: string) => fileName.split(".").pop()?.toLowerCase() || "";

const FALLBACK_CATEGORY: FileCategory = {
  id: "unknown",
  name: "Unknown File",
  extensions: [],
  iconPath: "/icons/file.png",
  previewStrategy: "fallback",
};

export const resolveFileType = (fileName: string = "", mimeType: string = ""): FileCategory => {
  const ext = getExt(fileName);
  const type = mimeType.toLowerCase();

  if (type.startsWith("image/")) return FILE_CATEGORIES.find((c) => c.id === "image_raster") || FALLBACK_CATEGORY;
  if (type.startsWith("video/")) return FILE_CATEGORIES.find((c) => c.id === "video") || FALLBACK_CATEGORY;
  if (type.startsWith("audio/")) return FILE_CATEGORIES.find((c) => c.id === "audio") || FALLBACK_CATEGORY;
  if (type === "application/pdf") return FILE_CATEGORIES.find((c) => c.id === "pdf") || FALLBACK_CATEGORY;
  if (type === "text/html") return FILE_CATEGORIES.find((c) => c.id === "web") || FALLBACK_CATEGORY;

  for (const category of FILE_CATEGORIES) {
    if (category.extensions.includes(ext)) {
      return category;
    }
  }

  if (type.startsWith("text/")) return FILE_CATEGORIES.find((c) => c.id === "text") || FALLBACK_CATEGORY;

  return FALLBACK_CATEGORY;
};

export const getFileIcon = (
  fileName: string = "",
  mimeType: string = "",
  props?: React.SVGProps<SVGSVGElement> & { size?: number | string; className?: string }
): React.ReactNode => {
  const category = resolveFileType(fileName, mimeType);
  
  const sizeMap: Record<string, string> = {
    "24": "1.5rem",
    "32": "2rem",
    "48": "3rem",
    "64": "4rem",
  };
  
  const rawSize = props?.size?.toString() || "64";
  let finalSize = sizeMap[rawSize] || rawSize;
  
  if (/^\d+$/.test(finalSize)) {
    finalSize = `${finalSize}px`;
  }

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: finalSize, height: finalSize }} // Keep it perfect 
    >
      <Image 
        src={category.iconPath} 
        alt="file icon"
        fill
        className="object-contain"
      />
    </div>
  );
};

export const getFileColorClass = (_fileName: string = "", _mimeType: string = ""): string => {
  return "text-gray-500"; // Legacy fallback if anything is still using text colors
};

export const getPreviewStrategy = (fileName: string = "", mimeType: string = ""): PreviewStrategy => {
  const category = resolveFileType(fileName, mimeType);
  return category.previewStrategy;
};
