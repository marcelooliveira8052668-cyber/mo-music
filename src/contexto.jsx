/* ============================================= */
/* M.O MUSIC - CONTEXTO DA APLICAÇÃO             */
/* ARQUIVO: src/contexto.jsx                     */
/* ============================================= */

/* Eu importo as ferramentas de contexto do React. */
import { createContext, useContext } from 'react'

/* Eu crio o contexto que transporta o estado para todos os componentes. */
export const AppContext = createContext(null)

/* Eu crio um atalho para consumir o contexto com segurança. */
export function useApp() {

  /* Eu devolvo o estado compartilhado da aplicação. */
  return useContext(AppContext)

}
