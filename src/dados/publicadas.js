import { ARTISTA } from '../configuracao'

/* Catálogo público autorizado. Os arquivos precisam estar em public/artista/
   ou em uma hospedagem HTTPS. Anexar no navegador NÃO publica aqui.
   Use IDs permanentes: os links compartilhados dependem deles.

   Exemplo (somente depois de verificar a permissão comercial da IA):
   {
     id: 'primeira-cancao',
     titulo: 'Título da canção',
     audio: `${import.meta.env.BASE_URL}artista/primeira-cancao.mp3`,
     capa: `${import.meta.env.BASE_URL}artista/capa.jpg`,
     categoria: 'Autoral',
     letra: 'Letra da canção...',
   },
*/
const faixas = []

export const musicasPublicadas = faixas.map((faixa) => ({
  ...faixa,
  id: `publicada-${faixa.id}`,
  artista: ARTISTA.nome,
  publicada: true,
  apoio: ARTISTA.linkApoio || ARTISTA.pix || null,
}))
