/* ============================================= */
/* M.O MUSIC - CARD DE MÚSICA                    */
/* ARQUIVO: src/MusicaCard.jsx                   */
/* ============================================= */

/* Eu importo o estado compartilhado da aplicação. */
import { useApp } from './contexto'

/* Eu importo os ícones usados no card. */
import {
  IconeTocar,
  IconePausar,
  IconeCoracao,
  IconeMais,
  IconeCompartilhar,
  IconeCompra,
  IconeLixeira
} from './Icones'

/* Eu importo as utilidades de cor e propriedade. */
import { estiloDeGradiente, ehAnexadaMinha } from './utilitarios'

/* Eu crio o cartão visual que representa uma música. */
function MusicaCard({ musica, conjunto }) {

  /* Eu acesso o estado global da aplicação. */
  const {
    musicaAtual,
    tocando,
    selecionarMusica,
    ehFavorita,
    alternarFavorita,
    abrirAdicionarAPlaylist,
    compartilhar,
    comprarMusica,
    excluirAnexada
  } = useApp()

  /* Eu descubro se este card é a música em reprodução. */
  const emReproducao = musicaAtual?.id === musica.id

  /* Eu descubro se esta música está curtida. */
  const curtida = ehFavorita(musica.id)

  /* Eu verifico se a música possui áudio disponível. */
  const temAudio = Boolean(musica.audio)

  /* Eu crio o degradê exclusivo deste card. */
  const degradê = estiloDeGradiente(
    `${musica.artista}${musica.titulo}`
  )

  /* Eu trato o clique no card: toca ou alterna play/pause. */
  function aoClicar() {

    /* Eu envio a música e a lista de origem para o player. */
    selecionarMusica(musica, conjunto)

  }

  /* Eu retorno a estrutura visual do card. */
  return (
    <article
      className={`musica-card ${emReproducao ? 'em-reproducao' : ''}`}
      style={degradê}
    >

      {/* ======================================= */}
      {/* CAPA DA MÚSICA                         */}
      {/* ======================================= */}

      {/* Eu crio a área da capa. */}
      <div className="capa-card">

        {/* Eu exibo a capa original quando existe. */}
        {musica.capa ? (
          <img src={musica.capa} alt={`Capa de ${musica.titulo}`} />
        ) : (

          /* Eu exibo um degradê com a nota da marca. */
          <div className="capa-gradiente" aria-hidden="true">
            <span>♪</span>
          </div>

        )}

        {/* Eu mostro o botão de play que sobe no hover. */}
        <button
          type="button"
          className="botao-play-card"
          onClick={(evento) => {
            evento.stopPropagation()
            aoClicar()
          }}
          aria-label={
            emReproducao && tocando
              ? `Pausar ${musica.titulo}`
              : `Tocar ${musica.titulo}`
          }
          title={temAudio ? undefined : 'Esta música ainda não possui áudio'}
        >
          {emReproducao && tocando ? <IconePausar /> : <IconeTocar />}
        </button>

      </div>


      {/* ======================================= */}
      {/* INFORMAÇÕES                            */}
      {/* ======================================= */}

      {/* Eu apresento o título da música. */}
      <h3 title={musica.titulo}>{musica.titulo}</h3>

      {/* Eu apresento o artista da música. */}
      <p>{musica.artista}</p>


      {/* ======================================= */}
      {/* AÇÕES RÁPIDAS                          */}
      {/* ======================================= */}

      {/* Eu agrupo os botões de ação do card. */}
      <div className="acoes-card">

        {/* Eu crio o botão de favoritar. */}
        <button
          type="button"
          className={`botao-acao ${curtida ? 'curtida' : ''}`}
          onClick={(evento) => {
            evento.stopPropagation()
            alternarFavorita(musica.id)
          }}
          aria-label={
            curtida ? 'Remover das curtidas' : 'Adicionar às curtidas'
          }
          title={curtida ? 'Remover das curtidas' : 'Adicionar às curtidas'}
        >
          <IconeCoracao preenchido={curtida} />
        </button>

        {/* Eu crio o botão de compartilhar com amigos. */}
        <button
          type="button"
          className="botao-acao"
          onClick={(evento) => {
            evento.stopPropagation()
            compartilhar(musica)
          }}
          aria-label="Compartilhar com amigos"
          title="Compartilhar com amigos"
        >
          <IconeCompartilhar />
        </button>

        {/* Eu crio o botão de comprar ou apoiar o artista. */}
        {musica.apoio && (
          <button
            type="button"
            className="botao-acao botao-acao-destaque"
            onClick={(evento) => {
              evento.stopPropagation()
              comprarMusica(musica)
            }}
            aria-label={musica.preco ? 'Comprar esta música' : 'Apoiar o artista'}
            title={
              musica.preco
                ? 'Comprar esta música'
                : 'Apoiar o artista'
            }
          >
            <IconeCompra />
          </button>
        )}

        {/* Eu crio o botão de adicionar a uma playlist. */}
        <button
          type="button"
          className="botao-acao"
          onClick={(evento) => {
            evento.stopPropagation()
            abrirAdicionarAPlaylist(musica)
          }}
          aria-label="Adicionar a uma playlist"
          title="Adicionar a uma playlist"
        >
          <IconeMais />
        </button>

        {/* Eu mostro o botão de excluir só para o dono da música. */}
        {ehAnexadaMinha(musica) && (
          <button
            type="button"
            className="botao-acao botao-acao-perigo"
            onClick={(evento) => {
              evento.stopPropagation()
              excluirAnexada(musica)
            }}
            aria-label="Excluir esta música deste aparelho"
            title="Excluir deste aparelho (só você vê esta opção)"
          >
            <IconeLixeira />
          </button>
        )}

      </div>

    </article>
  )

}

/* Eu exporto o card para usar no App.jsx. */
export default MusicaCard
