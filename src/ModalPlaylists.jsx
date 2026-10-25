/* ============================================= */
/* M.O MUSIC - MODAL DE PLAYLISTS                */
/* ARQUIVO: src/ModalPlaylists.jsx               */
/* ============================================= */

/* Eu importo o hook de estado do React. */
import { useState } from 'react'

/* Eu importo o estado compartilhado da aplicação. */
import { useApp } from './contexto'

/* Eu importo os ícones do modal. */
import { IconeMais, IconeFechar, IconeCoracao } from './Icones'


/* ============================================= */
/* COMPONENTE DO MODAL                           */
/* ============================================= */

/* Eu crio a janela que adiciona uma música em playlists. */
function ModalPlaylists({ musica }) {

  /* Eu acesso o estado global da aplicação. */
  const {
    playlists,
    alternarMusicaNaPlaylist,
    criarPlaylist,
    fecharAdicionarAPlaylist,
    alternarFavorita,
    ehFavorita
  } = useApp()

  /* Eu guardo o nome da nova playlist digitada. */
  const [novoNome, setNovoNome] = useState('')

  /* Eu verifico se a música atual já está na playlist. */
  function estaNaPlaylist(playlist) {

    /* Eu procuro o id da música dentro da playlist. */
    return playlist.musicas.includes(musica.id)

  }

  /* Eu confirmo a criação de uma playlist vazia. */
  function confirmarNovaPlaylist(evento) {

    /* Eu evito o recarregamento da página. */
    evento.preventDefault()

    /* Eu extraio o nome digitado. */
    const nome = novoNome.trim()

    /* Eu exijo um nome para criar. */
    if (!nome) return

    /* Eu crio a playlist e já incluo esta música. */
    const novaId = criarPlaylist(nome, musica.id)

    /* Eu limpo o campo para um próximo uso. */
    setNovoNome('')

    /* Eu apenas mantenho o modal aberto para novas escolhas. */
    void novaId

  }

  /* Eu trato o clique na camada de fundo para fechar. */
  function aoClicarNoFundo(evento) {

    /* Eu verifico se o clique foi exatamente no fundo. */
    if (evento.target === evento.currentTarget) {

      /* Eu fecho a janela. */
      fecharAdicionarAPlaylist()

    }

  }

  /* Eu retorno a estrutura visual do modal. */
  return (

    /* Eu crio a camada de fundo escura. */
    <div className="fundo-modal" onClick={aoClicarNoFundo} role="presentation">

      {/* Eu crio a janela do modal. */}
      <div
        className="modal-playlists"
        role="dialog"
        aria-modal="true"
        aria-label={`Adicionar ${musica.titulo} a uma playlist`}
      >

        {/* ================================= */}
        {/* CABEÇALHO DO MODAL                */}
        {/* ================================= */}

        {/* Eu organizo o cabeçalho. */}
        <header className="cabecalho-modal">

          {/* Eu identifico a janela. */}
          <div>
            <h2>Adicionar à playlist</h2>
            <p>{musica.titulo} · {musica.artista}</p>
          </div>

          {/* Eu crio o botão de fechar. */}
          <button
            type="button"
            className="botao-icone"
            onClick={fecharAdicionarAPlaylist}
            aria-label="Fechar janela"
          >
            <IconeFechar />
          </button>

        </header>


        {/* ================================= */}
        {/* AÇÃO DE CURTIR                    */}
        {/* ================================= */}

        {/* Eu ofereço o atalho para as curtidas. */}
        <button
          type="button"
          className="opcao-playlist opcao-especial"
          onClick={() => alternarFavorita(musica.id)}
        >

          {/* Eu mostro o coração com o estado atual. */}
          <span className="miniatura-playlist coracao">
            <IconeCoracao preenchido={ehFavorita(musica.id)} />
          </span>

          {/* Eu explico a ação. */}
          <span>
            <strong>Curtidas</strong>
            <small>
              {ehFavorita(musica.id)
                ? 'Remover das curtidas'
                : 'Salvar nas suas curtidas'}
            </small>
          </span>

        </button>


        {/* ================================= */}
        {/* LISTA DE PLAYLISTS                */}
        {/* ================================= */}

        {/* Eu listo cada playlist do usuário. */}
        <div className="opcoes-playlists">
          {playlists.map((playlist) => {

            /* Eu descubro se a música já está na playlist. */
            const dentro = estaNaPlaylist(playlist)

            /* Eu devolvo uma opção clicável. */
            return (
              <button
                key={playlist.id}
                type="button"
                className="opcao-playlist"
                onClick={() => alternarMusicaNaPlaylist(playlist.id, musica.id)}
              >

                {/* Eu mostro a miniatura colorida da playlist. */}
                <span className="miniatura-playlist">♪</span>

                {/* Eu mostro o nome e o estado da música. */}
                <span>
                  <strong>{playlist.nome}</strong>
                  <small>
                    {dentro ? 'Remover desta playlist' : 'Adicionar a esta playlist'}
                  </small>
                </span>

              </button>
            )

          })}
        </div>


        {/* ================================= */}
        {/* CRIAR NOVA PLAYLIST               */}
        {/* ================================= */}

        {/* Eu crio o formulário de nova playlist. */}
        <form className="nova-playlist-modal" onSubmit={confirmarNovaPlaylist}>

          {/* Eu peço o nome da playlist. */}
          <input
            type="text"
            placeholder="Nova playlist"
            aria-label="Nome da nova playlist"
            value={novoNome}
            onChange={(evento) => setNovoNome(evento.target.value)}
          />

          {/* Eu confirmo a criação. */}
          <button type="submit">
            <IconeMais />
            Criar
          </button>

        </form>

      </div>
    </div>
  )

}

/* Eu exporto o modal para usar no App.jsx. */
export default ModalPlaylists
