/* ============================================= */
/* M.O MUSIC - FAIXAS DE DEMONSTRAÇÃO             */
/* ARQUIVO: src/dados/demonstracao.js             */
/* ============================================= */

/*
 * Eu uso estas músicas royalty-free apenas para demonstração pública,
 * para que qualquer visitante consiga clicar em "Tocar" e ouvir algo.
 *
 * Licença de todas as faixas abaixo:
 * Music: Kevin MacLeod (incompetech.com)
 * Licensed under Creative Commons: By Attribution 4.0
 * http://creativecommons.org/licenses/by/4.0/
 *
 * Os arquivos ficam em src/assets/demonstracao/ e são reencodados
 * em 160 kbps para manter o repositório leve.
 */

/* Eu importo os arquivos de áudio de demonstração. */
const sneakySnitch = '/demonstracao/sneaky-snitch.mp3'
const electrodoodle = '/demonstracao/electrodoodle.mp3'
const carefree = '/demonstracao/carefree.mp3'
const vibeAce = '/demonstracao/vibe-ace.mp3'
const hyperfun = '/demonstracao/hyperfun.mp3'


/* ============================================= */
/* LISTA DE FAIXAS DE DEMONSTRAÇÃO                */
/* ============================================= */

/* Eu monto as faixas que o público pode ouvir sem login. */
export const musicasDemonstracao = [

  /* Eu apresento a faixa divertida para começar. */
  {
    id: 'demo-sneaky-snitch',
    titulo: 'Sneaky Snitch',
    artista: 'Kevin MacLeod',
    capa: null,
    audio: sneakySnitch,
    categoria: 'Demonstração royalty-free'
  },

  /* Eu adiciono um som eletrônico animado. */
  {
    id: 'demo-electrodoodle',
    titulo: 'Electrodoodle',
    artista: 'Kevin MacLeod',
    capa: null,
    audio: electrodoodle,
    categoria: 'Demonstração royalty-free'
  },

  /* Eu adiciono uma faixa leve de ukulele. */
  {
    id: 'demo-carefree',
    titulo: 'Carefree',
    artista: 'Kevin MacLeod',
    capa: null,
    audio: carefree,
    categoria: 'Demonstração royalty-free'
  },

  /* Eu adiciono uma música suave e descontraída. */
  {
    id: 'demo-vibe-ace',
    titulo: 'Vibe Ace',
    artista: 'Kevin MacLeod',
    capa: null,
    audio: vibeAce,
    categoria: 'Demonstração royalty-free'
  },

  /* Eu fecho com uma pista energética para dançar. */
  {
    id: 'demo-hyperfun',
    titulo: 'Hyperfun',
    artista: 'Kevin MacLeod',
    capa: null,
    audio: hyperfun,
    categoria: 'Demonstração royalty-free'
  }

]

