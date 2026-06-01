import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  CloudUpload,
  ChevronLeft,
  GraduationCap,
  Stethoscope,
  Leaf,
  Scale,
  RefreshCcw,
  Cpu,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { createProject } from '@/src/services/projectService';

const STRATEGIC_AREAS = [
  { label: 'Educación', value: 'educacion', icon: GraduationCap, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { label: 'Salud', value: 'salud', icon: Stethoscope, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { label: 'Medio Ambiente', value: 'medio_ambiente', icon: Leaf, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { label: 'Justicia Social', value: 'justicia_social', icon: Scale, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { label: 'Economía Circular', value: 'economia_circular', icon: RefreshCcw, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { label: 'Tecnología Social', value: 'tecnologia_social', icon: Cpu, color: 'bg-violet-50 text-violet-600 border-violet-100' },
];

const DESC_MIN = 100;
const DESC_MAX = 500;

export default function CreateProject() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objetivo: '',
    localidad: '',
    area: 'educacion',
    image: '',
  });

  const descLen = formData.description.trim().length;
  const descValid = descLen >= DESC_MIN && descLen <= DESC_MAX;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!descValid) {
      setError(`El resumen debe tener entre ${DESC_MIN} y ${DESC_MAX} caracteres. Actualmente: ${descLen}.`);
      return;
    }

    setSubmitting(true);
    try {
      const project = await createProject({
        project_name: formData.name,
        description: formData.description,
        impact_area: formData.area,
        cover_image_url: formData.image || 'https://picsum.photos/seed/project/800/600',
        is_active: true,
        objetivo: formData.objetivo || undefined,
        localidad: formData.localidad || undefined,
      });
      navigate(`/editor/${project.project_id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al crear el proyecto. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-20">
      <div className="bg-white border-b border-outline-variant/10 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-outline hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold text-primary tracking-tighter">Nueva Iniciativa</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl border border-outline-variant/10 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Nombre del Proyecto
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Escribe el nombre de tu proyecto..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-4xl font-extrabold tracking-tighter text-primary placeholder:text-outline-variant/30 border-none bg-transparent focus:ring-0 p-0"
                  />
                  <div className="h-0.5 w-20 bg-primary/20 rounded-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Resumen del Proyecto *</label>
                    <span className={cn('text-[10px] font-bold', !descValid && formData.description.length > 0 ? 'text-error' : descValid ? 'text-emerald-600' : 'text-outline')}>
                      {descLen} / {DESC_MIN}–{DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe el impacto esperado (100–500 caracteres)..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl p-6 text-sm focus:ring-2 focus:ring-primary transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Objetivo Principal *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="¿Qué problema resuelve o qué cambio genera este proyecto?"
                    value={formData.objetivo}
                    onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl p-6 text-sm focus:ring-2 focus:ring-primary transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Localidad *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Monterrey, N.L."
                    value={formData.localidad}
                    onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl p-6 text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Imagen de Presentación
                </label>
                <div className="group relative aspect-[4/3] rounded-[24px] overflow-hidden bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex items-center justify-center transition-all hover:border-primary/50">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center px-6">
                      <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <CloudUpload className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                          Pega una URL de imagen
                        </p>
                        <p className="text-[10px] text-outline font-medium">Recomendado: 1200x800px</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="https://..."
                    className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border-none rounded-xl py-2 px-4 text-[10px] focus:ring-2 focus:ring-primary outline-none shadow-lg text-outline font-medium"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Selecciona el Área de Impacto
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STRATEGIC_AREAS.map((area) => (
                  <button
                    key={area.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, area: area.value })}
                    className={cn(
                      'flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border group relative overflow-hidden',
                      formData.area === area.value
                        ? 'bg-primary text-white border-primary shadow-xl scale-[1.02]'
                        : 'bg-white text-on-surface-variant border-outline-variant/20 hover:border-primary/50 hover:bg-surface-container-lowest',
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-inner',
                        formData.area === area.value ? 'bg-white/20' : area.color,
                      )}
                    >
                      <area.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">{area.label}</span>
                    {formData.area === area.value && (
                      <motion.div layoutId="active-area" className="absolute bottom-0 left-0 right-0 h-1 bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-error text-sm font-medium text-center">{error}</p>
            )}

            <div className="pt-8 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-outline-variant/10">
              <div className="flex items-center gap-3 text-outline">
                <div className="w-10 h-10 rounded-full border border-outline-variant/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 opacity-50" />
                </div>
                <p className="text-[10px] text-outline-variant">Toda la configuración puede editarse después en el Editor.</p>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-grow md:flex-none px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-low transition-all rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-grow md:flex-none px-12 py-4 bg-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      Lanzar Proyecto
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
