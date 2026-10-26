/* ============================================= */
/* IDENTIDADE DA PLATAFORMA                      */
/* ARQUIVO: src/configuracao.js                  */
/* ============================================= */

/* ============================================= */
/* MARCA DO SITE                                 */
/* ============================================= */

/* Eu centralizo a identidade visual em um arquivo só.
   Na entrega para um cliente, troque apenas os textos daqui
   (e o <title> do index.html) — o site inteiro passa a usar
   a marca nova sem procurar código em vários arquivos. */

/* Eu defino o nome exibido no topo, nos títulos e nos compartilhamentos. */
export const NOME_PLATAFORMA = 'M.O Music'

/* Eu defino o nome curto usado nos textos internos. */
export const NOME_CURTO = 'm.o music'

/* Eu defino a assinatura mostrada no rodapé da barra lateral. */
export const RODAPE_PLATAFORMA = 'Música independente · Ouça, compartilhe e apoie'

/* Preencha apenas com informações que a artista autorizou publicar.
   Imagens em public/ podem usar: `${import.meta.env.BASE_URL}artista/foto.jpg`. */
export const ARTISTA = {
  nome: 'Espaço da artista',
  apresentacao: 'Um lugar para compartilhar músicas, histórias e novas criações.',
  biografia: 'Em breve, conheça a artista e as histórias por trás de suas músicas.',
  foto: '',
  pix: '',
  nomeRecebedor: '',
  linkApoio: '', // Somente um endereço https:// de um serviço de pagamento.
}
