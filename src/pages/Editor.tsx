import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Trash2, Image as ImageIcon, Video,
  AlignLeft, Minus, Check, Loader2, Eye, Pencil,
} from 'lucide-react';
import { getProject, savePage, BackendPage } from '@/src/services/pageService';
import { getMyProjects } from '@/src/services/projectService';
import { useAuth } from '../context/AuthContext';
import { PagePreview } from '../components/BlockRenderer';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = 'text' | 'image' | 'video' | 'divider';

interface Section {
  id: string;
  type: SectionType;
  title?: string;
  body?: string;
  quote?: string;
  url?: string;
  caption?: string;
}

interface PageState {
  coverImage: string;
  headline: string;
  subtitle: string;
  primaryColor: string;
  sections: Section[];
}

const DEFAULT_STATE: PageState = {
  coverImage: '',
  headline: '',
  subtitle: '',
  primaryColor: '#002068',
  sections: [],
};

// ─── Serialization ────────────────────────────────────────────────────────────

function toBackendPage(state: PageState): BackendPage {
  return {
    blocks: [
      {
        type: 'hero',
        props: {
          headline: state.headline,
          subtitle: state.subtitle,
          url: state.coverImage,
        },
      },
      ...state.sections.map((s) => ({
        type: s.type === 'text' ? 'narrative' : s.type,
        props: {
          title: s.title ?? '',
          body: s.body ?? '',
          quote: s.quote ?? '',
          url: s.url ?? '',
          caption: s.caption ?? '',
        },
      })),
    ],
    general_props: {
      styles: { primaryColor: state.primaryColor },
    },
  };
}

function fromBackendPage(
  page: BackendPage,
  fallback: { name: string; description: string },
): PageState {
  const hero = page.blocks.find((b) => b.type === 'hero');
  const sections: Section[] = page.blocks
    .filter((b) => b.type !== 'hero')
    .map((b, i) => ({
      id: `${b.type}-${i}`,
      type: (b.type === 'narrative' ? 'text' : b.type) as SectionType,
      title: b.props.title as string,
      body: b.props.body as string,
      quote: b.props.quote as string,
      url: b.props.url as string,
      caption: b.props.caption as string,
    }));

  const styles = (page.general_props?.styles ?? {}) as { primaryColor?: string };

  return {
    coverImage: (hero?.props.url as string) ?? '',
    headline: (hero?.props.headline as string) ?? fallback.name,
    subtitle: (hero?.props.subtitle as string) ?? fallback.description,
    primaryColor: styles.primaryColor ?? '#002068',
    sections,
  };
}

// ─── Section Card Wrapper ─────────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { label: string; dot: string }> = {
  text:    { label: 'Texto',      dot: '#3b82f6' },
  image:   { label: 'Imagen',     dot: '#10b981' },
  video:   { label: 'Video',      dot: '#8b5cf6' },
  divider: { label: 'Separador',  dot: '#9ca3af' },
};

