import pkg from '../../package.json'

const commitHash = import.meta.env?.VITE_APP_COMMIT ?? 'dev-build'

export const appMeta = {
  name: pkg.productName ?? pkg.name ?? 'App',
  author: (pkg.appAuthor ?? (typeof pkg.author === 'string' ? pkg.author : pkg.author?.name)) ?? 'Unknown',
  contact: pkg.appContact ?? pkg.homepage ?? '',
  version: pkg.version ?? '0.0.0',
  commit: commitHash,
}
