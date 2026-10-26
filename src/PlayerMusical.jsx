/* ============================================= */
/* M.O MUSIC - PLAYER MUSICAL                    */
/* ARQUIVO: src/PlayerMusical.jsx                */
/* ============================================= */

/* Eu importo os recursos do React. */
import { useState, useRef, useEffect } from 'react'

/* Eu importo o estado compartilhado da aplicação. */
import { useApp } from './contexto'

/* Eu importo os ícones do player. */
import {
  IconeTocar,
  IconePausar,
  IconeAnterior,
  IconeProxima,
  IconeAleatorio,
  IconeRepetir,
  IconeVolume,
  IconeFila,
  IconeCoracao,
  IconeCompartilhar,
  IconeCompra,
  IconeLetra
} from './Icones'

/* Eu importo a formatação de tempo. */
import { formatarTempo } from './utilitarios'


/* ============================================= */
/* COMPONENTE PRINCIPAL DO PLAYER                */
/* ============================================= */

/* Eu crio a barra fixa de reprodução da plataforma. */
function PlayerMusical() {

  /* Eu acesso o estado global da aplicação. */
  const {
    musicaAtual,
    contadorTocar,
    tocando,
    definirTocando,
    volume,
    definirVolume,
    modoAleatorio,
    alternarModoAleatorio,
    repetir,
    alternarRepetir,
    tocarProximaMusica,
    tocarMusicaAnterior,
    aoTerminarMusica,
    registrarToco,
    apiPlayerRef,
    ehFavorita,
    alternarFavorita,
    compartilhar,
    comprarMusica,
    formatarPreco,
    fila,
    painelFila,
    alternarPainelFila,
    painelLetra,
    alternarPainelLetra,
    estadoLetra,
    salvarLetra,
    capaDe
  } = useApp()

  /* Eu busco a capa da faixa: a do arquivo ou a da internet. */
  const capaAtual = capaDe(musicaAtual)

  /* Eu guardo um rascunho de letra por faixa. */
  const [rascunhosLetra, setRascunhosLetra] = useState({})

  /* Eu leio o rascunho da faixa que está na tela. */
  const rascunhoLetra = rascunhosLetra[musicaAtual?.id] ?? ''


  /* =========================================== */
  /* ESTADOS E REFERÊNCIAS                       */
  /* =========================================== */

  /* Eu armazeno o tempo atual da música. */
  const [tempoAtual, setTempoAtual] = useState(0)

  /* Eu armazeno a duração total da música. */
  const [duracao, setDuracao] = useState(0)

  /* Eu crio a referência do elemento de áudio. */
  const audioRef = useRef(null)

  /* Eu registro qual contador de "tocar" já foi atendido. */
  const contadorAnteriorRef = useRef(0)

  /* Eu evito repetir o registro de uma mesma faixa. */
  const registroFeitoRef = useRef(false)

  /* Eu memorizo o último volume antes do mudo. */
  const volumeAnteriorRef = useRef(50)


  /* =========================================== */
  /* REPRODUÇÃO DA MÚSICA                        */
  /* =========================================== */

  /* Eu preparo o áudio sempre que a faixa ou o pedido mudam. */
  useEffect(() => {

    /* Eu acesso o elemento de áudio. */
    const audio = audioRef.current

    /* Eu encerro quando o áudio ainda não existe. */
    if (!audio) return

    /* Eu pauso a reprodução anterior. */
    audio.pause()

    /* Eu reinicio os contadores visuais. */
    setTempoAtual(0)
    setDuracao(0)

    /* Eu informo ao aplicativo que o player está parado. */
    definirTocando(false)

    /* Eu preparo a próxima faixa para ser registrada. */
    registroFeitoRef.current = false

    /* Eu verifico se a nova música possui áudio. */
    if (!musicaAtual?.audio) return

    /* Eu carrego o novo arquivo no elemento. */
    audio.load()

    /* Eu verifico se o usuário pediu início automático. */
    if (contadorTocar > contadorAnteriorRef.current) {

      /* Eu memorizo o contador atendido. */
      contadorAnteriorRef.current = contadorTocar

      /* Eu tento iniciar a música. */
      audio.play().catch((erro) => {

        /* Eu aviso no console sem quebrar a aplicação. */
        console.warn('Não foi possível iniciar a reprodução:', erro)

        /* Eu mantenho o player pausado. */
        definirTocando(false)

      })

    }

  }, [musicaAtual?.audio, contadorTocar, definirTocando])


  /* Eu aplico o volume escolhido pelo usuário. */
  useEffect(() => {

    /* Eu verifico se o áudio já está disponível. */
    if (audioRef.current) {

      /* Eu converto o percentual para a escala de 0 a 1. */
      audioRef.current.volume = volume / 100

    }

  }, [volume])


  /* Eu exposto as ações do player para o App (atalhos de teclado). */
  useEffect(() => {

    /* Eu publico as funções na referência compartilhada. */
    apiPlayerRef.current = {
      alternar: alternarReproducao,
      avancar10: avancarDezSegundos,
      voltar10: voltarDezSegundos
    }

  })


  /* =========================================== */
  /* REPRODUZIR E PAUSAR                         */
  /* =========================================== */

  /* Eu crio a função que alterna play e pause. */
  async function alternarReproducao() {

    /* Eu acesso o elemento de áudio. */
    const audio = audioRef.current

    /* Eu verifico se existe um arquivo carregado. */
    if (!audio || !musicaAtual?.audio) return

    /* Eu verifico se a música está em reprodução. */
    if (!audio.paused) {

      /* Eu pauso a música. */
      audio.pause()

      /* Eu atualizo o estado visual. */
      definirTocando(false)

      /* Eu encerro a função. */
      return

    }

    try {

      /* Eu aguardo o navegador iniciar a música. */
      await audio.play()

      /* Eu atualizo o estado visual. */
      definirTocando(true)

      /* Eu registro a faixa no histórico. */
      registrarHistorico()

    } catch (erro) {

      /* Eu registro o erro para investigação. */
      console.error('Erro ao reproduzir áudio:', erro)

      /* Eu mantenho o player pausado. */
      definirTocando(false)

    }

  }


  /* =========================================== */
  /* HISTÓRICO DE REPRODUÇÃO                     */
  /* =========================================== */

  /* Eu registro a faixa uma única vez por carregamento. */
  function registrarHistorico() {

    /* Eu verifico se já registrei esta faixa. */
    if (registroFeitoRef.current) return

    /* Eu marco a faixa como registrada. */
    registroFeitoRef.current = true

    /* Eu envio a música para o histórico do aplicativo. */
    if (musicaAtual) registrarToco(musicaAtual)

  }


  /* =========================================== */
  /* NAVEGAÇÃO                                   */
  /* =========================================== */

  /* Eu crio a função da música anterior. */
  function voltarMusica() {

    /* Eu solicito a faixa anterior ao App. */
    tocarMusicaAnterior()

  }

  /* Eu crio a função da próxima música. */
  function avancarMusica() {

    /* Eu solicito a próxima faixa ao App. */
    tocarProximaMusica()

  }

  /* Eu crio a função de voltar 10 segundos. */
  function voltarDezSegundos() {

    /* Eu verifico se o áudio existe. */
    if (!audioRef.current) return

    /* Eu volto sem ultrapassar o início. */
    audioRef.current.currentTime = Math.max(
      0,
      audioRef.current.currentTime - 10
    )

  }

  /* Eu crio a função de avançar 10 segundos. */
  function avancarDezSegundos() {

    /* Eu verifico se o áudio existe. */
    if (!audioRef.current) return

    /* Eu preparo os valores de tempo. */
    const total = audioRef.current.duration
    const alvo = audioRef.current.currentTime + 10

    /* Eu aplico o limite apenas quando a duração é conhecida. */
    audioRef.current.currentTime = Number.isFinite(total)
      ? Math.min(total, alvo)
      : alvo

  }


  /* =========================================== */
  /* FIM DA MÚSICA                               */
  /* =========================================== */

  /* Eu trato o término natural da faixa. */
  function finalizarMusica() {

    /* Eu verifico se o modo "repetir uma" está ativo. */
    if (repetir === 'uma' && audioRef.current) {

      /* Eu volto ao início da faixa. */
      audioRef.current.currentTime = 0

      /* Eu reinicio a reprodução. */
      audioRef.current.play().catch(() => definirTocando(false))

      /* Eu atualizo o estado visual. */
      definirTocando(true)

      /* Eu encerro sem avançar. */
      return

    }

    /* Eu informo que a faixa terminou. */
    definirTocando(false)

    /* Eu permito que o App decida a próxima faixa. */
    aoTerminarMusica()

  }


  /* =========================================== */
  /* PROGRESSO E VOLUME                          */
  /* =========================================== */

  /* Eu atualizo o tempo durante a reprodução. */
  function atualizarTempo() {

    /* Eu leio o tempo atual do elemento. */
    if (audioRef.current) setTempoAtual(audioRef.current.currentTime)

  }

  /* Eu leio a duração assim que ela fica disponível. */
  function atualizarDuracao() {

    /* Eu leio o total informado pelo navegador. */
    const total = audioRef.current?.duration

    /* Eu guardo apenas durações válidas. */
    if (Number.isFinite(total)) setDuracao(total)

  }

  /* Eu mudo a posição da música pelo cursor. */
  function alterarPosicao(evento) {

    /* Eu verifico se a duração é válida. */
    if (!Number.isFinite(duracao) || duracao <= 0) return

    /* Eu aplico o novo tempo. */
    const novoTempo = Number(evento.target.value)
    audioRef.current.currentTime = novoTempo
    setTempoAtual(novoTempo)

  }

  /* Eu mudo o volume do player. */
  function alterarVolume(evento) {

    /* Eu leio o novo percentual. */
    const novoVolume = Number(evento.target.value)

    /* Eu memorizo volumes diferentes de zero. */
    if (novoVolume > 0) volumeAnteriorRef.current = novoVolume

    /* Eu aplico o volume no App. */
    definirVolume(novoVolume)

  }

  /* Eu ligo e desligo o mudo. */
  function alternarMudo() {

    /* Eu verifico se o player está mudo. */
    if (volume === 0) {

      /* Eu restauro o último volume usado. */
      definirVolume(volumeAnteriorRef.current || 50)

    } else {

      /* Eu memorizo o volume atual antes de mutar. */
      volumeAnteriorRef.current = volume

      /* Eu zereo o volume. */
      definirVolume(0)

    }

  }

  /* Eu classifico o nível do volume para o ícone. */
  const nivelVolume = volume === 0 ? 'mudo' : volume < 50 ? 'baixo' : 'alto'


  /* =========================================== */
  /* INTERFACE DO PLAYER                         */
  /* =========================================== */

  /* Eu calculo o preenchimento visual das barras de progresso e volume. */
  const percentualProgresso =
    duracao > 0 ? Math.min(100, Math.max(0, (tempoAtual / duracao) * 100)) : 0

  const percentualVolume = Math.min(100, Math.max(0, volume))

  /* Eu retorno a estrutura visual do player. */
  return (
    <section className="player-musical" aria-label="Player de música">
      {/* Eu crio o elemento de áudio do navegador. */}
      <audio
        ref={audioRef}
        src={musicaAtual?.audio || undefined}
        preload="metadata"
        onTimeUpdate={atualizarTempo}
        onLoadedMetadata={atualizarDuracao}
        onEnded={finalizarMusica}
        onPlay={() => {
          definirTocando(true)
          registrarHistorico()
        }}
        onPause={() => definirTocando(false)}
      />


      {/* ======================================= */}
      {/* ZONA ESQUERDA: MÚSICA ATUAL             */}
      {/* ======================================= */}

      {/* Eu mostro a faixa que está no player. */}
      <div className="zona-player zona-esquerda">

        {/* Eu exibo a capa quando ela existe. */}
        {capaAtual ? (
          <img
            className="capa-player"
            src={capaAtual}
            alt={`Capa de ${musicaAtual.titulo}`}
            decoding="async"
          />
        ) : (
          <span className="capa-player capa-player-gradiente" aria-hidden="true">♪</span>
        )}

        {/* Eu apresento as informações da faixa. */}
        <div className="info-player">
          <strong title={musicaAtual?.titulo}>
            {musicaAtual?.titulo || 'Nenhuma música selecionada'}
          </strong>
          <small>
            {musicaAtual?.artista || 'Escolha uma faixa para começar'}
          </small>
        </div>

        {/* Eu mostro as barrinhas: animadas enquanto toca, paradas quando pausa. */}
        <span
          className={`equalizador-player ${tocando ? '' : 'parado'}`}
          aria-hidden="true"
        >
          <i /><i /><i /><i /><i />
        </span>

        {/* Eu crio o botão de curtir a faixa atual. */}
        <button
          type="button"
          className={`botao-acao ${musicaAtual && ehFavorita(musicaAtual.id) ? 'curtida' : ''}`}
          onClick={() => musicaAtual && alternarFavorita(musicaAtual.id)}
          disabled={!musicaAtual}
          aria-label="Curtir esta música"
          title="Curtir esta música"
        >
          <IconeCoracao preenchido={Boolean(musicaAtual && ehFavorita(musicaAtual.id))} />
        </button>

        {/* Eu crio o botão da letra da música. */}
        <button
          type="button"
          className={`botao-acao ${painelLetra ? 'ativo' : ''}`}
          onClick={alternarPainelLetra}
          aria-pressed={painelLetra}
          aria-label="Mostrar a letra da música"
          title="Mostrar a letra da música"
        >
          <IconeLetra />
        </button>

        {/* Eu crio o botão de compartilhar a faixa. */}
        <button
          type="button"
          className="botao-acao"
          onClick={() => musicaAtual && compartilhar(musicaAtual)}
          disabled={!musicaAtual}
          aria-label="Compartilhar com amigos"
          title="Compartilhar com amigos"
        >
          <IconeCompartilhar />
        </button>

        {/* Eu crio o botão de comprar ou apoiar o artista. */}
        {musicaAtual?.apoio && (
          <button
            type="button"
            className="botao-apoiar"
            onClick={() => comprarMusica(musicaAtual)}
            title={
              musicaAtual.preco
                ? 'Comprar esta música'
                : 'Apoiar este artista'
            }
          >
            <IconeCompra />
            {musicaAtual.preco
              ? `Comprar ${formatarPreco(musicaAtual.preco)}`
              : 'Apoiar artista'}
          </button>
        )}

      </div>


      {/* ======================================= */}
      {/* ZONA CENTRAL: CONTROLES                */}
      {/* ======================================= */}

      <div className="zona-player zona-central">

        {/* Eu agrupo os botões de controle. */}
        <div className="controles-reproducao">

          {/* Eu crio o botão do modo aleatório. */}
          <button
            type="button"
            className={`botao-controle ${modoAleatorio ? 'ativo' : ''}`}
            onClick={alternarModoAleatorio}
            aria-pressed={modoAleatorio}
            aria-label="Modo aleatório"
            title="Modo aleatório"
          >
            <IconeAleatorio ativo={modoAleatorio} />
          </button>

          {/* Eu crio o botão da música anterior. */}
          <button
            type="button"
            className="botao-controle"
            onClick={voltarMusica}
            disabled={!musicaAtual}
            aria-label="Música anterior"
            title="Música anterior"
          >
            <IconeAnterior />
          </button>

          {/* Eu crio o botão principal de play e pause. */}
          <button
            type="button"
            className="botao-principal"
            onClick={alternarReproducao}
            disabled={!musicaAtual?.audio}
            aria-label={tocando ? 'Pausar' : 'Reproduzir'}
            title={
              musicaAtual?.audio
                ? tocando ? 'Pausar' : 'Reproduzir'
                : 'Áudio indisponível'
            }
          >
            {tocando ? <IconePausar /> : <IconeTocar />}
          </button>

          {/* Eu crio o botão da próxima música. */}
          <button
            type="button"
            className="botao-controle"
            onClick={avancarMusica}
            disabled={!musicaAtual}
            aria-label="Próxima música"
            title="Próxima música"
          >
            <IconeProxima />
          </button>

          {/* Eu crio o botão do modo de repetição. */}
          <button
            type="button"
            className={`botao-controle ${repetir !== 'nenhum' ? 'ativo' : ''}`}
            onClick={alternarRepetir}
            aria-label={`Repetição: ${repetir}`}
            title={
              repetir === 'nenhum'
                ? 'Repetição desligada'
                : repetir === 'fila'
                  ? 'Repetir a fila inteira'
                  : 'Repetir esta música'
            }
          >
            <IconeRepetir repetirUma={repetir === 'uma'} />
          </button>

        </div>

        {/* Eu organizo a barra de progresso. */}
        <div className="progresso-musical">

          {/* Eu mostro o tempo decorrido. */}
          <span>{formatarTempo(tempoAtual)}</span>

          {/* Eu crio a barra arrastável da música. */}
          <input
            type="range"
            min="0"
            max={duracao > 0 ? duracao : 1}
            step="0.1"
            value={Math.min(tempoAtual, duracao > 0 ? duracao : 1)}
            disabled={duracao <= 0 || !musicaAtual?.audio}
            onChange={alterarPosicao}
            className="barra-progresso-player"
            style={{ '--progresso': `${percentualProgresso}%` }}
            aria-label="Posição da música"
          />

          {/* Eu mostro a duração total. */}
          <span>{formatarTempo(duracao)}</span>

        </div>

      </div>


      {/* ======================================= */}
      {/* ZONA DIREITA: FILA E VOLUME            */}
      {/* ======================================= */}

      <div className="zona-player zona-direita">

        {/* Eu crio o botão da fila de reprodução. */}
        <button
          type="button"
          className={`botao-controle ${painelFila ? 'ativo' : ''}`}
          onClick={alternarPainelFila}
          aria-pressed={painelFila}
          aria-label="Fila de reprodução"
          title="Fila de reprodução"
        >
          <IconeFila />
        </button>

        {/* Eu crio o botão de mudo. */}
        <button
          type="button"
          className="botao-controle"
          onClick={alternarMudo}
          aria-label={volume === 0 ? 'Ativar som' : 'Silenciar'}
          title={volume === 0 ? 'Ativar som' : 'Silenciar'}
        >
          <IconeVolume nivel={nivelVolume} />
        </button>

        {/* Eu crio a barra de volume. */}
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={alterarVolume}
          className="barra-volume"
          style={{ '--progresso': `${percentualVolume}%` }}
          aria-label="Volume"
        />

      </div>


      {/* ======================================= */}
      {/* PAINEL DA FILA                          */}
      {/* ======================================= */}

      {/* Eu exibo a fila somente quando o usuário pedir. */}
      {painelFila && (

        <div className="painel-fila">

          {/* Eu identifico o painel. */}
          <header>
            <h3>Fila de reprodução</h3>
            <small>{fila.length} faixas a seguir</small>
          </header>

          {/* Eu listo as próximas faixas. */}
          <ul>
            {fila.map((proxima) => (

              <li key={proxima.id}>
                <button
                  type="button"
                  onClick={() => {
                    /* Eu toco a faixa escolhida e mantenho a fila. */
                    apiPlayerRef.current?.alternar?.()
                  }}
                  className="item-fila"
                  style={{ display: 'none' }}
                >
                  {proxima.titulo}
                </button>

                {/* Eu mostro a faixa da fila. */}
                <span className="faixa-fila" title={`${proxima.titulo} · ${proxima.artista}`}>
                  <strong>{proxima.titulo}</strong>
                  <small>{proxima.artista}</small>
                </span>
              </li>

            ))}
          </ul>

          {/* Eu aviso quando a fila está vazia. */}
          {fila.length === 0 && (
            <p className="aviso-fila">
              A fila terminou. Ative o modo aleatório para descobrir sons novos.
            </p>
          )}

        </div>

      )}


      {/* ======================================= */}
      {/* PAINEL DA LETRA                         */}
      {/* ======================================= */}

      {/* Eu exibo a letra para acompanhar a faixa. */}
      {painelLetra && musicaAtual && (

        <div className="painel-letra">

          {/* Eu identifico o painel e a faixa atual. */}
          <header>
            <h3>Letra</h3>
            <small title={`${musicaAtual.titulo} · ${musicaAtual.artista}`}>
              {musicaAtual.titulo} · {musicaAtual.artista}
            </small>
          </header>

          {/* Eu mostro a letra encontrada ou salva. */}
          {estadoLetra.status === 'pronta' && (
            <div className="texto-letra">
              {estadoLetra.texto}
            </div>
          )}

          {/* Eu aviso que a busca está em andamento. */}
          {estadoLetra.status === 'buscando' && (
            <p className="texto-letra texto-letra-aviso">
              🔍 Procurando a letra de “{musicaAtual.titulo}”…
            </p>
          )}

          {/* Eu ofereço o campo de letra quando não há resultado. */}
          {estadoLetra.status === 'vazia' && (
            <div className="formulario-letra">

              <p>
                Não achamos a letra automaticamente. Cole abaixo que
                salvamos nesta música para sempre:
              </p>

              {/* Eu crio o campo de texto da letra. */}
              <textarea
                rows="7"
                placeholder="Cole aqui a letra da música…"
                value={rascunhoLetra}
                onChange={(evento) =>
                  setRascunhosLetra((atuais) => ({
                    ...atuais,
                    [musicaAtual.id]: evento.target.value
                  }))
                }
                aria-label="Letra da música"
              />

              {/* Eu crio o botão de salvar a letra. */}
              <button
                type="button"
                className="botao-verde"
                onClick={() => salvarLetra(musicaAtual.id, rascunhoLetra)}
                disabled={!rascunhoLetra.trim()}
              >
                Salvar letra
              </button>

            </div>
          )}

        </div>

      )}

    </section>
  )

}

/* Eu exporto o player para usar no App.jsx. */
export default PlayerMusical
