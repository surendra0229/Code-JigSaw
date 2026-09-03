export interface LanguageConfig {
  id: string;
  name: string;
  syntax: string;
  extension: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  c: {
    id: 'c',
    name: 'C',
    syntax: 'c',
    extension: 'c',
    accentColor: '#555555',
    borderColor: 'border-slate-500',
    bgColor: 'bg-slate-500/10',
    description: 'Low-level procedural programming and memory management.'
  },
  python: {
    id: 'python',
    name: 'Python',
    syntax: 'python',
    extension: 'py',
    accentColor: '#3776AB',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Clean, dynamic scripting and high-level readable syntax.'
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    syntax: 'cpp',
    extension: 'cpp',
    accentColor: '#00599C',
    borderColor: 'border-indigo-500',
    bgColor: 'bg-indigo-500/10',
    description: 'High-performance object-oriented system programming.'
  },
  java: {
    id: 'java',
    name: 'Java',
    syntax: 'java',
    extension: 'java',
    accentColor: '#ED8B00',
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Class-based, object-oriented enterprise language.'
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    syntax: 'javascript',
    extension: 'js',
    accentColor: '#F7DF1E',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/10',
    description: 'Versatile web script language powering client & server.'
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    syntax: 'csharp',
    extension: 'cs',
    accentColor: '#239120',
    borderColor: 'border-emerald-600',
    bgColor: 'bg-emerald-600/10',
    description: 'Modern component-oriented .NET framework language.'
  },
  php: {
    id: 'php',
    name: 'PHP',
    syntax: 'php',
    extension: 'php',
    accentColor: '#777BB4',
    borderColor: 'border-purple-400',
    bgColor: 'bg-purple-400/10',
    description: 'Server-side web scripting and hyper-text processor.'
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    syntax: 'typescript',
    extension: 'ts',
    accentColor: '#3178C6',
    borderColor: 'border-sky-500',
    bgColor: 'bg-sky-500/10',
    description: 'Typed superset of JavaScript for scalable application development.'
  }
};

export const getLanguageConfig = (langId: string): LanguageConfig => {
  const normalized = langId.toLowerCase();
  if (SUPPORTED_LANGUAGES[normalized]) {
    return SUPPORTED_LANGUAGES[normalized];
  }
  // Log a warning so this is visible in production logs
  console.warn(
    `[Languages] Unknown language ID "${langId}" — falling back to Python. ` +
    `Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`
  );
  return SUPPORTED_LANGUAGES['python'];
};
