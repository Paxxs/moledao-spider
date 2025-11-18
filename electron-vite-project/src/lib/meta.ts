import pkg from '../../package.json'

export const appMeta = {
  name: pkg.productName ?? pkg.name ?? 'App',
  author: (pkg.appAuthor ?? (typeof pkg.author === 'string' ? pkg.author : pkg.author?.name)) ?? 'Unknown',
  contact: pkg.appContact ?? pkg.homepage ?? '',
}
