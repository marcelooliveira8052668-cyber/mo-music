/* ============================================= */
/* M.O MUSIC - BARRA LATERAL                     */
/* ARQUIVO: src/BarraLateral.jsx                 */
/* ============================================= */

/* Eu importo o estado compartilhado da aplicação. */
import { useState } from 'react'
import { useApp } from './contexto'

/* Eu importo a identidade configurável da plataforma. */
import { NOME_PLATAFORMA, RODAPE_PLATAFORMA } from './configuracao'

/* Eu importo os ícones da navegação. */
import {
  IconeInicio,
  IconeBusca,
  IconeBiblioteca,
  IconeCoracao,
  IconeMais,
  IconeLogotipo
} from './Icones'

/* Eu crio a barra lateral com navegação e playlists. */
function BarraLateral() {

  /* Eu acesso o estado global da aplicação. */
  const {
    visao,
    irPara,
    playlists,
    criarPlaylist
  } = useApp()

  /* Eu controlo a criação de uma nova playlist. */
  const [criandoPlaylist, setCriandoPlaylist] = useState(false)

  /* Eu guardo o nome digitado para a nova playlist. */
  const [nomePlaylist, setNomePlaylist] = useState('')

  /* Eu verifico se uma área da navegação está ativa. */
  function estaAtiva(area) {

    /* Eu comparo a área solicitada com a visão atual. */
    return visao === area

  }

  /* Eu inicio a criação de uma playlist. */
  function iniciarCriacao() {

    /* Eu abro o campo de nome. */
    setCriandoPlaylist(true)

    /* Eu limpo o nome da tentativa anterior. */
    setNomePlaylist('')

  }

  /* Eu confirmo a criação da playlist. */
  function confirmarCriacao(evento) {

    /* Eu evito o recarregamento da página. */
    evento.preventDefault()

    /* Eu extraio o nome digitado. */
    const nome = nomePlaylist.trim()

    /* Eu exijo um nome para criar a playlist. */
    if (!nome) return

    /* Eu crio a playlist e descubro o novo identificador. */
    const novaId = criarPlaylist(nome)

    /* Eu fecho o campo de nome. */
    setCriandoPlaylist(false)

    /* Eu levo o usuário até a playlist criada. */
    irPara('playlist', { playlistId: novaId })

  }

  /* Eu retorno a estrutura visual da barra lateral. */
  return (
    <aside className="barra-lateral">

      {/* ======================================= */}
      {/* LOGOTIPO                               */}
      {/* ======================================= */}

      {/* Eu apresento a identidade da plataforma. */}
      <div className="logotipo">

        {/* Eu mostro a nota musical da marca. */}
        <span className="logotipo-icone">
          <IconeLogotipo />
        </span>

        {/* Eu mostro o nome da plataforma. */}
        <strong>{NOME_PLATAFORMA}</strong>

      </div>


      {/* ======================================= */}
      {/* NAVEGAÇÃO PRINCIPAL                    */}
      {/* ======================================= */}

      {/* Eu agrupo os links principais. */}
      <nav className="navegacao-principal" aria-label="Navegação principal">

        <button
          type="button"
          className={`item-navegacao ${estaAtiva('artista') ? 'ativo' : ''}`}
          onClick={() => irPara('artista')}
        >
          <IconeLogotipo />
          <span>Página da artista</span>
        </button>

        {/* Eu crio o link de início. */}
        <button
          type="button"
          className={`item-navegacao ${estaAtiva('inicio') ? 'ativo' : ''}`}
          onClick={() => irPara('inicio')}
        >
          <IconeInicio />
          <span>Explorar biblioteca</span>
        </button>

        {/* Eu crio o link de busca. */}
        <button
          type="button"
          className={`item-navegacao ${estaAtiva('busca') ? 'ativo' : ''}`}
          onClick={() => irPara('busca')}
        >
          <IconeBusca />
          <span>Buscar</span>
        </button>

        {/* Eu crio o link da biblioteca. */}
        <button
          type="button"
          className={`item-navegacao ${estaAtiva('biblioteca') ? 'ativo' : ''}`}
          onClick={() => irPara('biblioteca')}
        >
          <IconeBiblioteca />
          <span>Sua Biblioteca</span>
        </button>

        {/* Eu crio o link das músicas curtidas. */}
        <button
          type="button"
          className={`item-navegacao ${estaAtiva('curtidas') ? 'ativo' : ''}`}
          onClick={() => irPara('curtidas')}
        >
          <IconeCoracao preenchido={estaAtiva('curtidas')} />
          <span>Curtidas</span>
        </button>

        {/* Eu crio o link para colocar músicas próprias. */}
        <button
          type="button"
          className={`item-navegacao item-destaque ${estaAtiva('anexar') ? 'ativo' : ''}`}
          onClick={() => irPara('anexar')}
        >
          <IconeMais />
          <span>Colocar minha música</span>
        </button>

      </nav>


      {/* ======================================= */}
      {/* ÁREA DAS PLAYLISTS                     */}
      {/* ======================================= */}

      {/* Eu crio o painel escuro das playlists. */}
      <div className="painel-playlists">

        {/* Eu apresento o cabeçalho da área. */}
        <div className="cabecalho-playlists">

          {/* Eu identifico a área de playlists. */}
          <span>
            <IconeBiblioteca />
            Playlists
          </span>

          {/* Eu crio o botão de nova playlist. */}
          <button
            type="button"
            className="botao-miniatura"
            onClick={iniciarCriacao}
            aria-label="Criar nova playlist"
            title="Criar nova playlist"
          >
            <IconeMais />
          </button>

        </div>

        {/* Eu exibo o formulário quando o usuário pedir para criar. */}
        {criandoPlaylist && (

          <form className="formulario-playlist" onSubmit={confirmarCriacao}>

            {/* Eu peço o nome da nova playlist. */}
            <input
              autoFocus
              type="text"
              placeholder="Nome da playlist"
              aria-label="Nome da nova playlist"
              value={nomePlaylist}
              onChange={(evento) => setNomePlaylist(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === 'Escape') setCriandoPlaylist(false)
              }}
            />

            {/* Eu confirmo a criação. */}
            <button type="submit">Criar</button>

          </form>

        )}

        {/* Eu listo as playlists criadas pelo usuário. */}
        <ul className="lista-playlists">
          {playlists.map((playlist) => (

            <li key={playlist.id}>

              {/* Eu crio o acesso à playlist. */}
              <button
                type="button"
                className={
                  visao === 'playlist' ? 'playlist-ativa' : ''
                }
                onClick={() => irPara('playlist', { playlistId: playlist.id })}
              >

                {/* Eu mostro o nome da playlist. */}
                {playlist.nome}

                {/* Eu mostro quantas músicas ela guarda. */}
                <small>{playlist.musicas.length}</small>

              </button>

            </li>

          ))}
        </ul>

        {/* Eu aviso quando ainda não existe nenhuma playlist. */}
        {playlists.length === 0 && !criandoPlaylist && (

          <p className="aviso-playlists">
            Crie playlists para organizar seus sons favoritos.
          </p>

        )}

      </div>


      {/* ======================================= */}
      {/* RODAPÉ DA LATERAL                      */}
      {/* ======================================= */}

      {/* Eu identifico o projeto no rodapé. */}
      <p className="rodape-lateral">
        {RODAPE_PLATAFORMA}
      </p>

    </aside>
  )

}

/* Eu exporto a barra lateral para o App.jsx. */
export default BarraLateral
