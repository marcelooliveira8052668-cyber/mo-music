/* ============================================= */
/* M.O MUSIC - FORMULÁRIO DE ADIÇÃO DE MÚSICA    */
/* ARQUIVO: src/AdicionarMusicaForm.jsx          */
/* ============================================= */

/* Eu importo os recursos do React. */
import { useState, useRef } from 'react'

/* Eu importo o leitor de metadados da biblioteca. */
import { lerMetadadosMusica } from './dados/musicas'

/* Eu importo o estado compartilhado da aplicação. */
import { useApp } from './contexto'

/* Eu importo os ícones do formulário. */
import { IconeMais, IconeFechar, IconeTocar } from './Icones'


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

  /* Eu controlo o destaque da área de arraste. */
  const [arrastando, setArrastando] = useState(false)

  /* Eu guardo mensagens de aviso para o usuário. */
  const [aviso, setAviso] = useState('')

  /* Eu crio a referência do campo de arquivos. */
  const inputArquivosRef = useRef(null)


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
      }

      /* Eu tento enriquecer o cadastro com os dados internos. */
      if (arquivos.length > 1) {
        try {
          const dados = await lerMetadadosMusica(urlAudio)
          if (dados.titulo) tituloFinal = dados.titulo
          if (dados.artista) artistaFinal = dados.artista
        } catch {
          /* Eu mantenho o nome do arquivo quando não há etiquetas. */
        }
      }

      /* Eu monto o cadastro completo. */
      novasMusicas.push({
        id: `anexada-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        titulo: tituloFinal,
        artista: artistaFinal,
        capa: capa ? URL.createObjectURL(capa) : null,
        audio: urlAudio,
        categoria: 'Do meu computador',

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
    setAviso('')

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
