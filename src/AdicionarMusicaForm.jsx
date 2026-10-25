/* ============================================= */
/* M.O MUSIC - FORMULÁRIO DE ADIÇÃO DE MÚSICA    */
/* ARQUIVO: src/AdicionarMusicaForm.jsx          */
/* ============================================= */

/* Eu importo os recursos do React. */
import { useState, useRef, useEffect } from 'react'

/* Eu importo o estado compartilhado da aplicação. */
import { useApp } from './contexto'

/* Eu importo os ícones do formulário. */
import { IconeMais, IconeFechar, IconeTocar } from './Icones'

/* Eu importo o catálogo automático para não duplicar arquivos da pasta. */
import { musicasAutomaticas } from './dados/musicas'

/* Eu importo o leitor de etiquetas (seguro: só em envio de um arquivo). */
import { lerMetadadosMusica } from './dados/musicas'

/* Eu importo as ferramentas de armazenamento local do navegador. */
import {
  salvarAnexada,
  suportaPasta,
  escolherPasta,
  salvarHandlePasta,
  lerHandlePasta,
  permissaoDaPasta,
  pedirPermissaoDaPasta,
  colecionarAudiosDaPasta,
  solicitarPermanencia,
  verificarEspaco
} from './armazenamento'


/* ============================================= */
/* VERIFICAÇÃO DE ARQUIVOS DE ÁUDIO              */
/* ============================================= */

/* Eu confirmo se um arquivo é uma música aceita. */
function ehAudio(arquivo) {

  /* Eu verifico o tipo declarado pelo sistema. */
  if (arquivo.type?.startsWith('audio/')) return true

  /* Eu aceito também pelas extensões conhecidas. */
  return /\.(mp3|m4a|ogg|wav|flac|aac)$/i.test(arquivo.name)

}


/* ============================================= */
/* IDENTIFICAÇÃO ESTÁVEL DAS MÚSICAS ANEXADAS    */
/* ============================================= */

/* Eu monto o identificador estável de uma música anexada.
   O mesmo arquivo sempre gera o mesmo id — assim nada duplica,
   nem entre sessões, nem entre o modo cópia e o modo pasta. */
function idDaAnexada(arquivo) {

  /* Eu combino nome e tamanho, que identificam o arquivo na prática. */
  return `anexada-${arquivo.name}-${arquivo.size}`

}

/* Eu separo "Artista - Título" quando o nome do arquivo segue o padrão. */
function separarNomeArquivo(arquivo) {

  /* Eu removo a extensão e troco sublinhado por espaço. */
  const nome = arquivo.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')

  /* Eu só aceito o padrão quando as duas partes têm conteúdo. */
  const partes = nome.split(' - ')
  if (partes.length >= 2 && partes[0].trim() && partes[1].trim()) {
    return { artista: partes[0].trim(), titulo: partes.slice(1).join(' - ').trim() }
  }

  /* Eu mantenho o nome inteiro como título quando não há padrão. */
  return { artista: 'Artista Independente', titulo: nome }

}

/* Eu monto o cadastro de uma música anexada direto do arquivo. */
function montarMusicaAnexada(arquivo) {

  /* Eu identifico artista e título pelo nome do arquivo. */
  const nome = separarNomeArquivo(arquivo)

  /* Eu devolvo o cadastro pronto para a biblioteca. */
  return {
    id: idDaAnexada(arquivo),
    titulo: nome.titulo,
    artista: nome.artista,
    capa: null,
    audio: URL.createObjectURL(arquivo),
    categoria: 'Do meu computador',
    apoio: null,
    preco: null,
    letra: null
  }

}


/* ============================================= */
/* COMPONENTE DO FORMULÁRIO                      */
/* ============================================= */

