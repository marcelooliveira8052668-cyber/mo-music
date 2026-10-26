/* ============================================= */
/* M.O MUSIC - PLATAFORMA MUSICAL                */
/* ARQUIVO: App.jsx                              */
/* ============================================= */

/* Eu importo os recursos do React. */
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} from 'react'

/* Eu importo os estilos da plataforma. */
import './App.css'

/* Eu importo o contexto compartilhado. */
import { AppContext, useApp } from './contexto'

/* Eu importo os componentes da interface. */
import BarraLateral from './BarraLateral'
import MusicaCard from './MusicaCard'
import ListaMusicas from './ListaMusicas'
import PlayerMusical from './PlayerMusical'
import AdicionarMusicaForm from './AdicionarMusicaForm'
import ModalPlaylists from './ModalPlaylists'
import PaginaArtista from './PaginaArtista'

/* Eu importo o catálogo oficial de músicas. */
import { catalogo } from './dados/musicas'

/* Eu importo as ferramentas de armazenamento permanente. */
import { listarAnexadas, removerAnexada } from './armazenamento'

/* Eu importo a busca de capas na internet. */
import { buscarCapa, capaConhecida } from './capas'

/* Eu importo a identidade configurável da plataforma. */
import { NOME_PLATAFORMA, ARTISTA } from './configuracao'

/* Eu importo as utilidades da aplicação. */
import {
  lerArmazenamento,
  guardarArmazenamento,
  CHAVES,
  estiloDeGradiente,
  saudacaoDoDia,
  compartilharMusica,
  ehAnexadaMinha
} from './utilitarios'

/* Eu importo os ícones da interface. */
import {
  IconeInicio,
  IconeBusca,
  IconeBiblioteca,
  IconeCoracao,
  IconeVoltar,
  IconeAvancar,
  IconeUsuario,
  IconeTocar,
  IconeMais,
  IconeFechar
} from './Icones'


/* ============================================= */
/* COMPONENTE PRINCIPAL                          */
/* ============================================= */

/* Eu descubro o modificador de teclado do sistema (⌘ no Mac, Ctrl no resto). */
const MODIFICADOR_TECLADO =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || '')
    ? '⌘'
    : 'Ctrl'

