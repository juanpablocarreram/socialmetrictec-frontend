import api from '@/src/lib/axios';

export const CATEGORIES = [
  'Logros y resultados',
  'Retos y obstáculos',
  'Aprendizajes',
  'Impacto comunitario',
  'Gestión del proyecto',
  'Colaboración',
  'Otro',
];

export interface TestimonyCreate {
  content: string;
  category?: string;
  tags?: string[];
}

export interface TestimonyOut {
  testimony_id: number;
  project_id: number;
  author_username: string;
  content: string;
  category: string | null;
  tags: string[];
  created_at: string;
}

export const getTestimonies = async (projectId: number): Promise<TestimonyOut[]> => {
  const res = await api.get(`/project/${projectId}/testimonies`);
  return res.data;
};

export const createTestimony = async (projectId: number, data: TestimonyCreate): Promise<TestimonyOut> => {
  const res = await api.post(`/project/${projectId}/testimonies`, data);
  return res.data;
};

export const deleteTestimony = async (projectId: number, testimonyId: number): Promise<void> => {
  await api.delete(`/project/${projectId}/testimonies/${testimonyId}`);
};

export const exportTestimoniesCSV = async (projectId?: number): Promise<void> => {
  const url = projectId ? `/testimonies/export?project_id=${projectId}` : '/testimonies/export';
  const res = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'testimonios.csv';
  link.click();
};