/* Eu crio a área onde qualquer pessoa coloca suas músicas. */
function AdicionarMusicaForm() {

  /* Eu acesso o estado global da aplicação. */
  const { adicionarMusicas } = useApp()

  /* Eu guardo os arquivos escolhidos. */
  const [arquivos, setArquivos] = useState([])

  /* Eu guardo o título digitado (usado em envio único). */
  const [titulo, setTitulo] = useState('')

  /* Eu guardo o artista digitado (usado em envio único). */
  const [artista, setArtista] = useState('')

  /* Eu guardo a capa escolhida. */
  const [capa, setCapa] = useState(null)

  /* Eu guardo a chave Pix ou link de compra do artista. */
  const [apoio, setApoio] = useState('')

  /* Eu guardo o preço opcional da música. */
  const [preco, setPreco] = useState('')

  /* Eu guardo a letra colada pelo artista. */
  const [letra, setLetra] = useState('')

  /* Eu guardo o gênero digitado (vale para todos os arquivos escolhidos). */
  const [genero, setGenero] = useState('')

  /* Eu controlo o destaque da área de arraste. */
  const [arrastando, setArrastando] = useState(false)

  /* Eu guardo mensagens de aviso para o usuário. */
  const [aviso, setAviso] = useState('')

  /* Eu crio a referência do campo de arquivos. */
  const inputArquivosRef = useRef(null)

  /* Eu guardo se o navegador atual suporta o modo pasta. */
  const [temModoPasta] = useState(() => suportaPasta())

  /* Eu controlo o botão de reconexão da pasta salva. */
  const [pastaReconectavel, setPastaReconectavel] = useState(false)

  /* Eu guardo a referência mais recente da função de integração da pasta
     para o efeito de abertura usar sem reiniciar a cada render. */
  const integrarPastaRef = useRef(null)


  /* =========================================== */
  /* SELEÇÃO DE ARQUIVOS                         */
  /* =========================================== */

  /* Eu recebo uma lista de arquivos e filtro as músicas. */
  function receberArquivos(lista) {

    /* Eu converto a lista em um array comum. */
    const recebidos = Array.from(lista ?? [])

    /* Eu separo somente os arquivos de áudio. */
    const novos = recebidos.filter(ehAudio)

    /* Eu aviso quando nenhum arquivo válido chegar. */
    if (novos.length === 0) {
      setAviso('Escolha arquivos de áudio: MP3, M4A, OGG ou WAV.')
      return
    }

    /* Eu aviso sobre arquivos ignorados. */
    if (novos.length < recebidos.length) {
      setAviso('Alguns arquivos não são de áudio e foram ignorados.')
    } else {
      setAviso('')
    }

    /* Eu removo duplicatas pelo nome e tamanho. */
    setArquivos((atuais) => {
      const existentes = new Set(atuais.map((a) => `${a.name}-${a.size}`))
      const unicos = novos.filter(
        (a) => !existentes.has(`${a.name}-${a.size}`)
      )
      return [...atuais, ...unicos]
    })

    /* Eu leio os metadados quando a seleção é única. */
    if (novos.length === 1 && arquivos.length === 0) {
      preencherPelaMusica(novos[0])
    }

  }

  /* Eu preencho título e artista com os dados do arquivo. */
  async function preencherPelaMusica(arquivo) {

    try {

      /* Eu crio um endereço temporário. */
      const endereco = URL.createObjectURL(arquivo)

      /* Eu leio as etiquetas internas da música. */
      const dados = await lerMetadadosMusica(endereco)

      /* Eu preencho o título quando ele existe. */
      if (dados.titulo) setTitulo(dados.titulo)

      /* Eu preencho o artista quando ele existe. */
      if (dados.artista) setArtista(dados.artista)

    } catch {

      /* Eu sigo em frente usando o nome do arquivo. */
      /* O nome do arquivo já é uma ótima alternativa. */

    }

  }

  /* Eu abro a seleção de arquivos com o clique. */
  function abrirSelecao() {
    inputArquivosRef.current?.click()
  }

  /* Eu trato a escolha feita pelo campo de arquivos. */
  function aoEscolherArquivos(evento) {
    receberArquivos(evento.target.files)
    evento.target.value = ''
  }

  /* Eu removo um arquivo da lista de envio. */
  function removerArquivo(indice) {
    setArquivos((atuais) => atuais.filter((_, posicao) => posicao !== indice))
  }


  /* =========================================== */
  /* ARRASTAR E SOLTAR                           */
  /* =========================================== */

  /* Eu aceito os arquivos arrastados até a área. */
  function aoSoltar(evento) {

    /* Eu evito que o navegador abra o arquivo. */
    evento.preventDefault()

    /* Eu removo o destaque da área. */
    setArrastando(false)

    /* Eu recebo os arquivos soltos. */
    receberArquivos(evento.dataTransfer.files)

  }

  /* Eu mantenho o navegador pronto para receber arquivos. */
  function aoArrastar(evento) {

    /* Eu evito o comportamento padrão do navegador. */
    evento.preventDefault()

    /* Eu acendo a área de destino. */
    setArrastando(true)

  }

  /* Eu apago o destaque quando o mouse sai da área. */
  function aoSairDaArea() {
    setArrastando(false)
  }


  /* =========================================== */
  /* ENVIO DAS MÚSICAS                           */
  /* =========================================== */

  /* Eu crio a função que adiciona as músicas escolhidas. */
  async function processarEnvio(evento) {

    /* Eu evito o recarregamento da página. */
    evento.preventDefault()

    /* Eu exijo pelo menos um arquivo. */
    if (arquivos.length === 0) {
      setAviso('Escolha pelo menos um arquivo de áudio primeiro.')
      return
    }

    /* Eu preparo a lista de novas músicas. */
    const novasMusicas = []

    /* Eu percorro cada arquivo selecionado. */
    for (const arquivo of arquivos) {

      /* Eu crio o endereço temporário da música. */
      const urlAudio = URL.createObjectURL(arquivo)

      /* Eu preparo os valores padrão do cadastro. */
      let tituloFinal = arquivo.name.replace(/\.[^/.]+$/, '')
      let artistaFinal = 'Artista Independente'

      /* Eu uso os campos digitados quando existe um único arquivo. */
      if (arquivos.length === 1) {
        if (titulo.trim()) tituloFinal = titulo.trim()
        if (artista.trim()) artistaFinal = artista.trim()
      } else {

        /* Em envios em massa eu leio o padrão "Artista - Título" direto
           do nome do arquivo — sem abrir cada música, porque baixar 600
           arquivos para ler etiquetas travava a página inteira. */
        const nome = separarNomeArquivo(arquivo)
        tituloFinal = nome.titulo
        artistaFinal = nome.artista

      }

      /* Eu monto o cadastro completo. */
      novasMusicas.push({
        id: idDaAnexada(arquivo),
        titulo: tituloFinal,
        artista: artistaFinal,
        capa: capa ? URL.createObjectURL(capa) : null,
        audio: urlAudio,

        /* Eu uso o gênero digitado ou a origem padrão da anexação. */
        categoria: genero.trim() || 'Do meu computador',

        /* Eu guardo o canal de venda ou apoio do artista. */
        apoio: apoio.trim() || null,

        /* Eu converto o preço digitado em número. */
        preco: preco.trim()
          ? Number(preco.trim().replace(',', '.')) || null
          : null,

        /* Eu guardo a letra colada junto da música. */
        letra: letra.trim() || null
      })

    }

    /* Eu envio todas as músicas para a biblioteca. */
    adicionarMusicas(novasMusicas)

    /* Eu limpo o formulário para um novo envio. */
    setArquivos([])
    setTitulo('')
    setArtista('')
    setCapa(null)
    setApoio('')
    setPreco('')
    setLetra('')
    setGenero('')
    setAviso('')

    /* Eu copio os arquivos para o armazenamento permanente do navegador,
       para continuarem lá depois que a página for fechada. */
    await guardarNoNavegador(novasMusicas, arquivos)

  }


  /* =========================================== */
  /* GRAVAÇÃO PERMANENTE NO NAVEGADOR            */
  /* =========================================== */

  /* Eu copio os arquivos anexados para o armazenamento do navegador. */
  async function guardarNoNavegador(novasMusicas, arquivosSelecionados) {

    /* Eu evito o trabalho quando não há música. */
    if (!novasMusicas.length) return

    /* Eu peço ao navegador para tratar o armazenamento como permanente,
       reduzindo o risco de ele apagar os dados em limpezas automáticas. */
    solicitarPermanencia()

    /* Eu somo o espaço que a cópia vai ocupar. */
    const bytesTotal = arquivosSelecionados.reduce(
      (soma, arquivo) => soma + arquivo.size, 0)

    try {

      /* Eu confiro se existe espaço antes de começar. */
      const espaco = await verificarEspaco(bytesTotal)
      if (!espaco.suficiente) {
        setAviso('O navegador não tem espaço para copiar estas músicas. Elas seguem na biblioteca desta sessão; para manter sem copiar nada, use o modo "Escolher pasta de músicas".')
        return
      }

      /* Eu percorro os arquivos copiando um a um. */
      const total = novasMusicas.length
      for (let indice = 0; indice < total; indice += 1) {

        /* Eu preparo os dados do registro. */
        const musica = novasMusicas[indice]
        const arquivo = arquivosSelecionados[indice]

        /* Eu gravo a música inteira (metadados + arquivo) no banco local. */
        await salvarAnexada({
          id: musica.id,
          titulo: musica.titulo,
          artista: musica.artista,
          categoria: musica.categoria,
          apoio: musica.apoio,
          preco: musica.preco,
          letra: musica.letra,
          nomeArquivo: arquivo.name,
          tamanho: arquivo.size,
          tipoArquivo: arquivo.type,
          criadoEm: Date.now(),
          audio: arquivo,
          capa: capa || null
        })

        /* Eu mostro o andamento de tempos em tempos para não pesar. */
        if (indice % 5 === 0 || indice === total - 1) {
          setAviso(`Salvando no navegador: ${indice + 1} de ${total}...`)
        }

      }

      /* Eu confirmo o fim da cópia. */
      setAviso(total === 1
        ? 'Música salva neste aparelho — continua aqui depois que você fechar o site.'
        : `${total} músicas salvas neste aparelho — continuam aqui depois que você fechar o site.`)

    } catch (erro) {

      /* Eu explico o caso clássico de espaço esgotado no meio da cópia. */
      if (erro?.name === 'QuotaExceededError') {
        setAviso('O navegador ficou sem espaço durante a cópia. Use o modo "Escolher pasta de músicas" para manter tudo sem copiar.')
      } else {
        setAviso('Não deu para salvar no navegador agora — as músicas seguem funcionando nesta sessão.')
      }

    }

  }


  /* =========================================== */
  /* MODO PASTA (Chrome/Edge)                    */
  /* =========================================== */

  /* Eu carrego os arquivos da pasta na biblioteca, sem copiar nada. */
  async function integrarPasta(handle) {

    /* Eu aviso que a leitura começou. */
    setAviso('Lendo a pasta de músicas...')

    /* Eu coleciono os áudios encontrados (inclusive em subpastas). */
    const arquivosDaPasta = await colecionarAudiosDaPasta(handle)

    /* Eu identifico os arquivos que já estão no catálogo automático,
       que é o caso quando o app roda na máquina do dono da pasta. */
    const nomesNoCatalogo = new Set(
      musicasAutomaticas.map((musica) => musica.id.split('/').pop())
    )

    /* Eu monto só as músicas que ainda não estão na biblioteca. */
    const musicasDaPasta = arquivosDaPasta
      .filter((arquivo) => !nomesNoCatalogo.has(arquivo.name))
      .map((arquivo) => montarMusicaAnexada(arquivo))

    /* Eu adiciono tudo sem começar a tocar (a página pode ter acabado de abrir). */
    adicionarMusicas(musicasDaPasta, { tocar: false })

    /* Eu desligo o botão de reconexão e confirmo o carregamento. */
    setPastaReconectavel(false)
    setAviso(musicasDaPasta.length
      ? `${musicasDaPasta.length} músicas da pasta carregadas — direto da pasta, sem copiar nada.`
      : 'Nenhuma música nova encontrada na pasta.')

  }

  /* Eu guardo a versão mais recente para o efeito de abertura usar. */
  useEffect(() => {

    integrarPastaRef.current = integrarPasta

  })

  /* Eu leio a pasta salva assim que o formulário abre. */
  useEffect(() => {

    /* Eu só continuo em navegadores com suporte à API de pastas. */
    if (!suportaPasta()) return undefined

    /* Eu preparo a marcação de cancelamento do efeito. */
    let cancelado = false

    /* Eu disparo a reconexão sem travar a abertura da página. */
    async function reconectarAutomaticamente() {

      try {

        /* Eu recupero o endereço da última pasta usada. */
        const handle = await lerHandlePasta()
        if (!handle || cancelado) return

        /* Eu pergunto se ainda podemos ler a pasta. */
        const permissao = await permissaoDaPasta(handle)

        /* Com permissão já confirmada, carrego as músicas na hora. */
        if (permissao === 'granted') {
          await integrarPastaRef.current?.(handle)
          return
        }

        /* Com permissão pendente, espero o clique no botão de reconexão. */
        if (permissao === 'prompt' && !cancelado) setPastaReconectavel(true)

      } catch {
        /* Eu ignoro falhas do banco — o app funciona sem a pasta. */
      }

    }

    reconectarAutomaticamente()

    /* Eu cancelo a leitura quando o componente sai da tela. */
    return () => { cancelado = true }

  }, [])

  /* Eu abro a janela de escolha de pasta. */
  async function abrirPasta() {

    try {

      /* Eu peço a pasta para o usuário. */
      const handle = await escolherPasta()

      /* Eu guardo o endereço para reconectar sozinho da próxima vez. */
      await salvarHandlePasta(handle)

      /* Eu carrego os áudios encontrados. */
      await integrarPasta(handle)

    } catch (erro) {

      /* Eu silencio o cancelamento da janela e aviso os erros reais. */
      if (erro?.name !== 'AbortError') {
        setAviso('Não deu para abrir a pasta escolhida.')
      }

    }

  }

  /* Eu reconecto a última pasta quando o navegador pede confirmação. */
  async function reconectarPasta() {

    try {

      /* Eu recupero o endereço salvo. */
      const handle = await lerHandlePasta()
      if (!handle) return

      /* Eu peço a permissão (só funciona vindo de um clique). */
      const permissao = await pedirPermissaoDaPasta(handle)

      /* Eu carrego as músicas quando autorizado. */
      if (permissao === 'granted') {
        await integrarPasta(handle)
      } else {
        setAviso('A pasta ficou sem permissão de leitura — escolha outra pasta se quiser.')
      }

    } catch {
      setAviso('Não deu para reconectar a pasta.')
    }

  }


  /* =========================================== */
  /* INTERFACE DO FORMULÁRIO                     */
  /* =========================================== */

  /* Eu retorno a estrutura visual da área de envio. */
  return (
    <section className="secao-adicionar-musica">

      {/* Eu apresento a proposta da seção. */}
      <div className="cabecalho-secao">
        <h2>Suas músicas, do seu jeito</h2>
        <p>
          Arraste os arquivos ou clique para escolher. A música toca na hora,
          sem cadastro e sem enviar nada para a internet.
        </p>
      </div>

      {/* Eu crio o formulário de envio. */}
      <form onSubmit={processarEnvio} className="formulario-musica">

        {/* ================================= */}
        {/* ÁREA DE ARRASTAR E SOLTAR         */}
        {/* ================================= */}

        {/* Eu crio a zona larga para soltar arquivos. */}
        <div
          className={`area-solta ${arrastando ? 'arrastando' : ''}`}
          onClick={abrirSelecao}
          onDragOver={aoArrastar}
          onDragLeave={aoSairDaArea}
          onDrop={aoSoltar}
          role="button"
          tabIndex={0}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter') abrirSelecao()
          }}
        >

          {/* Eu mostro o ícone de envio. */}
          <span className="icone-solta">
            <IconeMais />
          </span>

          {/* Eu apresento as instruções. */}
          <strong>
            {arrastando ? 'Solte aqui as suas músicas!' : 'Arraste suas músicas aqui'}
          </strong>

          <small>
            ou clique para escolher · MP3, M4A, OGG, WAV · pode escolher várias de uma vez
          </small>

          {/* Eu escondo o campo real de arquivos. */}
          <input
            ref={inputArquivosRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={aoEscolherArquivos}
            hidden
          />

        </div>


        {/* ================================= */}
        {/* MODO PASTA (Chrome/Edge)          */}
        {/* ================================= */}

        {/* Eu ofereço o modo pasta para quem tem muitas músicas. */}
        {temModoPasta && (

          <div className="opcoes-formulario">

            {/* Eu crio o botão da pasta (conexão ou reconexão). */}
            <button
              type="button"
              className="botao-secundario botao-pasta"
              onClick={pastaReconectavel ? reconectarPasta : abrirPasta}
            >
              {pastaReconectavel
                ? '📁 Reconectar minha pasta de músicas'
                : '📁 Escolher pasta de músicas (sem copiar)'}
            </button>

            {/* Eu explico o que o modo pasta faz. */}
            <small>
              No Chrome/Edge a pasta conecta direto: não gasta espaço nem copia nada.
              Em outros navegadores, anexe os arquivos — eles ficam guardados no aparelho.
            </small>

          </div>

        )}


        {/* ================================= */}
        {/* LISTA DE ARQUIVOS ESCOLHIDOS      */}
        {/* ================================= */}

        {arquivos.length > 0 && (

          <ul className="lista-arquivos">
            {arquivos.map((arquivo, indice) => (

              <li key={`${arquivo.name}-${arquivo.size}`}>
                <IconeTocar />
                <span title={arquivo.name}>{arquivo.name}</span>

                {/* Eu permito remover um arquivo da lista. */}
                <button
                  type="button"
                  onClick={() => removerArquivo(indice)}
                  aria-label={`Remover ${arquivo.name}`}
                >
                  <IconeFechar />
                </button>
              </li>

            ))}
          </ul>

        )}


        {/* ================================= */}
        {/* CAMPOS OPCIONAIS                  */}
        {/* ================================= */}

        {/* Eu aviso que os campos valem para envio único. */}
        {arquivos.length === 1 && (

          <div className="campos-personalizacao">

            {/* Eu crio o campo de título. */}
            <div className="campo-form">
              <label htmlFor="titulo-musica">Título</label>
              <input
                id="titulo-musica"
                type="text"
                placeholder="Nome da música"
                value={titulo}
                onChange={(evento) => setTitulo(evento.target.value)}
              />
            </div>

            {/* Eu crio o campo de artista. */}
            <div className="campo-form">
              <label htmlFor="artista-musica">Artista ou banda</label>
              <input
                id="artista-musica"
                type="text"
                placeholder="Seu nome"
                value={artista}
                onChange={(evento) => setArtista(evento.target.value)}
              />
            </div>

            {/* Eu crio o campo da capa. */}
            <div className="campo-form">
              <label htmlFor="capa-musica">Capa (opcional)</label>
              <input
                id="capa-musica"
                type="file"
                accept="image/*"
                onChange={(evento) => setCapa(evento.target.files?.[0] ?? null)}
              />
            </div>

            {/* Eu crio o campo da letra. */}
            <div className="campo-form campo-letra">
              <label htmlFor="letra-musica">
                Letra da música (opcional)
              </label>
              <p className="ajuda-campo">
                Cole a letra para quem escutar acompanhar na tela. Sem
                internet? Sem problema: a letra fica guardada na música.
              </p>
              <textarea
                id="letra-musica"
                rows="6"
                placeholder="Cole aqui a letra completa…"
                value={letra}
                onChange={(evento) => setLetra(evento.target.value)}
              />
            </div>

          </div>

        )}

        {/* ================================= */}
        {/* GÊNERO (VALE PARA TODAS)         */}
        {/* ================================= */}

        {/* Eu ofereço o campo de gênero enquanto há arquivos. */}
        {arquivos.length > 0 && (

          <div className="campo-form">
            <label htmlFor="genero-musica">Gênero (opcional)</label>
            <input
              id="genero-musica"
              type="text"
              placeholder="Ex.: Rap, Sertanejo, Pop, MPB… vale para as escolhidas"
              value={genero}
              onChange={(evento) => setGenero(evento.target.value)}
            />
          </div>

        )}


        {/* ================================= */}
        {/* VENDA E APOIO (OPCIONAL)          */}
        {/* ================================= */}

        {/* Eu ofereço o canal de venda quando existem arquivos. */}
        {arquivos.length > 0 && (

          <div className="campos-venda">

            {/* Eu explico o recurso de venda. */}
            <div className="texto-venda">
              <h3>Quer vender ou receber apoio? (opcional)</h3>
              <p>
                Informe sua chave Pix ou o link da sua loja (Mercado Pago,
                Ko-fi, Hotmart…). O botão <strong>Comprar</strong> ou{' '}
                <strong>Apoiar</strong> aparece nas suas músicas para quem
                escutar.
              </p>
            </div>

            {/* Eu organizo os campos de venda. */}
            <div className="grade-venda">

              {/* Eu crio o campo do canal de pagamento. */}
              <div className="campo-form">
                <label htmlFor="apoio-musica">Chave Pix ou link de compra</label>
                <input
                  id="apoio-musica"
                  type="text"
                  placeholder="Ex: sua-chave@email.com ou https://…"
                  value={apoio}
                  onChange={(evento) => setApoio(evento.target.value)}
                />
              </div>

              {/* Eu crio o campo do preço. */}
              <div className="campo-form">
                <label htmlFor="preco-musica">Preço em reais (opcional)</label>
                <input
                  id="preco-musica"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 9,90"
                  value={preco}
                  onChange={(evento) => setPreco(evento.target.value)}
                />
              </div>

            </div>

          </div>

        )}

        {/* Eu mostro o aviso atual quando existir. */}
        {aviso && <p className="aviso-formulario">{aviso}</p>}


        {/* ================================= */}
        {/* BOTÃO DE ENVIO                    */}
        {/* ================================= */}

        {/* Eu crio o botão principal de envio. */}
        <button
          type="submit"
          className="botao-verde-grande botao-enviar"
          disabled={arquivos.length === 0}
        >
          <IconeTocar />
          {arquivos.length > 1
            ? `Adicionar ${arquivos.length} músicas à biblioteca`
            : 'Adicionar à minha biblioteca'}
        </button>

      </form>
    </section>
  )

}

/* Eu exporto o formulário para usar no App.jsx. */
export default AdicionarMusicaForm
