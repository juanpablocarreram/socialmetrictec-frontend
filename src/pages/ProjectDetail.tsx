import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getProject } from '@/src/services/pageService';
import { formatArea } from '@/src/services/projectService';
import { getMetrics, MetricOut } from '@/src/services/metricService';
import { getPhotos, PhotoOut } from '@/src/services/photoService';
import { getTestimonies, TestimonyOut } from '@/src/services/testimonyService';
import { PagePreview, type BackendBlock } from '../components/BlockRenderer';

interface PageStyles {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Awaited<ReturnType<typeof getProject>> | null>(null);
  const [metrics, setMetrics] = useState<MetricOut[]>([]);
  const [photos, setPhotos] = useState<PhotoOut[]>([]);
  const [testimonies, setTestimonies] = useState<TestimonyOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProject(Number(id)),
      getMetrics(Number(id)),
      getPhotos(Number(id)),
      getTestimonies(Number(id)),
    ])
      .then(([p, m, ph, t]) => {
        setProject(p);
        setMetrics(m);
        setPhotos(ph);
        setTestimonies(t);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-error font-bold">
        Proyecto no encontrado.
      </div>
    );
  }

  const page = project.page as { blocks: BackendBlock[]; general_props: { styles?: PageStyles } } | null;
  const styles: PageStyles = page?.general_props?.styles ?? {};
  const primaryColor = styles.primaryColor ?? '#002068';
  const secondaryColor = styles.secondaryColor ?? '#525d85';
  const fontFamily = styles.fontFamily ?? 'Manrope';
  const blocks: BackendBlock[] = page?.blocks ?? [];

  const defaultHero = (
    <section className="relative h-[70vh] w-full bg-slate-900 overflow-hidden">
      {project.cover_image_url && (
        <img
          alt={project.project_name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src={project.cover_image_url}
        />
      )}
      <div
        className="relative h-full flex flex-col justify-center items-center text-center p-16 bg-gradient-to-b from-transparent via-primary/20 to-primary/80"
        style={{ backgroundColor: project.cover_image_url ? undefined : primaryColor }}
      >
        <span className="text-white/60 font-bold text-xs uppercase tracking-widest mb-4">
          {formatArea(project.impact_area)}
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight max-w-5xl mb-6 tracking-tighter" style={{ fontFamily }}>
          {project.project_name}
        </h1>
        {project.description && (
          <p className="text-xl text-white/80 max-w-3xl font-light leading-relaxed" style={{ fontFamily }}>
            {project.description}
          </p>
        )}
      </div>
    </section>
  );

  return (
    <div className="flex flex-col min-h-screen bg-surface" style={{ fontFamily }}>
      {blocks.length === 0 && defaultHero}

      <PagePreview
        blocks={blocks}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        metrics={metrics}
        fontFamily={fontFamily}
        heroFallbackUrl={project.cover_image_url ?? undefined}
      />

      {/* Photo gallery */}
      {photos.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-2xl font-bold text-primary tracking-tight mb-8">Galería del Proyecto</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, idx) => (
                <motion.div
                  key={photo.photo_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="aspect-square rounded-2xl overflow-hidden group relative"
                >
                  <img src={photo.url} alt={photo.caption ?? ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs font-medium">{photo.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonies */}
      {testimonies.length > 0 && (
        <section className="py-16 bg-surface-container-lowest">
          <div className="max-w-4xl mx-auto px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary tracking-tight">Testimonios</h2>
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{testimonies.length} testimonio{testimonies.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-6">
              {testimonies.map((t, i) => (
                <motion.div key={t.testimony_id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold text-primary">{t.author_username}</p>
                      <p className="text-[10px] text-outline">{new Date(t.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    {t.category && <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/5 text-primary px-3 py-1 rounded-full">{t.category}</span>}
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{t.content}</p>
                  {t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {t.tags.map((tag) => <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-surface-container-low text-outline rounded-full">{tag}</span>)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-24 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-8 space-y-8">
          <h2 className="text-4xl font-bold tracking-tighter">SocialMetricTec</h2>
          <p className="text-lg text-white/60 font-light max-w-lg mx-auto">
            Plataforma de curaduría de impacto social para la excelencia académica.
          </p>
          <div className="pt-12 border-t border-white/10 text-xs uppercase tracking-widest opacity-50">
            © 2026 Tecnológico de Monterrey
          </div>
        </div>
      </footer>
    </div>
  );
}