function SectionCard({
  type,
  onDelete,
  children,
}: {
  type: SectionType;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const meta = SECTION_META[type];
  return (
    <div className="rounded-2xl border border-outline-variant/10 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 bg-surface-container-low/50 border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.dot }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
            {meta.label}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-outline-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"
          title="Eliminar sección"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Section Editors ──────────────────────────────────────────────────────────

function TextSection({
  section,
  onChange,
}: {
  section: Section;
  onChange: (s: Partial<Section>) => void;
}) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={section.title ?? ''}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Título de la sección (opcional)"
        className="w-full text-xl font-bold text-primary bg-transparent border-none outline-none placeholder:text-outline-variant/30"
      />
      <div className="h-px bg-outline-variant/10" />
      <textarea
        value={section.body ?? ''}
        onChange={(e) => onChange({ body: e.target.value })}
        placeholder="Escribe aquí el contenido de esta sección..."
        className="w-full text-base text-on-surface-variant bg-transparent border-none outline-none resize-none leading-relaxed placeholder:text-outline-variant/30"
        rows={5}
        onInput={(e) => {
          const t = e.currentTarget;
          t.style.height = 'auto';
          t.style.height = t.scrollHeight + 'px';
        }}
      />
      <div className="border-l-4 border-primary/20 pl-4">
        <textarea
          value={section.quote ?? ''}
          onChange={(e) => onChange({ quote: e.target.value })}
          placeholder="Cita destacada (opcional)..."
          className="w-full italic text-outline bg-transparent border-none outline-none resize-none placeholder:text-outline-variant/20 text-sm"
          rows={2}
        />
      </div>
    </div>
  );
}

function ImageSection({
  section,
  onChange,
}: {
  section: Section;
  onChange: (s: Partial<Section>) => void;
}) {
  return (
    <div className="space-y-4">
      {section.url ? (
        <img
          src={section.url}
          alt=""
          className="w-full aspect-video object-cover rounded-xl"
        />
      ) : (
        <div className="w-full aspect-video rounded-xl bg-surface-container flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 gap-3">
          <ImageIcon className="w-10 h-10 text-outline/30" />
          <p className="text-sm text-outline/40">Pega la URL de la imagen abajo</p>
        </div>
      )}
      <input
        type="url"
        value={section.url ?? ''}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="URL de la imagen (https://...)"
        className="w-full text-sm bg-surface-container-low rounded-xl px-4 py-3 outline-none border border-outline-variant/20 focus:border-primary/40 transition-colors placeholder:text-outline/30 font-mono"
      />
      <input
        type="text"
        value={section.caption ?? ''}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Leyenda de la imagen (opcional)"
        className="w-full text-sm text-center text-on-surface-variant bg-transparent border-none outline-none placeholder:text-outline-variant/30"
      />
    </div>
  );
}

function VideoSection({
  section,
  onChange,
}: {
  section: Section;
  onChange: (s: Partial<Section>) => void;
}) {
  return (
    <div className="space-y-4">
      {section.url ? (
        <video
          src={section.url}
          controls
          className="w-full rounded-xl bg-black max-h-[360px]"
        />
      ) : (
        <div className="w-full aspect-video rounded-xl bg-surface-container flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 gap-3">
          <Video className="w-10 h-10 text-outline/30" />
          <p className="text-sm text-outline/40">Pega la URL del video abajo</p>
        </div>
      )}
      <input
        type="url"
        value={section.url ?? ''}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="URL del video (https://...)"
        className="w-full text-sm bg-surface-container-low rounded-xl px-4 py-3 outline-none border border-outline-variant/20 focus:border-primary/40 transition-colors placeholder:text-outline/30 font-mono"
      />
      <input
        type="text"
        value={section.title ?? ''}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Título del video (opcional)"
        className="w-full text-sm font-bold text-primary bg-transparent border-none outline-none placeholder:text-outline-variant/30"
      />
    </div>
  );
}

function DividerSection() {
  return (
    <div className="py-2">
      <div className="h-px bg-outline-variant/20 rounded-full" />
      <p className="text-center text-[10px] text-outline/30 mt-3 uppercase tracking-widest">
        Línea separadora
      </p>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<PageState>(DEFAULT_STATE);
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!projectId || !user) return;
    if (!user.is_admin) {
      getMyProjects()
        .then((mine) => {
          if (!mine.some((p) => String(p.project_id) === projectId)) setForbidden(true);
        })
        .catch(() => setForbidden(true));
    }
    getProject(Number(projectId))
      .then((project) => {
        setProjectName(project.project_name);
        if (project.page) {
          setState(
            fromBackendPage(project.page as BackendPage, {
              name: project.project_name,
              description: project.description ?? '',
            }),
          );
        } else {
          setState({
            ...DEFAULT_STATE,
            headline: project.project_name,
            subtitle: project.description ?? '',
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const publish = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await savePage(Number(projectId), toBackendPage(state));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type: SectionType) =>
    setState((prev) => ({
      ...prev,
      sections: [...prev.sections, { id: `${type}-${Date.now()}`, type }],
    }));

  const updateSection = (id: string, updates: Partial<Section>) =>
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));

  const removeSection = (id: string) =>
    setState((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));

  // ─── Guard states ────────────────────────────────────────────────────────────

  if (!projectId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface">
        <p className="text-on-surface-variant text-lg">No hay ningún proyecto seleccionado.</p>
        <Link to="/create-project" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
          Crear proyecto
        </Link>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface">
        <p className="text-2xl font-bold text-primary">Sin acceso</p>
        <p className="text-on-surface-variant">No tienes permisos para editar este proyecto.</p>
        <Link to="/directory" className="text-primary font-bold hover:underline">
          Ir al directorio
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const backendPage = toBackendPage(state);

  return (
    <div className="min-h-screen bg-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* ─── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/10 px-6 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-outline hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>

        <span className="text-sm font-bold text-primary truncate max-w-xs hidden md:block">
          {projectName}
        </span>

        <div className="flex items-center gap-3">
          <Link
            to={`/project/${projectId}`}
            target="_blank"
            className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-surface-container-low"
          >
            <Eye className="w-4 h-4" /> Ver publicado
          </Link>

          <button
            onClick={() => setPreview((p) => !p)}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
              preview
                ? 'bg-primary text-white shadow-sm'
                : 'text-outline hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            {preview ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{preview ? 'Editar' : 'Vista previa'}</span>
          </button>

          <button
            onClick={publish}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60 shadow-lg"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saved ? 'Guardado' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* ─── Preview mode ────────────────────────────────────────────────────── */}
      {preview && (
        <div className="bg-surface-container-low/30 min-h-[calc(100vh-57px)]">
          <div className="flex justify-center py-5 px-6">
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold px-5 py-2.5 rounded-full uppercase tracking-widest">
              Vista previa — así se verá la página al publicar
            </div>
          </div>
          <div className="bg-white shadow-2xl mx-auto max-w-5xl rounded-2xl overflow-hidden mb-16 ring-1 ring-outline-variant/10">
            <PagePreview
              blocks={backendPage.blocks}
              primaryColor={state.primaryColor}
            />
          </div>
        </div>
      )}

      {/* ─── Edit mode ───────────────────────────────────────────────────────── */}
      {!preview && (
        <>
          {/* Hero editor */}
          <div className="relative w-full" style={{ backgroundColor: state.primaryColor }}>
            <div className="w-full h-[55vh] relative overflow-hidden">
              {state.coverImage ? (
                <img
                  src={state.coverImage}
                  alt=""
                  className="w-full h-full object-cover opacity-70"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20">
                  <ImageIcon className="w-12 h-12 text-white" />
                  <span className="text-white text-sm font-medium">
                    Pega la URL de la imagen de portada abajo
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end px-8 md:px-24 pb-12 pointer-events-none">
              <div className="pointer-events-auto max-w-4xl mx-auto w-full space-y-4">
                <input
                  type="text"
                  value={state.headline}
                  onChange={(e) => setState((p) => ({ ...p, headline: e.target.value }))}
                  placeholder="Título del proyecto..."
                  className="w-full text-4xl md:text-6xl font-extrabold text-white bg-transparent border-none outline-none placeholder:text-white/30 tracking-tighter leading-tight"
                />
                <input
                  type="text"
                  value={state.subtitle}
                  onChange={(e) => setState((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Subtítulo o descripción breve..."
                  className="w-full text-xl text-white/80 bg-transparent border-none outline-none placeholder:text-white/20 font-light"
                />
              </div>
            </div>

            {/* Color picker */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2">
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                Color
              </span>
              <input
                type="color"
                value={state.primaryColor}
                onChange={(e) => setState((p) => ({ ...p, primaryColor: e.target.value }))}
                className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
              />
            </div>
          </div>

          {/* Cover image URL input */}
          <div className="bg-white border-b border-outline-variant/10 px-6 md:px-12 py-4">
            <div className="max-w-3xl mx-auto">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                URL imagen de portada
              </label>
              <input
                type="url"
                value={state.coverImage}
                onChange={(e) => setState((p) => ({ ...p, coverImage: e.target.value }))}
                placeholder="https://..."
                className="w-full text-sm bg-surface-container-low rounded-xl px-4 py-3 outline-none border border-outline-variant/20 focus:border-primary/40 transition-colors placeholder:text-outline/30 font-mono"
              />
            </div>
          </div>

          {/* Sections */}
          <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 space-y-6">
            {state.sections.map((section) => {
              const onChange = (u: Partial<Section>) => updateSection(section.id, u);
              const onDelete = () => removeSection(section.id);
              return (
                <SectionCard key={section.id} type={section.type} onDelete={onDelete}>
                  {section.type === 'text' && (
                    <TextSection section={section} onChange={onChange} />
                  )}
                  {section.type === 'image' && (
                    <ImageSection section={section} onChange={onChange} />
                  )}
                  {section.type === 'video' && (
                    <VideoSection section={section} onChange={onChange} />
                  )}
                  {section.type === 'divider' && <DividerSection />}
                </SectionCard>
              );
            })}

            {/* Add section toolbar */}
            <div className="flex flex-wrap justify-center gap-3 py-8 border-2 border-dashed border-outline-variant/20 rounded-3xl bg-white/60">
              <p className="w-full text-center text-[10px] font-bold text-outline uppercase tracking-widest mb-1">
                Añadir sección
              </p>
              {(
                [
                  { type: 'text' as const, icon: AlignLeft, label: 'Texto' },
                  { type: 'image' as const, icon: ImageIcon, label: 'Imagen' },
                  { type: 'video' as const, icon: Video, label: 'Video' },
                  { type: 'divider' as const, icon: Minus, label: 'Separador' },
                ] as const
              ).map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => addSection(type)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all text-sm font-bold"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
