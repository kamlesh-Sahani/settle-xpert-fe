import { uploadApi } from "@/common/utils/api";

export interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Uploads a file directly to cloud storage (S3/MinIO) via the 3-step Presigned URL flow:
 * 1. Requests a presigned POST policy from the backend.
 * 2. Uploads the raw file directly to storage with progress tracking (0% -> 90%).
 * 3. Verifies file arrival with the backend and returns the confirmed permanent URL.
 */
export async function uploadFileToS3(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { folder = "uploads", onProgress } = options;
  const contentType = file.type || "application/octet-stream";

  // Step 1: Request Presigned POST policy from backend
  const res: any = await uploadApi.getPresignedUrl({
    filename: file.name,
    contentType,
    folder,
  });

  const payload = res?.data?.data || res?.data || res;
  const { url, fields, key } = payload || {};

  if (!url || !fields || !key) {
    throw new Error(res?.message || "Failed to obtain upload ticket from server");
  }

  // Step 2: Upload directly to S3 via FormData with live progress
  await uploadWithProgress(url, fields, file, (percent) => {
    onProgress?.(Math.round(percent * 0.9)); // Map storage progress to 0% - 90%
  });

  onProgress?.(95); // Verifying with backend

  // Step 3: Verify upload with backend
  const verifyRes: any = await uploadApi.verifyUpload({ key });

  const verified = verifyRes?.data?.data || verifyRes?.data || verifyRes;
  const bucketUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  const finalUrl = verified?.url || `${bucketUrl}/${key}`;

  onProgress?.(100);

  return {
    url: finalUrl,
    key: verified?.key || key,
  };
}

/**
 * Helper to stream FormData to storage via XMLHttpRequest to track live upload progress.
 */
function uploadWithProgress(
  url: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during file upload"));
    xhr.send(formData);
  });
}