/* Eu crio o componente principal da M.O Music. */
function App() {

  /* =========================================== */
  /* ESTADOS DA APLICAÇÃO                       */
  /* =========================================== */

  /* Eu armazeno toda a biblioteca musical. */
  const [listaMusicas, setListaMusicas] = useState(catalogo)

  /* Eu guardo o texto digitado na busca. */
  const [pesquisa, setPesquisa] = useState('')

  /* Eu guardo o gênero escolhido na tela de busca. */
  const [generoAtivo, setGeneroAtivo] = useState(null)

  /* Eu defino quantas músicas aparecem por vez. */
  const [limiteVisivel, setLimiteVisivel] = useState(24)

  /* Eu guardo a música que está no player. */
  const [musicaAtual, setMusicaAtual] = useState(() => {
    const id = new URLSearchParams(window.location.search).get('musica')
    return catalogo.find((musica) => musica.publicada && musica.id === id) ?? catalogo[0] ?? null
  })

  /* Eu conto os pedidos de início automático de faixa. */
  const [contadorTocar, setContadorTocar] = useState(0)

  /* Eu guardo se o player está tocando. */
  const [tocando, setTocando] = useState(false)

  /* Eu guardo o modo aleatório escolhido. */
  const [modoAleatorio, setModoAleatorio] = useState(
    () => lerArmazenamento(CHAVES.aleatorio, false)
  )

  /* Eu guardo o modo de repetição escolhido. */
  const [repetir, setRepetir] = useState(
    () => lerArmazenamento(CHAVES.repetir, 'nenhum')
  )

  /* Eu guardo as músicas curtidas pelo usuário. */
  const [favoritas, setFavoritas] = useState(
    () => lerArmazenamento(CHAVES.favoritas, [])
  )

  /* Eu guardo as playlists criadas pelo usuário. */
  const [playlists, setPlaylists] = useState(
    () => lerArmazenamento(CHAVES.playlists, [])
  )

  /* Eu guardo as últimas músicas tocadas. */
  const [historico, setHistorico] = useState(
    () => lerArmazenamento(CHAVES.historico, [])
  )

  /* Eu guardo quantas vezes cada faixa foi tocada. */
  const [tocagens, setTocagens] = useState(
    () => lerArmazenamento(CHAVES.tocagens, {})
  )

  /* Eu guardo o volume escolhido. */
  const [volume, setVolume] = useState(
    () => lerArmazenamento(CHAVES.volume, 50)
  )

  /* Eu identifico qual tela está aberta. */
  const [visao, setVisao] = useState('artista')

  /* Eu guardo a playlist aberta no momento. */
  const [playlistAtiva, setPlaylistAtiva] = useState(null)

  /* Eu guardo a música que espera entrada em playlist. */
  const [musicaParaPlaylist, setMusicaParaPlaylist] = useState(null)

  /* Eu controlo a visibilidade da fila de reprodução. */
  const [painelFila, setPainelFila] = useState(false)

  /* Eu controlo a visibilidade do painel de letra. */
  const [painelLetra, setPainelLetra] = useState(
    () => lerArmazenamento(CHAVES.painelLetra, false)
  )

  /* Eu guardo as capas descobertas na internet (id → endereço). */
  const [capasInternet, setCapasInternet] = useState({})

  /* Eu guardo a preferência de buscar capas na internet. */
  const [buscarCapas, setBuscarCapas] = useState(
    () => lerArmazenamento(CHAVES.buscarCapas, true)
  )

  /* Eu guardo as letras encontradas na internet. */
  const [cacheLetras, setCacheLetras] = useState({})

  /* Eu guardo a ordem de reprodução atual (fila). */
  const [ordemAtual, setOrdemAtual] = useState(
    () => catalogo.map((musica) => musica.id)
  )

  /* Eu guardo o histórico de telas para o botão voltar. */
  const [pilhaTelas, setPilhaTelas] = useState([])

  /* Eu mostro avisos rápidos na parte inferior da tela. */
  const [avisoGlobal, setAvisoGlobal] = useState('')

  /* Eu controlo o painel informativo do botão Visitante. */
  const [painelVisitante, setPainelVisitante] = useState(false)


  /* =========================================== */
  /* REFERÊNCIAS                                */
  /* =========================================== */

  /* Eu crio a referência das ações do player. */
  const apiPlayerRef = useRef({})

  /* Eu crio a referência do campo de busca. */
  const inputBuscaRef = useRef(null)

  /* Eu crio a referência das ações usadas pelo teclado. */
  const acoesTecladoRef = useRef({ proxima: () => {}, anterior: () => {} })

  /* Eu crio a referência do temporizador dos avisos. */
  const avisoTempoRef = useRef(null)


  /* =========================================== */
  /* PERSISTÊNCIA NO NAVEGADOR                   */
  /* =========================================== */

  /* Eu salvo o modo aleatório. */
  useEffect(() => guardarArmazenamento(CHAVES.aleatorio, modoAleatorio), [modoAleatorio])

  /* Eu salvo o modo de repetição. */
  useEffect(() => guardarArmazenamento(CHAVES.repetir, repetir), [repetir])

  /* Eu salvo as músicas curtidas. */
  useEffect(() => guardarArmazenamento(CHAVES.favoritas, favoritas), [favoritas])

  /* Eu salvo as playlists. */
  useEffect(() => guardarArmazenamento(CHAVES.playlists, playlists), [playlists])

  /* Eu salvo o histórico de reprodução. */
  useEffect(() => guardarArmazenamento(CHAVES.historico, historico), [historico])

  /* Eu salvo as contagens de reprodução. */
  useEffect(() => guardarArmazenamento(CHAVES.tocagens, tocagens), [tocagens])

  /* Eu salvo o volume. */
  useEffect(() => guardarArmazenamento(CHAVES.volume, volume), [volume])

  /* Eu salvo a preferência do painel de letra. */
  useEffect(() => guardarArmazenamento(CHAVES.painelLetra, painelLetra), [painelLetra])

  /* Eu salvo a preferência de busca de capas na internet. */
  useEffect(() => guardarArmazenamento(CHAVES.buscarCapas, buscarCapas), [buscarCapas])


  /* =========================================== */
  /* INFORMAÇÕES DERIVADAS                      */
  /* =========================================== */

  /* Eu filtro as músicas conforme a busca e o gênero escolhido. */
  const musicasFiltradas = useMemo(() => {

    /* Eu preparo o termo de pesquisa. */
    const termo = pesquisa.toLowerCase().trim()

    /* Eu mantenho a lista filtrada por texto e gênero em conjunto. */
    return listaMusicas.filter((musica) => {

      /* Eu confiro se a música bate com o texto digitado. */
      const bateNoTexto = !termo ||
        (musica.titulo ?? '').toLowerCase().includes(termo) ||
        (musica.artista ?? '').toLowerCase().includes(termo) ||
        (musica.categoria ?? '').toLowerCase().includes(termo)

      /* Eu confiro se a música pertence ao gênero escolhido. */
      const bateNoGenero = !generoAtivo ||
        (musica.categoria ?? '') === generoAtivo

      return bateNoTexto && bateNoGenero

    })

  }, [listaMusicas, pesquisa, generoAtivo])

  /* Eu listo os gêneros da biblioteca com a quantidade de faixas. */
  const generos = useMemo(() => {

    /* Eu conto as faixas de cada categoria. */
    const contagem = new Map()
    listaMusicas.forEach((musica) => {
      const nome = (musica.categoria ?? '').trim()
      if (!nome) return
      contagem.set(nome, (contagem.get(nome) ?? 0) + 1)
    })

    /* Eu devolvo os gêneros em ordem alfabética. */
    return [...contagem.entries()]
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  }, [listaMusicas])

  /* Eu conto as músicas anexadas neste aparelho para o painel do visitante. */
  const totalAnexadas = useMemo(
    () => listaMusicas.filter((musica) => ehAnexadaMinha(musica)).length,
    [listaMusicas]
  )

  /* Eu seleciono as músicas visíveis na tela. */
  const musicasVisiveis = musicasFiltradas.slice(0, limiteVisivel)

  /* Eu verifico se ainda existem músicas escondidas. */
  const existemMaisMusicas = limiteVisivel < musicasFiltradas.length

  /* Eu monto a lista de curtidas com os dados completos. */
  const musicasFavoritas = useMemo(
    () =>
      favoritas
        .map((id) => listaMusicas.find((musica) => musica.id === id))
        .filter(Boolean),
    [favoritas, listaMusicas]
  )

  /* Eu ordeno as faixas mais tocadas do usuário. */
  const maisTocadas = useMemo(
    () =>
      Object.entries(tocagens)
        .sort((a, b) => b[1] - a[1])
        .map(([id, total]) => ({
          musica: listaMusicas.find((musica) => musica.id === id),
          total
        }))
        .filter((item) => item.musica)
        .slice(0, 5),
    [tocagens, listaMusicas]
  )

  /* Eu recupero o histórico com os dados completos. */
  const tocadasRecentemente = useMemo(
    () =>
      historico
        .map((id) => listaMusicas.find((musica) => musica.id === id))
        .filter(Boolean)
        .slice(0, 12),
    [historico, listaMusicas]
  )

  /* Eu descubro os artistas com mais faixas. */
  const artistasDestaque = useMemo(() => {

    /* Eu conto as faixas de cada artista. */
    const contagem = {}

    listaMusicas.forEach((musica) => {
      const nome = musica.artista || 'Artista não informado'
      contagem[nome] = (contagem[nome] ?? 0) + 1
    })

    /* Eu devolvo os oito artistas mais presentes. */
    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nome, total]) => ({ nome, total }))

  }, [listaMusicas])

  /* Eu localizo a playlist aberta. */
  const playlistSelecionada =
    playlists.find((playlist) => playlist.id === playlistAtiva) ?? null

  /* Eu monto a lista de músicas da playlist aberta. */
  const musicasDaPlaylist = useMemo(
    () =>
      playlistSelecionada
        ? playlistSelecionada.musicas
            .map((id) => listaMusicas.find((musica) => musica.id === id))
            .filter(Boolean)
        : [],
    [playlistSelecionada, listaMusicas]
  )

  /* Eu calculo as próximas faixas da fila. */
  const fila = useMemo(() => {

    /* Eu encerro quando não existe música no player. */
    if (!musicaAtual) return []

    /* Eu encontro a posição atual na ordem de reprodução. */
    const posicao = ordemAtual.indexOf(musicaAtual.id)

    /* Eu preparo as faixas que vêm depois da atual. */
    const posteriores =
      posicao === -1 ? ordemAtual : ordemAtual.slice(posicao + 1)

    /* Eu converto os ids em músicas completas. */
    return posteriores
      .map((id) => listaMusicas.find((musica) => musica.id === id))
      .filter(Boolean)
      .slice(0, 20)

  }, [ordemAtual, listaMusicas, musicaAtual])


  /* =========================================== */
  /* NAVEGAÇÃO ENTRE TELAS                       */
  /* =========================================== */

  /* Eu levo o usuário para outra tela. */
  function irPara(novaVisao, opcoes = {}) {

    /* Eu memorizo a tela atual no histórico. */
    setPilhaTelas((pilha) => [...pilha, { visao, playlistAtiva }])

    /* Eu troco a tela visível. */
    setVisao(novaVisao)

    /* Eu reinicio a contagem de músicas. */
    setLimiteVisivel(24)

    /* Eu abro a playlist escolhida quando existir. */
    if (opcoes.playlistId !== undefined) setPlaylistAtiva(opcoes.playlistId)

    /* Eu levo o foco à busca quando essa for a tela. */
    if (novaVisao === 'busca') {
      setTimeout(() => inputBuscaRef.current?.focus(), 0)
    }

    /* Eu volto ao topo do conteúdo. */
    document.querySelector('.conteudo')?.scrollTo({ top: 0 })

  }

  /* Eu volto para a tela anterior. */
  function voltarTela() {

    /* Eu verifico se existe tela anterior. */
    const anterior = pilhaTelas[pilhaTelas.length - 1]

    if (!anterior) return

    /* Eu removo a tela do histórico. */
    setPilhaTelas((pilha) => pilha.slice(0, -1))

    /* Eu restauro a tela anterior. */
    setVisao(anterior.visao)
    setPlaylistAtiva(anterior.playlistAtiva)

  }


  /* =========================================== */
  /* BUSCA                                       */
  /* =========================================== */

  /* Eu atualizo o texto digitado na busca. */
  function atualizarPesquisa(evento) {

    /* Eu guardo o novo termo. */
    setPesquisa(evento.target.value)

    /* Eu reinicio a paginação. */
    setLimiteVisivel(24)

    /* Eu abro a tela de resultados automaticamente. */
    if (evento.target.value && visao !== 'busca') setVisao('busca')

  }

  /* Eu limpo a busca atual. */
  function limparPesquisa() {

    /* Eu apago o termo. */
    setPesquisa('')

    /* Eu devolvo o foco ao campo. */
    inputBuscaRef.current?.focus()

  }

  /* Eu pesquiso um artista específico. */
  function pesquisarArtista(nome) {

    /* Eu preencho a busca com o nome do artista. */
    setPesquisa(nome)

    /* Eu reinicio a paginação. */
    setLimiteVisivel(24)

    /* Eu abro a tela de resultados. */
    setVisao('busca')

    /* Eu levo o foco ao campo de busca. */
    setTimeout(() => inputBuscaRef.current?.focus(), 0)

  }


  /* =========================================== */
  /* CONTROLE DE EXIBIÇÃO                        */
  /* =========================================== */

  /* Eu carrego mais 24 músicas na lista. */
  function carregarMaisMusicas() {
    setLimiteVisivel((limite) => limite + 24)
  }

  /* Eu escolho (ou desligo) um gênero na tela de busca. */
  function alternarGenero(nome) {
    setGeneroAtivo((atual) => (atual === nome ? null : nome))
  }


  /* =========================================== */
  /* CONTROLE DO PLAYER                          */
  /* =========================================== */

  /* Eu preparo a faixa para tocar em uma ordem específica. */
  function tocarComOrdem(musica, lista) {

    /* Eu uso a biblioteca completa quando nenhuma lista for informada. */
    const listaFinal = Array.isArray(lista) && lista.length ? lista : listaMusicas

    /* Eu atualizo a ordem de reprodução. */
    setOrdemAtual(listaFinal.map((item) => item.id))

    /* Eu verifico se a faixa escolhida já é a atual. */
    if (musicaAtual?.id === musica.id) {

      /* Eu apenas alterno play e pause. */
      apiPlayerRef.current?.alternar?.()
      return

    }

    /* Eu coloco a nova faixa no player. */
    setMusicaAtual(musica)

    /* Eu peço o início automático da reprodução. */
    setContadorTocar((contador) => contador + 1)

  }

  /* Eu seleciono uma música a partir da interface. */
  function selecionarMusica(musica, conjunto) {
    tocarComOrdem(musica, conjunto)
  }

  /* Eu toco uma lista inteira do primeiro ao último. */
  function tocarConjunto(lista) {

    /* Eu verifico se a lista possui faixas. */
    if (!lista?.length) return

    /* Eu preparo a primeira faixa da lista. */
    const primeira = lista[0]

    /* Eu preparo a ordem de reprodução da lista. */
    setOrdemAtual(lista.map((item) => item.id))

    /* Eu verifico se ela já está no player. */
    if (musicaAtual?.id === primeira.id) {

      /* Eu alterno play e pause. */
      apiPlayerRef.current?.alternar?.()
      return

    }

    /* Eu coloco a primeira faixa. */
    setMusicaAtual(primeira)

    /* Eu peço o início automático. */
    setContadorTocar((contador) => contador + 1)

  }

  /* Eu avanço para a próxima faixa da ordem. */
  function tocarProximaMusica() {

    /* Eu encerro quando não existem faixas. */
    if (ordemAtual.length === 0) return

    /* Eu encontro a posição atual. */
    const indiceAtual = ordemAtual.indexOf(musicaAtual?.id)

    /* Eu preparo a função que aplica a escolha. */
    function aplicar(posicao) {

      /* Eu localizo o id da posição escolhida. */
      const idEscolhido = ordemAtual[posicao]

      /* Eu encontro a música correspondente. */
      const escolhida = listaMusicas.find(
        (musica) => musica.id === idEscolhido
      )

      /* Eu verifico se a música existe na biblioteca. */
      if (escolhida) {

        /* Eu troco a faixa atual. */
        setMusicaAtual(escolhida)

        /* Eu peço o início automático. */
        setContadorTocar((contador) => contador + 1)

      }

    }

    /* Eu verifico o modo aleatório. */
    if (modoAleatorio) {

      /* Eu evito sortear com apenas uma faixa. */
      if (ordemAtual.length === 1) return

      /* Eu sorteio uma posição diferente da atual. */
      let sorteada
      do {
        sorteada = Math.floor(Math.random() * ordemAtual.length)
      } while (sorteada === indiceAtual)

      /* Eu toco a faixa sorteada. */
      aplicar(sorteada)
      return

    }

    /* Eu calculo a próxima posição normal. */
    const proximo = indiceAtual + 1

    /* Eu avanço quando existe próxima faixa. */
    if (proximo < ordemAtual.length) {
      aplicar(proximo)
      return
    }

    /* Eu reinicio a fila quando a repetição está ligada. */
    if (repetir === 'fila') aplicar(0)

    /* Quando não há repetição, o player permanece na última faixa. */

  }

  /* Eu volto para a faixa anterior da ordem. */
  function tocarMusicaAnterior() {

    /* Eu encontro a posição atual na fila. */
    const indiceAtual = ordemAtual.indexOf(musicaAtual?.id)

    /* Eu avanço para a faixa anterior quando possível. */
    if (indiceAtual > 0) {

      /* Eu localizo a faixa anterior. */
      const anterior = listaMusicas.find(
        (musica) => musica.id === ordemAtual[indiceAtual - 1]
      )

      /* Eu troco a faixa quando ela existir. */
      if (anterior) {

        setMusicaAtual(anterior)
        setContadorTocar((contador) => contador + 1)

      }

      return

    }

    /* Eu reinicio a primeira faixa quando já estamos no início. */
    if (musicaAtual) setContadorTocar((contador) => contador + 1)

  }

  /* Eu trato o término natural da faixa. */
  function aoTerminarMusica() {
    tocarProximaMusica()
  }

  /* Eu alterno o modo aleatório. */
  function alternarModoAleatorio() {
    setModoAleatorio((estado) => !estado)
  }

  /* Eu alterno o modo de repetição em ciclo. */
  function alternarRepetir() {
    setRepetir((estado) =>
      estado === 'nenhum' ? 'fila' : estado === 'fila' ? 'uma' : 'nenhum'
    )
  }

  /* Eu alterno o painel da fila (fechando a letra). */
  function alternarPainelFila() {
    setPainelFila((estado) => !estado)
    setPainelLetra(false)
  }

  /* Eu alterno o painel da letra (fechando a fila). */
  function alternarPainelLetra() {
    setPainelLetra((estado) => !estado)
    setPainelFila(false)
  }


  /* =========================================== */
  /* HISTÓRICO E CONTAGENS                       */
  /* =========================================== */

  /* Eu registro a faixa tocada no histórico. */
  function registrarToco(musica) {

    /* Eu coloco a faixa no topo do histórico sem repetir. */
    setHistorico((lista) =>
      [musica.id, ...lista.filter((id) => id !== musica.id)].slice(0, 20)
    )

    /* Eu aumento a contagem de reproduções da faixa. */
    setTocagens((contagem) => ({
      ...contagem,
      [musica.id]: (contagem[musica.id] ?? 0) + 1
    }))

  }


  /* =========================================== */
  /* FAVORITAS                                   */
  /* =========================================== */

  /* Eu verifico se uma música está curtida. */
  function ehFavorita(id) {
    return favoritas.includes(id)
  }

  /* Eu adiciono ou removo uma música das curtidas. */
  function alternarFavorita(id) {
    setFavoritas((lista) =>
      lista.includes(id)
        ? lista.filter((item) => item !== id)
        : [id, ...lista]
    )
  }


  /* =========================================== */
  /* PLAYLISTS                                   */
  /* =========================================== */

  /* Eu crio uma playlist nova e devolvo seu id. */
  function criarPlaylist(nome, musicaInicialId) {

    /* Eu monto o cadastro da playlist. */
    const novaPlaylist = {
      id: `playlist-${Date.now()}`,
      nome,
      musicas: musicaInicialId ? [musicaInicialId] : [],
      criadaEm: Date.now()
    }

    /* Eu adiciono a playlist à coleção. */
    setPlaylists((lista) => [...lista, novaPlaylist])

    /* Eu devolvo o id para navegação. */
    return novaPlaylist.id

  }

  /* Eu excluo uma playlist existente. */
  function excluirPlaylist(id) {

    /* Eu removo a playlist da coleção. */
    setPlaylists((lista) => lista.filter((playlist) => playlist.id !== id))

    /* Eu volto ao início se a playlist aberta for a excluída. */
    if (playlistAtiva === id) irPara('inicio')

  }

  /* Eu adiciono ou removo uma música na playlist. */
  function alternarMusicaNaPlaylist(playlistId, musicaId) {
    setPlaylists((lista) =>
      lista.map((playlist) => {
        if (playlist.id !== playlistId) return playlist
        return playlist.musicas.includes(musicaId)
          ? { ...playlist, musicas: playlist.musicas.filter((id) => id !== musicaId) }
          : { ...playlist, musicas: [...playlist.musicas, musicaId] }
      })
    )
  }

  /* Eu removo uma música da playlist aberta. */
  function removerDaPlaylist(playlistId, musicaId) {
    setPlaylists((lista) =>
      lista.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, musicas: playlist.musicas.filter((id) => id !== musicaId) }
          : playlist
      )
    )
  }

  /* Eu abro a janela de escolha de playlist. */
  function abrirAdicionarAPlaylist(musica) {
    setMusicaParaPlaylist(musica)
  }

  /* Eu fecho a janela de escolha de playlist. */
  function fecharAdicionarAPlaylist() {
    setMusicaParaPlaylist(null)
  }


  /* =========================================== */
  /* ADIÇÃO DE MÚSICAS                           */
  /* =========================================== */

  /* Eu adiciono várias músicas enviadas pelo usuário de uma vez.
     O segundo argumento (opções) permite carregar sem tocar, que é
     o caso da restauração automática ao abrir o site. */
  function adicionarMusicas(novasMusicas, opcoes = {}) {

    /* Eu encerro quando a lista está vazia. */
    if (!novasMusicas.length) return

    /* Eu separo só as músicas que ainda não estão na biblioteca,
       para anexações repetidas não duplicarem nada. */
    const idsExistentes = new Set(listaMusicas.map((musica) => musica.id))
    const realmenteNovas = novasMusicas.filter(
      (musica) => !idsExistentes.has(musica.id)
    )

    /* Eu encerro quando tudo já estava presente. */
    if (!realmenteNovas.length) return

    /* Eu preparo os ids das novas faixas. */
    const ids = realmenteNovas.map((musica) => musica.id)

    /* Eu incluo as músicas no início da biblioteca. */
    setListaMusicas((lista) => [...realmenteNovas, ...lista])

    /* Eu incluo as músicas no início da fila. */
    setOrdemAtual((filaAtual) => [...ids, ...filaAtual])

    /* Eu só mexo no player quando o chamador pedir (padrão: sim). */
    if (opcoes.tocar !== false) {

      /* Eu coloco a primeira música nova no player. */
      setMusicaAtual(realmenteNovas[0])

      /* Eu peço o início automático. */
      setContadorTocar((contador) => contador + 1)

      /* Eu limpo a busca para facilitar a visualização. */
      setPesquisa('')

      /* Eu reinicio a paginação. */
      setLimiteVisivel(24)

      /* Eu levo o usuário até a biblioteca. */
      setVisao('biblioteca')

    }

  }

  /* Eu adiciono uma música enviada pelo usuário. */
  function adicionarNovaMusica(novaMusica) {
    adicionarMusicas([novaMusica])
  }


  /* =========================================== */
  /* EXCLUSÃO DE MÚSICAS ANEXADAS (SÓ DO DONO)   */
  /* =========================================== */

  /* Eu apago uma música anexada deste aparelho.
     O botão só existe para quem anexou — quem recebe o link
     do site vê e ouve a música, mas nunca o botão de excluir. */
  async function excluirAnexada(musica) {

    /* Eu tiro a música da biblioteca. */
    setListaMusicas((lista) =>
      lista.filter((item) => item.id !== musica.id))

    /* Eu tiro a música da fila de reprodução. */
    setOrdemAtual((fila) => fila.filter((id) => id !== musica.id))

    /* Eu tiro a música das curtidas. */
    setFavoritas((lista) => lista.filter((id) => id !== musica.id))

    /* Eu tiro a música de todas as playlists. */
    setPlaylists((lista) =>
      lista.map((playlist) => ({
        ...playlist,
        musicas: playlist.musicas.filter((id) => id !== musica.id)
      }))
    )

    /* Eu paro o player se a música apagada estava tocando. */
    setMusicaAtual((atual) => (atual?.id === musica.id ? null : atual))

    /* Eu apago o registro permanente do navegador. */
    try {
      await removerAnexada(musica.id)
    } catch {
      /* Eu sigo mesmo se o banco falhar — a biblioteca já mudou. */
    }

    /* Eu libero a memória dos endereços temporários. */
    if (musica.audio?.startsWith('blob:')) URL.revokeObjectURL(musica.audio)
    if (musica.capa?.startsWith('blob:')) URL.revokeObjectURL(musica.capa)

    /* Eu confirmo a exclusão para o usuário. */
    setAvisoGlobal(`"${musica.titulo}" foi apagada deste aparelho.`)

  }


  /* =========================================== */
  /* RESTAURAÇÃO DAS MÚSICAS ANEXADAS            */
  /* =========================================== */

  /* Eu recarrego as músicas anexadas guardadas no navegador. */
  useEffect(() => {

    /* Eu preparo a marcação de cancelamento. */
    let cancelado = false

    /* Eu disparo a restauração sem travar a abertura. */
    async function restaurarAnexadas() {

      try {

        /* Eu leio os registros guardados no banco. */
        const anexadas = await listarAnexadas()
        if (cancelado || !anexadas.length) return

        /* Eu recrio os endereços de áudio (Blob vira URL). */
        const restauradas = anexadas.map((registro) => ({
          id: registro.id,
          titulo: registro.titulo,
          artista: registro.artista,
          capa: registro.capa ? URL.createObjectURL(registro.capa) : null,
          audio: URL.createObjectURL(registro.audio),
          categoria: registro.categoria ?? 'Do meu computador',
          apoio: registro.apoio ?? null,
          preco: registro.preco ?? null,
          letra: registro.letra ?? null
        }))

        /* Eu incluo no início da biblioteca sem tocar nada. */
        setListaMusicas((lista) => {
          const atuais = new Set(lista.map((musica) => musica.id))
          const novas = restauradas.filter((musica) => !atuais.has(musica.id))
          return novas.length ? [...novas, ...lista] : lista
        })

      } catch {
        /* Eu sigo sem as anexadas quando o armazenamento falha. */
      }

    }

    restaurarAnexadas()

    /* Eu cancelo a leitura quando o app fecha. */
    return () => { cancelado = true }

  }, [])

  /* Eu aplico a marca configurada ao título da aba do navegador. */
  useEffect(() => {

    document.title = `${ARTISTA.nome} | ${NOME_PLATAFORMA}`

  }, [])


  /* =========================================== */
  /* CAPAS PELA INTERNET                        */
  /* =========================================== */

  /* Eu ligo e desligo a busca de capas na internet. */
  function alternarBuscarCapas() {
    setBuscarCapas((estado) => !estado)
  }

  /* Eu devolvo a capa de uma música: embutida, da internet ou nenhuma. */
  const capaDe = useCallback((musica) => {

    /* Eu encerro quando não há música. */
    if (!musica) return null

    /* Eu uso primeiro a arte do arquivo e depois a encontrada na rede. */
    return musica.capa || capasInternet[musica.id] || capaConhecida(musica) || null

  }, [capasInternet])

  /* Eu procuro capas para as músicas que não têm imagem embutida. */
  useEffect(() => {

    /* Eu respeito a escolha de quem usa o site. */
    if (!buscarCapas) return

    /* Eu preparo a marcação de cancelamento. */
    let vivo = true

    /* Eu escolho até 150 músicas ainda sem capa nesta rodada. */
    const pendentes = listaMusicas
      .filter((musica) => !musica.publicada && !musica.capa && !capaConhecida(musica))
      .slice(0, 150)

    /* Eu disparo as buscas: a fila limita as conexões simultâneas. */
    pendentes.forEach((musica) => {

      buscarCapa(musica).then((capa) => {

        /* Eu ignoro respostas da tela anterior ou busca sem resultado. */
        if (!vivo || !capa) return

        /* Eu guardo a capa encontrada para exibir na hora. */
        setCapasInternet((atual) => ({ ...atual, [musica.id]: capa }))

      })

    })

    /* Eu descarto as respostas quando a biblioteca muda de tela. */
    return () => { vivo = false }

  }, [listaMusicas, buscarCapas])


  /* =========================================== */
  /* AVISOS RÁPIDOS                              */
  /* =========================================== */

  /* Eu exibo uma mensagem curta na tela. */
  function mostrarAviso(mensagem) {

    /* Eu mostro a nova mensagem. */
    setAvisoGlobal(mensagem)

    /* Eu limpo o temporizador anterior. */
    clearTimeout(avisoTempoRef.current)

    /* Eu preparo o desaparecimento automático. */
    avisoTempoRef.current = setTimeout(() => {
      setAvisoGlobal('')
    }, 3800)

  }


  /* =========================================== */
  /* DIVULGAÇÃO COM AMIGOS                       */
  /* =========================================== */

  /* Eu comparto uma música com amigos. */
  async function compartilhar(musica) {

    /* Eu envio a música para a função de compartilhamento. */
    const resultado = await compartilharMusica(musica)

    /* Eu apresento o resultado em uma frase simples. */
    if (resultado === 'arquivo') {
      mostrarAviso('🎵 Música enviada! Escolha o contato para divulgar.')
    } else if (resultado === 'texto') {
      mostrarAviso('🔗 Link compartilhado!')
    } else if (resultado === 'copiado') {
      mostrarAviso('📋 Divulgação copiada — cole onde quiser!')
    } else if (resultado === 'erro') {
      mostrarAviso('Este navegador não permite compartilhar.')
    }

    /* Quando cancelado, o usuário fechou o menu: nada a avisar. */

  }


  /* =========================================== */
  /* COMPRA E APOIO AO ARTISTA                   */
  /* =========================================== */

  /* Eu formata um preço no padrão brasileiro. */
  function formatarPreco(preco) {

    /* Eu converto o valor para número. */
    const valor = Number(preco)

    /* Eu devolvo vazio quando o preço não é válido. */
    if (!Number.isFinite(valor) || valor <= 0) return null

    /* Eu devolvo o valor formatado em reais. */
    return `R$ ${valor.toFixed(2).replace('.', ',')}`

  }

  /* Eu levo o ouvinte até o pagamento ou apoio do artista. */
  async function comprarMusica(musica) {

    /* Eu verifico se a música possui canal de venda ou apoio. */
    const canal = musica.apoio

    if (!canal) return

    /* Eu formata o preço quando existir. */
    const preco = formatarPreco(musica.preco)

    /* Eu verifico se o canal é um link de pagamento. */
    if (/^https?:\/\//i.test(canal)) {

      /* Eu abro a loja ou página de pagamento do artista. */
      window.open(canal, '_blank', 'noopener,noreferrer')

      /* Eu explico o que está acontecendo. */
      mostrarAviso(
        preco
          ? `Abrindo a loja do artista — ${preco}`
          : 'Abrindo o canal do artista…'
      )

      /* Eu encerro a função. */
      return

    }

    /* Eu copio a chave Pix ou chave de apoio. */
    try {
      await navigator.clipboard.writeText(canal)
    } catch {
      mostrarAviso(`Não foi possível copiar. Chave de apoio: ${canal}`)
      return
    }

    /* Eu oriento o ouvinte sobre o próximo passo. */
    mostrarAviso(
      preco
        ? `🔑 Chave Pix copiada! Pague ${preco} no seu banco.`
        : '🔑 Chave de apoio copiada!'
    )

  }


  /* =========================================== */
  /* LETRA DA MÚSICA                             */
  /* =========================================== */

  /* Eu guardo as letras encontradas também numa referência estável. */
  const cacheLetrasRef = useRef({})

  /* Eu salvo uma letra no cache de buscas. */
  const guardarLetraCache = useCallback((id, valor) => {

    /* Eu atualizo a referência e o estado com o mesmo valor. */
    cacheLetrasRef.current = {
      ...cacheLetrasRef.current,
      [id]: valor
    }
    setCacheLetras(cacheLetrasRef.current)

  }, [])

  /* Eu busco a letra quando a música muda e ainda não temos texto. */
  useEffect(() => {

    /* Eu identifico a faixa que passou a tocar. */
    const musica = musicaAtual

    /* Eu não faço nada sem faixa ativa. */
    if (!musica) return

    /* Eu uso a letra salva junto da música, quando existir. */
    if (musica.letra) return

    /* Eu evito buscar de novo uma letra já consultada. */
    if (cacheLetrasRef.current[musica.id] !== undefined) return

    /* Eu preparo a leitura tranquila do texto. */
    const artistaLimpo = (musica.artista ?? '').replace(/\s+/g, ' ').trim()
    const tituloLimpo = (musica.titulo ?? '').replace(/\s+/g, ' ').trim()

    /* Eu desisto cedo quando faltam dados de identificação. */
    if (!artistaLimpo || !tituloLimpo || artistaLimpo === 'Artista não informado') {
      guardarLetraCache(musica.id, null)
      return
    }

    /* Eu marco a busca em andamento na interface. */
    guardarLetraCache(musica.id, '__buscando__')

    /* Eu preparo a mudança de faixa sem esperas antigas. */
    let cancelado = false
    const controlador = new AbortController()

    /* Eu limito a espera para não prender a interface. */
    const limite = setTimeout(() => controlador.abort(), 9000)

    /* Eu consulto a API gratuita de letras. */
    fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artistaLimpo)}/${encodeURIComponent(tituloLimpo)}`,
      { signal: controlador.signal }
    )
      .then((resposta) => {
        if (!resposta.ok) throw new Error('Letra não encontrada')
        return resposta.json()
      })
      .then((dados) => {
        if (cancelado) return
        guardarLetraCache(musica.id, (dados?.lyrics ?? '').trim() || null)
      })
      .catch(() => {
        if (cancelado) return
        guardarLetraCache(musica.id, null)
      })
      .finally(() => clearTimeout(limite))

    /* Eu cancelo a busca ao trocar de música. */
    return () => {
      cancelado = true
      controlador.abort()
      clearTimeout(limite)
    }

  }, [musicaAtual, guardarLetraCache])

  /* Eu descubro em que situação está a letra da faixa atual. */
  const estadoLetra = useMemo(() => {

    /* Eu respondo vazio quando nada está tocando. */
    if (!musicaAtual) return { status: 'nenhuma' }

    /* Eu mostro primeiro a letra salva pelo próprio artista. */
    if (musicaAtual.letra) {
      return { status: 'pronta', texto: musicaAtual.letra, origem: 'salva' }
    }

    /* Eu leio o resultado guardado da busca. */
    const guardado = cacheLetras[musicaAtual.id]

    /* Eu aguardo a busca terminar. */
    if (guardado === undefined || guardado === '__buscando__') {
      return { status: 'buscando' }
    }

    /* Eu aviso quando a API não possui a letra. */
    if (!guardado) return { status: 'vazia' }

    /* Eu mostro a letra encontrada na internet. */
    return { status: 'pronta', texto: guardado, origem: 'busca' }

  }, [musicaAtual, cacheLetras])

  /* Eu permito que o ouvinte cole a letra manualmente. */
  function salvarLetra(musicaId, texto) {

    /* Eu ignoro textos vazios. */
    const limpo = texto.trim()
    if (!limpo) return

    /* Eu gravo a letra na música da biblioteca. */
    setListaMusicas((lista) =>
      lista.map((musica) =>
        musica.id === musicaId ? { ...musica, letra: limpo } : musica
      )
    )

    /* Eu atualizo também a faixa em reprodução. */
    setMusicaAtual((atual) =>
      atual?.id === musicaId ? { ...atual, letra: limpo } : atual
    )

    /* Eu coloco o texto no cache para exibição imediata. */
    guardarLetraCache(musicaId, limpo)

    /* Eu confiro a ação para o ouvinte. */
    mostrarAviso('📝 Letra salva nesta música!')

  }


  /* =========================================== */
  /* ATALHOS DE TECLADO                          */
  /* =========================================== */

  /* Eu atualizo as ações usadas pelo teclado. */
  useEffect(() => {
    acoesTecladoRef.current = {
      proxima: tocarProximaMusica,
      anterior: tocarMusicaAnterior
    }
  })

  /* Eu escuto as teclas da aplicação. */
  useEffect(() => {

    /* Eu crio a função que trata cada tecla. */
    function aoTeclar(evento) {

      /* Eu identifico se o usuário está digitando em um campo. */
      const alvo = evento.target
      const digitando =
        alvo instanceof HTMLElement &&
        (alvo.tagName === 'INPUT' ||
          alvo.tagName === 'TEXTAREA' ||
          alvo.isContentEditable)

      /* Eu ativo a busca com Ctrl/Cmd + K. */
      if (
        (evento.ctrlKey || evento.metaKey) &&
        evento.key.toLowerCase() === 'k'
      ) {
        evento.preventDefault()
        inputBuscaRef.current?.focus()
        inputBuscaRef.current?.select()
        return
      }

      /* Eu ignoro as demais teclas enquanto o usuário digita. */
      if (digitando) return

      /* Eu ativo a busca com a tecla "/". */
      if (evento.key === '/') {
        evento.preventDefault()
        inputBuscaRef.current?.focus()
        return
      }

      /* Eu alterno play e pause com a barra de espaço. */
      if (evento.code === 'Space') {
        evento.preventDefault()
        apiPlayerRef.current?.alternar?.()
        return
      }

      /* Eu avanço ou volto 10 segundos com as setas. */
      if (evento.key === 'ArrowRight' && !evento.shiftKey) {
        apiPlayerRef.current?.avancar10?.()
        return
      }

      if (evento.key === 'ArrowLeft' && !evento.shiftKey) {
        apiPlayerRef.current?.voltar10?.()
        return
      }

      /* Eu troco de faixa com Shift + setas. */
      if (evento.key === 'ArrowRight' && evento.shiftKey) {
        acoesTecladoRef.current.proxima()
        return
      }

      if (evento.key === 'ArrowLeft' && evento.shiftKey) {
        acoesTecladoRef.current.anterior()
      }

    }

    /* Eu registro o ouvinte de teclas. */
    window.addEventListener('keydown', aoTeclar)

    /* Eu removo o ouvinte quando o aplicativo encerra. */
    return () => window.removeEventListener('keydown', aoTeclar)

  }, [])


  /* =========================================== */
  /* CONTEXTO COMPARTILHADO                      */
  /* =========================================== */

  /* Eu reúno tudo que os componentes precisam. */
  const valorContexto = {
    /* Biblioteca */
    listaMusicas,
    musicasFiltradas,
    musicasVisiveis,
    existemMaisMusicas,
    carregarMaisMusicas,
    adicionarNovaMusica,
    adicionarMusicas,
    excluirAnexada,
    /* Busca */
    pesquisa,
    atualizarPesquisa,
    limparPesquisa,
    pesquisarArtista,
    inputBuscaRef,
    generos,
    generoAtivo,
    alternarGenero,
    /* Navegação */
    visao,
    irPara,
    voltarTela,
    pilhaTelas,
    playlistAtiva,
    /* Player */
    musicaAtual,
    contadorTocar,
    tocando,
    definirTocando: setTocando,
    volume,
    definirVolume: setVolume,
    modoAleatorio,
    alternarModoAleatorio,
    repetir,
    alternarRepetir,
    selecionarMusica,
    tocarConjunto,
    tocarProximaMusica,
    tocarMusicaAnterior,
    aoTerminarMusica,
    registrarToco,
    apiPlayerRef,
    fila,
    painelFila,
    alternarPainelFila,
    painelLetra,
    alternarPainelLetra,
    estadoLetra,
    salvarLetra,
    /* Favoritas */
    favoritas,
    musicasFavoritas,
    ehFavorita,
    alternarFavorita,
    /* Playlists */
    playlists,
    playlistSelecionada,
    musicasDaPlaylist,
    criarPlaylist,
    excluirPlaylist,
    alternarMusicaNaPlaylist,
    removerDaPlaylist,
    musicaParaPlaylist,
    abrirAdicionarAPlaylist,
    fecharAdicionarAPlaylist,
    /* Estatísticas */
    tocadasRecentemente,
    maisTocadas,
    artistasDestaque,
    /* Capas da internet */
    capaDe,
    buscarCapas,
    alternarBuscarCapas,
    /* Divulgação e compra */
    compartilhar,
    comprarMusica,
    formatarPreco,
    mostrarAviso
  }


  /* =========================================== */
  /* INTERFACE DA APLICAÇÃO                      */
  /* =========================================== */

  /* Eu retorno a estrutura da plataforma. */
  return (
    <AppContext.Provider value={valorContexto}>

      <div className="aplicacao">

        {/* ======================================= */}
        {/* BARRA LATERAL                           */}
        {/* ======================================= */}

        <BarraLateral />


        {/* ======================================= */}
        {/* PAINEL PRINCIPAL                        */}
        {/* ======================================= */}

        <div className="painel-principal">

          {/* ----------------------------------- */}
          {/* TOPO COM BUSCA                      */}
          {/* ----------------------------------- */}

          <header className="topo-conteudo">

            {/* Eu crio o botão de voltar. */}
            <button
              type="button"
              className="botao-circular"
              onClick={voltarTela}
              disabled={pilhaTelas.length === 0}
              aria-label="Voltar"
              title="Voltar"
            >
              <IconeVoltar />
            </button>

            {/* Eu crio o botão de avançar (decorativo). */}
            <button
              type="button"
              className="botao-circular"
              disabled
              aria-label="Avançar"
              title="Avançar"
            >
              <IconeAvancar />
            </button>

            {/* Eu crio a área de busca. */}
            <div className="campo-busca-topo">

              <IconeBusca />

              {/* Eu crio o campo de busca. */}
              <input
                ref={inputBuscaRef}
                type="search"
                placeholder="O que você quer ouvir?"
                aria-label="Buscar músicas e artistas"
                value={pesquisa}
                onChange={atualizarPesquisa}
              />

              {/* Eu ofereço o botão de limpar a busca. */}
              {pesquisa && (
                <button
                  type="button"
                  onClick={limparPesquisa}
                  aria-label="Limpar busca"
                >
                  <IconeFechar />
                </button>
              )}

              {/* Eu mostro o atalho de teclado enquanto o campo está livre. */}
              {!pesquisa && <kbd className="atalho-teclado">{MODIFICADOR_TECLADO} K</kbd>}

            </div>

            {/* Eu mostro o perfil do visitante com painel funcional. */}
            <div className="area-usuario">

              <button
                type="button"
                className="chip-usuario"
                title="Sessão de visitante"
                aria-haspopup="dialog"
                aria-expanded={painelVisitante}
                onClick={() => setPainelVisitante((aberto) => !aberto)}
              >
                <IconeUsuario />
                <span>Visitante</span>
              </button>

              {/* Eu abro o painel com a explicação da sessão. */}
              {painelVisitante && (

                <>

                  {/* Eu fecho o painel ao clicar fora. */}
                  <div
                    className="fundo-modal"
                    onClick={() => setPainelVisitante(false)}
                  />

                  <div className="painel-visitante" role="dialog" aria-label="Sessão de visitante">

                    {/* Eu identifico o modo de uso. */}
                    <strong>Visitante — sem cadastro</strong>

                    {/* Eu explico como os dados ficam. */}
                    <p>
                      Favoritas, playlists e músicas anexadas ficam guardadas{' '}
                      <strong>neste aparelho</strong> — não precisam de conta
                      e nunca saem daqui.
                    </p>

                    {/* Eu mostro o contador de anexadas. */}
                    <p>
                      {totalAnexadas > 0
                        ? `${totalAnexadas} ${totalAnexadas === 1 ? 'música anexada' : 'músicas anexadas'} neste aparelho.`
                        : 'Nenhuma música anexada ainda.'}
                    </p>

                    {/* Eu ofereço o controle de privacidade das capas. */}
                    <label className="opcao-capas">
                      <input
                        type="checkbox"
                        checked={buscarCapas}
                        onChange={alternarBuscarCapas}
                      />
                      <span>
                        <strong>Buscar capas na internet</strong>
                        <small>
                          Mostra a arte de cada música quando o arquivo não
                          tem imagem. Desligue para usar 100% offline.
                        </small>
                      </span>
                    </label>

                    {/* Eu ofereço o atalho para colocar músicas. */}
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={() => {
                        setPainelVisitante(false)
                        irPara('anexar')
                      }}
                    >
                      Colocar minha música
                    </button>

                  </div>

                </>

              )}

            </div>

          </header>


          {/* ----------------------------------- */}
          {/* ÁREA DE CONTEÚDO                    */}
          {/* ----------------------------------- */}

          <main className="conteudo" key={visao}>

            {/* Eu troco a tela de acordo com a navegação. */}
            {visao === 'artista' && <PaginaArtista />}
            {visao === 'inicio' && <VisaoInicio />}
            {visao === 'busca' && <VisaoBusca />}
            {visao === 'biblioteca' && <VisaoBiblioteca />}
            {visao === 'curtidas' && <VisaoCurtidas />}
            {visao === 'playlist' && <VisaoPlaylist />}
            {visao === 'anexar' && <VisaoAnexar />}

          </main>

        </div>


        {/* ======================================= */}
        {/* PLAYER FIXO                            */}
        {/* ======================================= */}

        <PlayerMusical />


        {/* ======================================= */}
        {/* NAVEGAÇÃO INFERIOR (CELULAR)           */}
        {/* ======================================= */}

        <nav className="nav-inferior" aria-label="Navegação">

          <button
            type="button"
            className={visao === 'artista' ? 'ativo' : ''}
            onClick={() => irPara('artista')}
          >
            <IconeInicio />
            <span>Artista</span>
          </button>

          <button
            type="button"
            className={visao === 'busca' ? 'ativo' : ''}
            onClick={() => irPara('busca')}
          >
            <IconeBusca />
            <span>Buscar</span>
          </button>

          <button
            type="button"
            className={visao === 'biblioteca' ? 'ativo' : ''}
            onClick={() => irPara('biblioteca')}
          >
            <IconeBiblioteca />
            <span>Biblioteca</span>
          </button>

          <button
            type="button"
            className={visao === 'curtidas' ? 'ativo' : ''}
            onClick={() => irPara('curtidas')}
          >
            <IconeCoracao preenchido={visao === 'curtidas'} />
            <span>Curtidas</span>
          </button>

        </nav>


        {/* ======================================= */}
        {/* JANELA DE PLAYLISTS                     */}
        {/* ======================================= */}

        {musicaParaPlaylist && (
          <ModalPlaylists musica={musicaParaPlaylist} />
        )}


        {/* ======================================= */}
        {/* AVISO RÁPIDO                            */}
        {/* ======================================= */}

        {avisoGlobal && (
          <div className="aviso-global" role="status">
            {avisoGlobal}
          </div>
        )}

      </div>

    </AppContext.Provider>
  )

}


/* ============================================= */
/* TELA: INÍCIO                                 */
/* ============================================= */

/* Eu crio a tela inicial da plataforma. */
function VisaoInicio() {

  /* Eu acesso o estado global. */
  const {
    tocadasRecentemente,
    maisTocadas,
    artistasDestaque,
    musicasVisiveis,
    existemMaisMusicas,
    carregarMaisMusicas,
    playlists,
    tocando,
    musicaAtual,
    selecionarMusica,
    pesquisarArtista,
    irPara
  } = useApp()

  /* Eu monto os atalhos rápidos do usuário. */
  const atalhos = [
    { id: 'curtidas', nome: 'Músicas curtidas', destino: 'curtidas' },
    ...playlists.map((playlist) => ({
      id: playlist.id,
      nome: playlist.nome,
      destino: 'playlist',
      playlistId: playlist.id
    }))
  ].slice(0, 8)

  /* Eu retorno a estrutura da tela inicial. */
  return (
    <div className="tela tela-inicio">

      {/* Eu apresento a saudação personalizada. */}
      <div className="saudacao-inicio">
        <h1>{saudacaoDoDia()}</h1>
      </div>


      {/* ===================================== */}
      {/* CHAMADA: COLOQUE SUA MÚSICA           */}
      {/* ===================================== */}

      {/* Eu destaco o principal recurso da plataforma. */}
      <section className="cta-minha-musica">

        {/* Eu mostro o símbolo da chamada. */}
        <span className="icone-cta">♪</span>

        {/* Eu explico o recurso em poucas palavras. */}
        <div className="texto-cta">
          <h2>Coloque suas próprias músicas</h2>
          <p>
            Arraste arquivos do seu computador e toque na hora.
            Sem cadastro — suas músicas nunca saem do seu aparelho.
          </p>
        </div>

        {/* Eu crio o botão principal da chamada. */}
        <button
          type="button"
          className="botao-verde-grande"
          onClick={() => irPara('anexar')}
        >
          <IconeMais />
          Colocar minha música
        </button>

      </section>

      {/* Eu exibo os atalhos rápidos quando existirem. */}
      {atalhos.length > 0 && (

        <div className="grade-atalhos">
          {atalhos.map((atalho) => (

            <button
              key={atalho.id}
              type="button"
              className="card-atalho"
              onClick={() =>
                irPara(atalho.destino, { playlistId: atalho.playlistId })
              }
            >
              <span className="icone-atalho">
                {atalho.destino === 'curtidas' ? '♥' : '♪'}
              </span>
              <strong>{atalho.nome}</strong>
            </button>

          ))}
        </div>

      )}


      {/* ===================================== */}
      {/* SEÇÃO: TOCADAS RECENTEMENTE          */}
      {/* ===================================== */}

      {tocadasRecentemente.length > 0 && (

        <section className="prateleira">

          {/* Eu apresento o título da seção. */}
          <div className="cabecalho-prateleira">
            <h2>Tocadas recentemente</h2>
          </div>

          {/* Eu mostro as faixas em cartões. */}
          <div className="grade-musicas">
            {tocadasRecentemente.map((musica) => (
              <MusicaCard
                key={`recente-${musica.id}`}
                musica={musica}
                conjunto={tocadasRecentemente}
              />
            ))}
          </div>

        </section>

      )}


      {/* ===================================== */}
      {/* SEÇÃO: MAIS TOCADAS                  */}
      {/* ===================================== */}

      {maisTocadas.length > 0 && (

        <section className="prateleira">

          <div className="cabecalho-prateleira">
            <h2>Suas mais tocadas</h2>
          </div>

          {/* Eu mostro a lista ranqueada. */}
          <div className="lista-ranqueada">
            {maisTocadas.map((item, indice) => (

              <div
                key={`tocada-${item.musica.id}`}
                className={
                  musicaAtual?.id === item.musica.id ? 'linha-ranqueada em-reproducao' : 'linha-ranqueada'
                }
                onDoubleClick={() =>
                  selecionarMusica(item.musica, maisTocadas.map((x) => x.musica))
                }
              >

                {/* Eu mostro a posição na ranque. */}
                <span className="numero-ranque">{indice + 1}</span>

                {/* Eu mostro capa e informações. */}
                <span className="info-ranque">
                  <strong>{item.musica.titulo}</strong>
                  <small>{item.musica.artista}</small>
                </span>

                {/* Eu mostro quantas vezes foi tocada. */}
                <span className="contador-ranque">
                  {item.total} {item.total === 1 ? 'reprodução' : 'reproduções'}
                </span>

                {/* Eu mostro o indicador de reprodução. */}
                {musicaAtual?.id === item.musica.id && tocando && (
                  <span className="etiqueta-tocando">tocando</span>
                )}

              </div>

            ))}
          </div>

        </section>

      )}


      {/* ===================================== */}
      {/* SEÇÃO: ARTISTAS EM DESTAQUE          */}
      {/* ===================================== */}

      <section className="prateleira">

        <div className="cabecalho-prateleira">
          <h2>Artistas em destaque</h2>
        </div>

        {/* Eu mostro os artistas da biblioteca. */}
        <div className="grade-artistas">
          {artistasDestaque.map((artista) => (

            <button
              key={artista.nome}
              type="button"
              className="card-artista"
              onClick={() => pesquisarArtista(artista.nome)}
            >

              {/* Eu crio o retrato colorido do artista. */}
              <span
                className="retrato-artista"
                style={estiloDeGradiente(artista.nome)}
              >
                {artista.nome.trim().charAt(0).toUpperCase()}
              </span>

              {/* Eu mostro o nome do artista. */}
              <strong>{artista.nome}</strong>

              {/* Eu mostro a quantidade de faixas. */}
              <small>{artista.total} faixas</small>

            </button>

          ))}
        </div>

      </section>


      {/* ===================================== */}
      {/* SEÇÃO: DESTAQUES DA BIBLIOTECA       */}
      {/* ===================================== */}

      <section className="prateleira">

        <div className="cabecalho-prateleira">
          <h2>Destaques da {NOME_PLATAFORMA}</h2>

          {/* Eu ofereço um atalho para a biblioteca completa. */}
          <button
            type="button"
            className="link-ver-tudo"
            onClick={() => irPara('biblioteca')}
          >
            Mostrar tudo
          </button>
        </div>

        {/* Eu mostro uma seleção de músicas. */}
        <div className="grade-musicas">
          {musicasVisiveis.map((musica) => (
            <MusicaCard
              key={`destaque-${musica.id}`}
              musica={musica}
              conjunto={musicasVisiveis}
            />
          ))}
        </div>

        {/* Eu carrego mais faixas quando necessário. */}
        {existemMaisMusicas && (
          <div className="area-carregar-mais">
            <button
              type="button"
              className="botao-secundario"
              onClick={carregarMaisMusicas}
            >
              Carregar mais
            </button>
          </div>
        )}

      </section>

    </div>
  )

}


/* ============================================= */
/* TELA: BUSCA                                   */
/* ============================================= */

/* Eu crio a tela de resultados de busca. */
function VisaoBusca() {

  /* Eu acesso o estado global. */
  const {
    pesquisa,
    musicasFiltradas,
    musicasVisiveis,
    existemMaisMusicas,
    carregarMaisMusicas,
    tocadasRecentemente,
    artistasDestaque,
    pesquisarArtista,
    tocarConjunto,
    limparPesquisa,
    generos,
    generoAtivo,
    alternarGenero
  } = useApp()

  /* Eu retorno a tela de busca. */
  return (
    <div className="tela tela-busca">

      {/* ================================= */}
      {/* BUSCA POR GÊNERO                  */}
      {/* ================================= */}

      {/* Eu ofereço os gêneros da biblioteca como atalhos. */}
      <section className="prateleira">
        <div className="cabecalho-prateleira">
          <h2>Explore por gênero</h2>
        </div>

        <div className="lista-generos">

          {/* Eu crio o chip que limpa o filtro. */}
          <button
            type="button"
            className={`chip-genero ${generoAtivo ? '' : 'ativo'}`}
            onClick={() => alternarGenero(null)}
          >
            Todos
          </button>

          {/* Eu listo cada gênero encontrado na biblioteca. */}
          {generos.map((genero) => (
            <button
              key={genero.nome}
              type="button"
              className={`chip-genero ${generoAtivo === genero.nome ? 'ativo' : ''}`}
              onClick={() => alternarGenero(genero.nome)}
            >
              {genero.nome}
              <small>{genero.total}</small>
            </button>
          ))}

        </div>
      </section>


      {/* Eu verifico se o usuário ainda não digitou nada. */}
      {!pesquisa.trim() ? (

        generoAtivo ? (

          <>

            {/* Eu apresento as faixas do gênero escolhido. */}
            <div className="cabecalho-prateleira">
              <h2>{generoAtivo}</h2>
              <span className="contagem-resultados">
                {musicasFiltradas.length}{' '}
                {musicasFiltradas.length === 1 ? 'faixa' : 'faixas'} neste gênero
              </span>
            </div>

            {/* Eu mostro as faixas do gênero. */}
            {musicasFiltradas.length > 0 ? (
              <ListaMusicas
                musicas={musicasVisiveis}
                conjunto={musicasFiltradas}
              />
            ) : (

              /* Eu aviso quando o gênero está vazio. */
              <div className="estado-vazio">
                <h3>Nenhuma faixa em “{generoAtivo}”</h3>
                <p>Escolha outro gênero ou clique em Todos.</p>
              </div>

            )}

            {/* Eu carrego mais faixas do gênero. */}
            {existemMaisMusicas && (
              <div className="area-carregar-mais">
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={carregarMaisMusicas}
                >
                  Carregar mais faixas
                </button>
              </div>
            )}

            {/* Eu ofereço o botão de tocar o gênero inteiro. */}
            {musicasFiltradas.length > 1 && (
              <div className="area-acao-principal">
                <button
                  type="button"
                  className="botao-verde-grande"
                  onClick={() => tocarConjunto(musicasFiltradas)}
                >
                  <IconeTocar />
                  Tocar todo o gênero
                </button>
              </div>
            )}

          </>

        ) : (

        <>

          {/* Eu sugiro artistas da biblioteca. */}
          <section className="prateleira">
            <div className="cabecalho-prateleira">
              <h2>Explore por artista</h2>
            </div>

            <div className="grade-artistas">
              {artistasDestaque.map((artista) => (
                <button
                  key={`busca-${artista.nome}`}
                  type="button"
                  className="card-artista"
                  onClick={() => pesquisarArtista(artista.nome)}
                >
                  <span
                    className="retrato-artista"
                    style={estiloDeGradiente(artista.nome)}
                  >
                    {artista.nome.trim().charAt(0).toUpperCase()}
                  </span>
                  <strong>{artista.nome}</strong>
                  <small>{artista.total} faixas</small>
                </button>
              ))}
            </div>
          </section>

          {/* Eu mostro o histórico quando existir. */}
          {tocadasRecentemente.length > 0 && (
            <section className="prateleira">
              <div className="cabecalho-prateleira">
                <h2>Buscas recentes</h2>
              </div>

              <ListaMusicas
                musicas={tocadasRecentemente.slice(0, 6)}
                conjunto={tocadasRecentemente}
              />
            </section>
          )}

        </>

        )

      ) : (

        <>

          {/* Eu apresento a quantidade de resultados. */}
          <div className="cabecalho-prateleira">
            <h2>Resultados para “{pesquisa}”</h2>
            <span className="contagem-resultados">
              {musicasFiltradas.length} {musicasFiltradas.length === 1 ? 'faixa encontrada' : 'faixas encontradas'}
            </span>
          </div>

          {/* Eu mostro as faixas encontradas. */}
          {musicasFiltradas.length > 0 ? (
            <ListaMusicas
              musicas={musicasVisiveis}
              conjunto={musicasFiltradas}
            />
          ) : (

            /* Eu aviso quando nada for encontrado. */
            <div className="estado-vazio">
              <h3>Nada encontrado para “{pesquisa}”</h3>
              <p>Confira a grafia ou pesquise pelo nome do artista.</p>
              <button
                type="button"
                className="botao-secundario"
                onClick={limparPesquisa}
              >
                Limpar busca
              </button>
            </div>

          )}

          {/* Eu carrego mais resultados. */}
          {existemMaisMusicas && (
            <div className="area-carregar-mais">
              <button
                type="button"
                className="botao-secundario"
                onClick={carregarMaisMusicas}
              >
                Carregar mais resultados
              </button>
            </div>
          )}

          {/* Eu ofereço o botão de tocar todos os resultados. */}
          {musicasFiltradas.length > 1 && (
            <div className="area-acao-principal">
              <button
                type="button"
                className="botao-verde-grande"
                onClick={() => tocarConjunto(musicasFiltradas)}
              >
                <IconeTocar />
                Tocar todos os resultados
              </button>
            </div>
          )}

        </>

      )}

    </div>
  )

}


/* ============================================= */
/* TELA: BIBLIOTECA                              */
/* ============================================= */

/* Eu crio a tela da biblioteca musical. */
function VisaoBiblioteca() {

  /* Eu acesso o estado global. */
  const {
    listaMusicas,
    musicasFiltradas,
    musicasVisiveis,
    existemMaisMusicas,
    carregarMaisMusicas,
    tocarConjunto,
    irPara
  } = useApp()

  /* Eu retorno a tela da biblioteca. */
  return (
    <div className="tela tela-biblioteca">

      {/* Eu apresento o cabeçalho colorido. */}
      <header
        className="cabecalho-visao"
        style={estiloDeGradiente('Sua Biblioteca')}
      >

        {/* Eu informo o tipo de conteúdo. */}
        <span className="rotulo-visao">Coleção</span>

        {/* Eu apresento o título da tela. */}
        <h1>Sua Biblioteca</h1>

        {/* Eu mostro o tamanho da coleção. */}
        <p>{listaMusicas.length} músicas disponíveis</p>

        {/* Eu agrupo as ações do cabeçalho. */}
        <div className="acoes-cabecalho">

          {/* Eu crio o botão de tocar tudo. */}
          <button
            type="button"
            className="botao-verde-grande"
            onClick={() => tocarConjunto(listaMusicas)}
            disabled={listaMusicas.length === 0}
          >
            <IconeTocar />
            Tocar tudo
          </button>

          {/* Eu crio o botão para anexar músicas. */}
          <button
            type="button"
            className="botao-secundario"
            onClick={() => irPara('anexar')}
          >
            Anexar do meu computador
          </button>

        </div>

      </header>

      {/* Eu mostro a grade completa da biblioteca. */}
      <div className="grade-musicas area-grade">
        {musicasVisiveis.map((musica) => (
          <MusicaCard
            key={`biblioteca-${musica.id}`}
            musica={musica}
            conjunto={musicasVisiveis}
          />
        ))}
      </div>

      {/* Eu aviso quando a busca não encontra nada. */}
      {musicasVisiveis.length === 0 && (
        <div className="estado-vazio">
          <h3>Nenhuma música encontrada</h3>
          <p>Tente outro termo ou anexe novas músicas.</p>
        </div>
      )}

      {/* Eu carrego mais faixas. */}
      {existemMaisMusicas && (
        <div className="area-carregar-mais">
          <button
            type="button"
            className="botao-secundario"
            onClick={carregarMaisMusicas}
          >
            Carregar mais músicas
          </button>

          <p className="contador-exibicao">
            Exibindo {musicasVisiveis.length} de {musicasFiltradas.length} músicas
          </p>
        </div>
      )}

    </div>
  )

}


/* ============================================= */
/* TELA: CURTIDAS                               */
/* ============================================= */

/* Eu crio a tela das músicas curtidas. */
function VisaoCurtidas() {

  /* Eu acesso o estado global. */
  const { musicasFavoritas, tocarConjunto, irPara } = useApp()

  /* Eu retorno a tela de curtidas. */
  return (
    <div className="tela tela-curtidas">

      {/* Eu apresento o cabeçalho com coração. */}
      <header
        className="cabecalho-visao"
        style={estiloDeGradiente('Curtidas')}
      >

        {/* Eu mostro o símbolo grande de curtida. */}
        <span className="capa-visao-icone coracao-grande">♥</span>

        {/* Eu identifico o conteúdo. */}
        <span className="rotulo-visao">Playlist</span>

        {/* Eu apresento o título. */}
        <h1>Curtidas</h1>

        {/* Eu mostro o total de faixas. */}
        <p>{musicasFavoritas.length} músicas salvas</p>

        {/* Eu ofereço o botão de tocar tudo. */}
        {musicasFavoritas.length > 0 && (
          <div className="acoes-cabecalho">
            <button
              type="button"
              className="botao-verde-grande"
              onClick={() => tocarConjunto(musicasFavoritas)}
            >
              <IconeTocar />
              Tocar
            </button>
          </div>
        )}

      </header>

      {/* Eu mostro as faixas curtidas. */}
      {musicasFavoritas.length > 0 ? (
        <ListaMusicas
          musicas={musicasFavoritas}
          conjunto={musicasFavoritas}
        />
      ) : (

        /* Eu convido o usuário a curtir músicas. */
        <div className="estado-vazio">
          <span className="icone-vazio">♥</span>
          <h3>Nenhuma música curtida ainda</h3>
          <p>
            Toque no coração de qualquer música para guardar aqui.
          </p>
          <button
            type="button"
            className="botao-secundario"
            onClick={() => irPara('biblioteca')}
          >
            Explorar biblioteca
          </button>
        </div>

      )}

    </div>
  )

}


/* ============================================= */
/* TELA: PLAYLIST                               */
/* ============================================= */

/* Eu crio a tela de uma playlist. */
function VisaoPlaylist() {

  /* Eu acesso o estado global. */
  const {
    playlistSelecionada,
    musicasDaPlaylist,
    tocarConjunto,
    excluirPlaylist,
    irPara
  } = useApp()

  /* Eu verifico se a playlist ainda existe. */
  if (!playlistSelecionada) {

    /* Eu mostro um aviso quando a playlist sumiu. */
    return (
      <div className="tela">
        <div className="estado-vazio">
          <h3>Playlist não encontrada</h3>
          <button
            type="button"
            className="botao-secundario"
            onClick={() => irPara('inicio')}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )

  }

  /* Eu retorno a tela da playlist. */
  return (
    <div className="tela tela-playlist">

      {/* Eu apresento o cabeçalho da playlist. */}
      <header
        className="cabecalho-visao"
        style={estiloDeGradiente(playlistSelecionada.nome)}
      >

        {/* Eu mostro a capa da playlist. */}
        <span className="capa-visao-icone">♪</span>

        {/* Eu identifico o tipo de conteúdo. */}
        <span className="rotulo-visao">Playlist</span>

        {/* Eu mostro o nome da playlist. */}
        <h1>{playlistSelecionada.nome}</h1>

        {/* Eu mostro quantas faixas ela contém. */}
        <p>{musicasDaPlaylist.length} músicas</p>

        {/* Eu agrupo as ações da playlist. */}
        <div className="acoes-cabecalho">

          {/* Eu crio o botão de tocar a playlist. */}
          <button
            type="button"
            className="botao-verde-grande"
            onClick={() => tocarConjunto(musicasDaPlaylist)}
            disabled={musicasDaPlaylist.length === 0}
          >
            <IconeTocar />
            Tocar
          </button>

          {/* Eu crio o botão de adicionar faixas. */}
          <button
            type="button"
            className="botao-secundario"
            onClick={() => irPara('biblioteca')}
          >
            Adicionar músicas
          </button>

          {/* Eu crio o botão de excluir a playlist. */}
          <button
            type="button"
            className="botao-secundario botao-perigo"
            onClick={() => excluirPlaylist(playlistSelecionada.id)}
          >
            Excluir playlist
          </button>

        </div>

      </header>

      {/* Eu mostro as faixas da playlist. */}
      {musicasDaPlaylist.length > 0 ? (
        <ListaMusicas
          musicas={musicasDaPlaylist}
          conjunto={musicasDaPlaylist}
        />
      ) : (

        /* Eu convido o usuário a adicionar músicas. */
        <div className="estado-vazio">
          <span className="icone-vazio">♪</span>
          <h3>Esta playlist está vazia</h3>
          <p>
            Use o botão “+” em qualquer música para adicioná-la aqui.
          </p>
          <button
            type="button"
            className="botao-secundario"
            onClick={() => irPara('biblioteca')}
          >
            Explorar biblioteca
          </button>
        </div>

      )}

      {/* Eu explico como remover faixas da playlist. */}
      {musicasDaPlaylist.length > 0 && (
        <div className="dica-playlist">
          <p>
            Para remover uma faixa, clique no <strong>“+”</strong> ao lado
            dela e toque novamente em <strong>{playlistSelecionada.nome}</strong>.
          </p>
        </div>
      )}

    </div>
  )

}


/* ============================================= */
/* TELA: ANEXAR MÚSICA                           */
/* ============================================= */

/* Eu crio a tela de envio de músicas locais. */
function VisaoAnexar() {

  /* Eu acesso o estado global. */
  const { irPara } = useApp()

  /* Eu retorno a tela de anexos. */
  return (
    <div className="tela tela-anexar">

      {/* Eu apresento o cabeçalho. */}
      <header
        className="cabecalho-visao"
        style={estiloDeGradiente('Do meu computador')}
      >
        <span className="rotulo-visao">Recursos</span>
        <h1>Tocar do meu computador</h1>
        <p>Seus arquivos ficam no seu aparelho — nada é enviado para a internet.</p>
      </header>

      <div className="artista-painel">
        <h2>Anexar não é publicar</h2>
        <p>Esta área serve para ouvir arquivos neste aparelho. Para aparecer na página pública do artista, a música precisa ser hospedada e incluída no catálogo do site pelo responsável pela publicação.</p>
        <p>O modelo atual é personalizado nos arquivos do projeto. Ele não possui contas de artistas, painel de publicação online nem entrega automática de downloads pagos.</p>
      </div>

      {/* Eu apresento o formulário. */}
      <AdicionarMusicaForm />

      {/* Eu ofereço o caminho de volta. */}
      <div className="area-carregar-mais">
        <button
          type="button"
          className="botao-secundario"
          onClick={() => irPara('biblioteca')}
        >
          Voltar à biblioteca
        </button>
      </div>

    </div>
  )

}


/* ============================================= */
/* ATALHO DE CONTEXTO                            */
/* ============================================= */

/* Eu exporto o componente principal. */
export default App
