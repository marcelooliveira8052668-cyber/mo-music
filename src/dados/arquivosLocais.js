/* Somente para desenvolvimento: o build usa arquivosLocais.publico.js. */
export const arquivosDeAudio = import.meta.glob(
  '../assets/musicas/*.{mp3,m4a,ogg,wav}',
  { eager: true, query: '?url', import: 'default' }
)
