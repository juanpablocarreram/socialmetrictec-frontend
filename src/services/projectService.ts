import api from '@/src/lib/axios';

export interface ProjectSummary {
  project_id: number;
  project_name: string;
  description: string | null;
  impact_area: string;
  cover_image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface ProjectCreate {
  project_name: string;
  description?: string;
  impact_area: string;
  cover_image_url: string;
  is_active: boolean;
  objetivo?: string;
  localidad?: string;
}

export interface ProjectFull extends ProjectSummary {
  page: unknown | null;
}

export const AREA_LABELS: Record<string, string> = {
  educacion: 'Educación',
  salud: 'Salud',
  justicia_social: 'Justicia Social',
  medio_ambiente: 'Medio Ambiente',
  economia_circular: 'Economía Circular',
  tecnologia_social: 'Tecnología Social',
};

export const formatArea = (area: string): string =>
  AREA_LABELS[area] ?? area;

export const listProjects = async (): Promise<ProjectSummary[]> => {
  const res = await api.get('/project/listpreview');
  return res.data;
};

export const getMyProjects = async (): Promise<ProjectSummary[]> => {
  const res = await api.get('/project/mine');
  return res.data;
};

export const createProject = async (data: ProjectCreate): Promise<ProjectFull> => {
  const res = await api.post('/project/create', data);
  return res.data;
};
