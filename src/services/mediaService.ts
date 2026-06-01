import apiClient from '@/src/lib/axios';

export interface MediaUploadResponse {
  url: string;
  path: string;
  content_type: string;
  size_bytes: number;
}

export const uploadMedia = async (
  projectId: number,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<MediaUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post(`/project/${projectId}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  return res.data;
};
