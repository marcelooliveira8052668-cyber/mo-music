/* ============================================= */
/* M.O MUSIC - LISTA DE FAIXAS                   */
/* ARQUIVO: src/ListaMusicas.jsx                 */
/* ============================================= */

/* Eu importo o estado compartilhado da aplicação. */
import { useApp } from './contexto'

/* Eu importo os ícones das linhas. */
import {
  IconeTocar,
  IconeCoracao,
  IconeMais,
  IconeCompartilhar,
  IconeCompra,
  IconeLixeira
} from './Icones'

/* Eu importo a regra de propriedade das músicas. */
import { ehAnexadaMinha } from './utilitarios'


/* ============================================= */
/* INDICADOR DE ÁUDIO EM REPRODUÇÃO              */
/* ============================================= */

/* Eu crio as barrinhas animadas mostrando que a música toca. */
function IndicadorTocando() {
  return (
    <span className="indicador-tocando" aria-label="Tocando agora">
      <i /><i /><i /><i />
    </span>
  )
}


/* ============================================= */
/* COMPONENTE DA LISTA                           */
/* ============================================= */

/* Eu crio a lista de faixas usada nas buscas, playlists e curtidas. */
function ListaMusicas({ musicas, conjunto, mostrarIndice = true }) {

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

  /* Eu retorno a estrutura visual da lista. */
  return (

    /* Eu crio o cabeçalho da tabela de faixas. */
    <div className="lista-faixas">

      {/* Eu apresento os títulos das colunas. */}
      <div className="cabecalho-faixas" aria-hidden="true">
        <span className="coluna-indice">#</span>
        <span className="coluna-titulo">Título</span>
        <span className="coluna-categoria">Categoria</span>
        <span className="coluna-acoes" />
      </div>

      {/* Eu percorro cada música enviada. */}
      {musicas.map((musica, indice) => {

        /* Eu descubro se esta faixa está em reprodução. */
        const emReproducao = musicaAtual?.id === musica.id

        /* Eu descubro se esta faixa está curtida. */
        const curtida = ehFavorita(musica.id)

        /* Eu devolvo uma linha da lista. */
        return (

          <div
            key={musica.id}
            className={`linha-faixa ${emReproducao ? 'em-reproducao' : ''}`}
            onDoubleClick={() => selecionarMusica(musica, conjunto)}
          >

            {/* ================================= */}
            {/* ÍNDICE OU BOTÃO DE PLAY           */}
            {/* ================================= */}

            {/* Eu mostro o número da faixa na lista. */}
            <span className="coluna-indice">
              {emReproducao && tocando ? (
                <IndicadorTocando />
              ) : (
                <button
                  type="button"
                  className="botao-play-linha"
                  onClick={() => selecionarMusica(musica, conjunto)}
                  aria-label={`Tocar ${musica.titulo}`}
                >
                  <span className="numero-faixa">{mostrarIndice ? indice + 1 : '♪'}</span>
                  <span className="icone-play-faixa"><IconeTocar /></span>
                </button>
              )}
            </span>


            {/* ================================= */}
            {/* CAPA E INFORMAÇÕES                */}
            {/* ================================= */}

            {/* Eu agrupo capa, título e artista. */}
            <span className="coluna-titulo">

              {/* Eu mostro a capa reduzida da faixa. */}
              {musica.capa ? (
                <img className="capa-miniatura" src={musica.capa} alt="" />
              ) : (
                <span className="capa-miniatura capa-miniatura-gradiente" aria-hidden="true">♪</span>
              )}

              {/* Eu apresento as informações da música. */}
              <span className="texto-faixa">
                <strong title={musica.titulo}>{musica.titulo}</strong>
                <small>{musica.artista}</small>
              </span>

            </span>


            {/* ================================= */}
            {/* CATEGORIA                        */}
            {/* ================================= */}

            {/* Eu mostro a categoria da faixa. */}
            <span className="coluna-categoria">{musica.categoria}</span>


            {/* ================================= */}
            {/* AÇÕES                            */}
            {/* ================================= */}

            {/* Eu agrupo os botões da linha. */}
            <span className="coluna-acoes">

              {/* Eu crio o botão de favoritar. */}
              <button
                type="button"
                className={`botao-acao ${curtida ? 'curtida' : ''}`}
                onClick={() => alternarFavorita(musica.id)}
                aria-label={
                  curtida ? 'Remover das curtidas' : 'Adicionar às curtidas'
                }
              >
                <IconeCoracao preenchido={curtida} />
              </button>

              {/* Eu crio o botão de compartilhar. */}
              <button
                type="button"
                className="botao-acao"
                onClick={() => compartilhar(musica)}
                aria-label="Compartilhar com amigos"
                title="Compartilhar com amigos"
              >
                <IconeCompartilhar />
              </button>

              {/* Eu crio o botão de comprar ou apoiar. */}
              {musica.apoio && (
                <button
                  type="button"
                  className="botao-acao botao-acao-destaque"
                  onClick={() => comprarMusica(musica)}
                  aria-label={
                    musica.preco ? 'Comprar esta música' : 'Apoiar o artista'
                  }
                  title={
                    musica.preco
                      ? `Comprar por ${musica.preco}`
                      : 'Apoiar o artista'
                  }
                >
                  <IconeCompra />
                </button>
              )}

              {/* Eu crio o botão de adicionar à playlist. */}
              <button
                type="button"
                className="botao-acao"
                onClick={() => abrirAdicionarAPlaylist(musica)}
                aria-label="Adicionar a uma playlist"
              >
                <IconeMais />
              </button>

              {/* Eu mostro o botão de excluir só para o dono da música. */}
              {ehAnexadaMinha(musica) && (
                <button
                  type="button"
                  className="botao-acao botao-acao-perigo"
                  onClick={() => excluirAnexada(musica)}
                  aria-label="Excluir esta música deste aparelho"
                  title="Excluir deste aparelho (só você vê esta opção)"
                >
                  <IconeLixeira />
                </button>
              )}

            </span>

          </div>

        )

      })}

    </div>
  )

}

/* Eu exporto a lista para usar no App.jsx. */
export default ListaMusicas
