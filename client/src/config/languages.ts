export interface LanguageMeta {
  id: string;
  name: string;
  badge: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  accentHex: string;
  tagline: string;
}

export const LANGUAGES: LanguageMeta[] = [
  {
    id: 'c',
    name: 'C',
    badge: 'C',
    borderColor: 'border-slate-600',
    bgColor: 'bg-slate-800/40',
    textColor: 'text-slate-300',
    accentHex: '#64748B',
    tagline: 'System programming & foundational algorithms'
  },
  {
    id: 'python',
    name: 'Python',
    badge: 'PY',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-950/40',
    textColor: 'text-blue-400',
    accentHex: '#3B82F6',
    tagline: 'Clean syntax, dynamic logic & data processing'
  },
  {
    id: 'cpp',
    name: 'C++',
    badge: 'C++',
    borderColor: 'border-indigo-500/50',
    bgColor: 'bg-indigo-950/40',
    textColor: 'text-indigo-400',
    accentHex: '#6366F1',
    tagline: 'High performance object-oriented systems'
  },
  {
    id: 'java',
    name: 'Java',
    badge: 'JAVA',
    borderColor: 'border-amber-500/50',
    bgColor: 'bg-amber-950/40',
    textColor: 'text-amber-400',
    accentHex: '#F59E0B',
    tagline: 'Enterprise object model & robust concurrency'
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    badge: 'JS',
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-950/40',
    textColor: 'text-yellow-400',
    accentHex: '#EAB308',
    tagline: 'Event-driven web scripting & full-stack applications'
  },
  {
    id: 'csharp',
    name: 'C#',
    badge: 'C#',
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-950/40',
    textColor: 'text-emerald-400',
    accentHex: '#10B981',
    tagline: 'Modern component-oriented .NET framework'
  },
  {
    id: 'php',
    name: 'PHP',
    badge: 'PHP',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-950/40',
    textColor: 'text-purple-400',
    accentHex: '#A855F7',
    tagline: 'Server-side web rendering & backend logic'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    badge: 'TS',
    borderColor: 'border-sky-500/50',
    bgColor: 'bg-sky-950/40',
    textColor: 'text-sky-400',
    accentHex: '#0EA5E9',
    tagline: 'Strict typing for scalable JavaScript apps'
  }
];

export const getLanguageMeta = (id: string): LanguageMeta => {
  const norm = id.toLowerCase();
  return LANGUAGES.find(l => l.id === norm) || LANGUAGES[1]; // fallback python
};
