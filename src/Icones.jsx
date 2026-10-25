/* ============================================= */
/* M.O MUSIC - BIBLIOTECA DE ÍCONES              */
/* ARQUIVO: src/Icones.jsx                       */
/* ============================================= */

/* Todos os ícones usam a cor do texto atual (currentColor)
   para acompanhar automaticamente o estado de cada botão. */


/* ============================================= */
/* ÍCONES DE NAVEGAÇÃO                           */
/* ============================================= */

/* Eu desenho o ícone de início (casa). */
export function IconeInicio() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.5 3.3a1 1 0 0 0-1 0L3 8.2A1 1 0 0 0 3 9.1V20a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5.2h4V21a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V9.1a1 1 0 0 0 0-.9z"
      />
    </svg>
  )
}

/* Eu desenho o ícone de pesquisa (lupa). */
export function IconeBusca() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="m16 16 5 5"
      />
    </svg>
  )
}

/* Eu desenho o ícone da biblioteca (estante de álbuns). */
export function IconeBiblioteca() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <rect x="3" y="4" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="9" y="4" width="4" height="16" rx="1" fill="currentColor" />
      <path
        fill="currentColor"
        d="M16.2 5.3a1 1 0 0 1 1.2.7l3 13a1 1 0 0 1-.7 1.2l-2.4.6a1 1 0 0 1-1.2-.7l-3-13a1 1 0 0 1 .7-1.2z"
      />
    </svg>
  )
}

/* Eu desenho o coração (favoritar). */
export function IconeCoracao({ preenchido = false }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill={preenchido ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M12 20.3 4.9 13a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l.6.6.6-.6a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5z"
      />
    </svg>
  )
}


/* ============================================= */
/* ÍCONES DE REPRODUÇÃO                          */
/* ============================================= */

/* Eu desenho o triângulo de reprodução. */
export function IconeTocar() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path fill="currentColor" d="M7 4.8v14.4a.6.6 0 0 0 .9.5l11.4-7.2a.6.6 0 0 0 0-1L7.9 4.3a.6.6 0 0 0-.9.5Z" />
    </svg>
  )
}

/* Eu desenho o símbolo de pausa. */
export function IconePausar() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" />
    </svg>
  )
}

/* Eu desenho o botão da música anterior. */
export function IconeAnterior() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path fill="currentColor" d="M6 5h2.2v14H6zM18.5 5.6v12.8a.6.6 0 0 1-.9.5L8.6 12.6a.6.6 0 0 1 0-1l9-6.5a.6.6 0 0 1 .9.5Z" />
    </svg>
  )
}

/* Eu desenho o botão da próxima música. */
export function IconeProxima() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path fill="currentColor" d="M15.8 5H18v14h-2.2zM5.5 5.6v12.8a.6.6 0 0 0 .9.5l9-6.3a.6.6 0 0 0 0-1l-9-6.3a.6.6 0 0 0-.9.5Z" />
    </svg>
  )
}

/* Eu desenho o modo aleatório (embaralhar). */
export function IconeAleatorio({ ativo = false }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 4h4v4M3 20l18-16M17 20h4v-4M3 4l5.5 5M14.5 14.5 21 20"
      />
      {ativo && <circle cx="12" cy="21" r="1.6" fill="currentColor" />}
    </svg>
  )
}

/* Eu desenho o modo de repetição. */
export function IconeRepetir({ repetirUma = false }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 3.5 20.5 7 17 10.5M3.5 11V9.5a3 3 0 0 1 3-3h14M7 20.5 3.5 17 7 13.5M20.5 13v1.5a3 3 0 0 1-3 3h-14"
      />
      {repetirUma && (
        <text
          x="12"
          y="15.5"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="currentColor"
        >
          1
        </text>
      )}
    </svg>
  )
}


/* ============================================= */
/* ÍCONES DO VOLUME E DA FILA                    */
/* ============================================= */

/* Eu desenho o alto-falante com som. */
export function IconeVolume({ nivel = 'alto' }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.7 4.3a.7.7 0 0 0-1.1-.6L6.3 7.4H3.5a.5.5 0 0 0-.5.5v8.2a.5.5 0 0 0 .5.5h2.8l4.3 3.7a.7.7 0 0 0 1.1-.6Z"
      />
      {nivel !== 'mudo' && (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M15.5 9.2a4 4 0 0 1 0 5.6"
        />
      )}
      {nivel === 'alto' && (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="M18.4 6.3a8 8 0 0 1 0 11.4"
        />
      )}
      {nivel === 'mudo' && (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          d="m15.5 9.5 5 5m0-5-5 5"
        />
      )}
    </svg>
  )
}

/* Eu desenho a fila de reprodução. */
export function IconeFila() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M3.5 6.5h13M3.5 12h13M3.5 17.5h8"
      />
      <path fill="currentColor" d="M17 14.4v7a.5.5 0 0 0 .77.42l5.5-3.5a.5.5 0 0 0 0-.84l-5.5-3.5A.5.5 0 0 0 17 14.4Z" />
    </svg>
  )
}


/* ============================================= */
/* ÍCONES AUXILIARES                             */
/* ============================================= */

/* Eu desenho o sinal de mais (adicionar). */
export function IconeMais() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M12 5v14M5 12h14"
      />
    </svg>
  )
}

/* Eu desenho o sinal de fechar. */
export function IconeFechar() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="m6 6 12 12M18 6 6 18"
      />
    </svg>
  )
}

/* Eu desenho a seta de voltar. */
export function IconeVoltar() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.5 5-7 7 7 7"
      />
    </svg>
  )
}

/* Eu desenho a seta de avançar. */
export function IconeAvancar() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.5 5 7 7-7 7"
      />
    </svg>
  )
}

/* Eu desenho o perfil do usuário. */
export function IconeUsuario() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.8" fill="currentColor" />
      <path
        fill="currentColor"
        d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0 .8.8 0 0 1-.8.8H5.6a.8.8 0 0 1-.8-.8Z"
      />
    </svg>
  )
}

/* Eu desenho a nota musical usada no logotipo. */
export function IconeLogotipo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M9 17.5V5.2l10-2v12.1"
      />
      <circle cx="6.4" cy="17.7" r="2.8" fill="currentColor" />
      <circle cx="16.4" cy="15.5" r="2.8" fill="currentColor" />
    </svg>
  )
}

/* Eu desenho o lixeira para remover itens. */
export function IconeLixeira() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 6.5h15M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7m3.5 0-.8 12a1 1 0 0 1-1 .9H7.8a1 1 0 0 1-1-.9l-.8-12M10 10.5v6M14 10.5v6"
      />
    </svg>
  )
}

/* Eu desenho o ícone de compartilhar. */
export function IconeCompartilhar() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M8.2 10.8 15.8 6.7M8.2 13.2l7.6 4.1"
      />
      <circle cx="18" cy="5.5" r="2.6" fill="currentColor" />
      <circle cx="6" cy="12" r="2.6" fill="currentColor" />
      <circle cx="18" cy="18.5" r="2.6" fill="currentColor" />
    </svg>
  )
}

/* Eu desenho a etiqueta de preço (comprar/apoiar). */
export function IconeCompra() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.6 12.3 12.3 4H4v8.3l8.3 8.3a2 2 0 0 0 2.8 0l5.5-5.5a2 2 0 0 0 0-2.8Z"
      />
      <circle cx="7.6" cy="7.6" r="1.5" fill="#000" />
    </svg>
  )
}

/* Eu desenho as linhas de texto (letra da música). */
export function IconeLetra() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M4.5 6h15M4.5 11h15M4.5 16h9"
      />
    </svg>
  )
}
