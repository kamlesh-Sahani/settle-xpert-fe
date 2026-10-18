"use client";

import { memo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { ImageCellType } from "../types";
import { IMAGE_DEFAULT_SIZE } from "../utils/constants";
import { FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileCode } from "react-icons/fa";

const DynamicFilePreviewer = dynamic(() => import("../../DynamicFilePreviewer"), { ssr: false });

const getExt = (url: string) => url.split('.').pop()?.split('?')[0]?.toLowerCase() || '';

const isImage = (url: string) => {
  if (url.includes('avatars.githubusercontent.com')) return true;
  if (url.includes('googleusercontent.com')) return true;
  if (url.includes('avatar')) return true;
  const ext = getExt(url);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(ext);
};

function ImageCell({ src, alt, isPreview, width, height, shape = "circle" }: ImageCellType) {
  const size = width ?? IMAGE_DEFAULT_SIZE;
  const h = height ?? size;
  const borderRadius = shape === "circle" ? "50%" : 6;

  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  const ext = getExt(src);
  const isImg = isImage(src);
  const isPdf = ext === 'pdf';
  const isWord = ['doc', 'docx'].includes(ext);
  const isExcel = ['xls', 'xlsx', 'csv'].includes(ext);
  const isPowerpoint = ['ppt', 'pptx'].includes(ext);
  const isHtml = ['htm', 'html'].includes(ext);

  const getIcon = () => {
    const iconSize = Math.max((size as number) * 0.6, 16);
    if (isPdf) return <FaFilePdf size={iconSize} className="text-danger" />;
    if (isWord) return <FaFileWord size={iconSize} className="text-primary" />;
    if (isExcel) return <FaFileExcel size={iconSize} className="text-success" />;
    if (isPowerpoint) return <FaFilePowerpoint size={iconSize} className="text-warning" />;
    if (isHtml) return <FaFileCode size={iconSize} className="text-purple-500" />;
    return <FaFileAlt size={iconSize} className="text-text-secondary" />;
  };

  const handleClick = () => {
    if (isPreview) setIsOpen(true);
  };

  const renderThumbnail = () => {
    if (isImg) {
      return (
        <Image
          src={src}
          alt={alt ?? "file"}
          width={typeof size === "number" ? size : 40}
          height={typeof h === "number" ? h : 40}
          unoptimized
          role={isPreview ? "button" : undefined}
          tabIndex={isPreview ? 0 : undefined}
          className={isPreview ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
          style={{
            borderRadius,
            objectFit: "cover",
            flexShrink: 0,
          }}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (isPreview && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleClick();
            }
          }}
        />
      );
    }

    return (
      <div
        role={isPreview ? "button" : undefined}
        tabIndex={isPreview ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (isPreview && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`flex items-center justify-center bg-secondary border border-border flex-shrink-0 ${isPreview ? 'cursor-pointer hover:bg-border transition-colors' : ''}`}
        style={{ width: size, height: h, borderRadius }}
        title={alt || "File"}
      >
        {getIcon()}
      </div>
    );
  };

  return (
    <>
      {renderThumbnail()}

      {isPreview && isOpen && (
        <DynamicFilePreviewer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          files={[{ url: src, name: alt || src.split('/').pop() || 'file' }]}
        />
      )}
    </>
  );
}

export default memo(ImageCell);
