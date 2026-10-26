/* ============================================= */
/* M.O MUSIC - CAPAS PELA INTERNET               */
/* ARQUIVO: src/capas.js                         */
/* ============================================= */

/*
 * Quando uma música não tem imagem embutida no arquivo, eu procuro a
 * capa na internet pela iTunes Search API: é gratuita, não pede chave
 * e libera o uso direto do navegador (Access-Control-Allow-Origin: *).
 *
 * Regras desta busca:
 *  - cada capa é procurada UMA vez só e fica guardada no navegador;
 *  - sem internet o app continua normalmente (mantém o degradê);
 *  - a fila limita as requisições simultâneas para não pesar;
 *  - só guardamos o resultado quando o título e o artista batem.
 */

/* Eu importo a leitura e gravação seguras do navegador. */
import { lerArmazenamento, guardarArmazenamento } from './utilitarios'

/* Eu identifico o cache das capas no armazenamento. */
const CHAVE_CACHE = 'capasInternet'

/* Eu limito o tamanho do cache para não ocupar espaço demais. */
const LIMITE_CACHE = 800

/* Eu carrego as capas já descobertas em visitas anteriores. */
let cache = lerArmazenamento(CHAVE_CACHE, {}) || {}

/* Eu anoto as buscas em andamento para não repetir a mesma música. */
const emAndamento = new Map()

/* Eu anoto as músicas que já sabemos não ter capa nesta sessão. */
const semCapa = new Set()

/* Eu guardo se a rede respondeu bem alguma vez nesta sessão. */
let redeFuncionou = false

/* Eu paro novas buscas quando a internet cai de verdade. */
let redeCaiu = false
let falhasSeguidas = 0

/* Eu preparo a fila de espera com limite de conexões. */
const FILA = []
let emUso = 0
const LIMITE_SIMULTANEAS = 4


/* ============================================= */
/* COMPARAÇÃO DE TEXTOS                          */
/* ============================================= */

/* Eu normalizo um texto para comparar sem acento, caixa ou pontuação. */
function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* Eu monto a chave de cache da música (artista + título). */
function chaveDe(musica) {
  return `${normalizar(musica?.artista)}|${normalizar(musica?.titulo)}`
}


/* ============================================= */
/* ESCOLHA DO MELHOR RESULTADO                   */
/* ============================================= */

/* Eu converto a capa pequena da iTunes na versão grande (600px). */
function capaGrande(endereco) {
  if (typeof endereco !== 'string') return null
  return endereco.replace(/\/\d+x\d+bb\.jpg/, '/600x600bb.jpg')
}

/* Eu escolho o resultado que mais parece com a música pedida. */
function escolherCapa(resultados, musica) {

  /* Eu preparo os textos de comparação. */
  const titulo = normalizar(musica.titulo)
  const artista = normalizar(musica.artista)

  /* Eu preparo o melhor candidato. */
  let melhor = null
  let melhorNota = 0

  /* Eu analiso cada faixa devolvida pela iTunes. */
  for (const item of Array.isArray(resultados) ? resultados : []) {

    /* Eu ignoro itens sem título. */
    const tituloItem = normalizar(item?.trackName)
    if (!tituloItem) continue

    /* Eu começo a pontuação do candidato. */
    let nota = 0

    /* Eu pontuo a proximidade do título. */
    if (tituloItem === titulo) nota += 3
    else if (tituloItem.includes(titulo) || titulo.includes(tituloItem)) nota += 2

    /* Eu pontuo a proximidade do artista. */
    const artistaItem = normalizar(item?.artistName)
    if (artistaItem && artista) {
      if (artistaItem === artista) nota += 3
      else if (artistaItem.includes(artista) || artista.includes(artistaItem)) nota += 2
    }

    /* Eu guardo o candidato mais forte. */
    if (nota > melhorNota) {
      melhorNota = nota
      melhor = item
    }

  }

  /* Eu só aceito quando título e artista combinam bem (nota >= 4). */
  if (!melhor || melhorNota < 4) return null

  /* Eu devolvo o endereço da capa em boa resolução. */
  return capaGrande(melhor.artworkUrl100)

}


/* ============================================= */
/* REQUISIÇÕES                                   */
/* ============================================= */

/* Eu consulto a iTunes Search em um país específico. */
async function procurarNoPais(musica, pais) {

  /* Eu monto o termo de busca com artista e título. */
  const termo = `${musica.artista || ''} ${musica.titulo || ''}`.trim()

  /* Eu encerro cedo quando faltam dados para buscar. */
  if (!musica.titulo || !termo) return null

  /* Eu preparo o endereço da API. */
  const endereco =
    'https://itunes.apple.com/search' +
    `?term=${encodeURIComponent(termo)}` +
    '&entity=song&media=music&limit=12' +
    (pais ? `&country=${pais}` : '')

  /* Eu preparo o cancelamento para não prender a interface. */
  const controlador = new AbortController()
  const limite = setTimeout(() => controlador.abort(), 9000)

  try {

    /* Eu faço a consulta liberada para o navegador. */
    const resposta = await fetch(endereco, { signal: controlador.signal })

    /* Eu aviso que a internet respondeu. */
    redeFuncionou = true
    falhasSeguidas = 0

    /* Eu desisto quando a API devolve erro. */
    if (!resposta.ok) return null

    /* Eu leio os resultados em JSON. */
    const dados = await resposta.json()

    /* Eu escolho o melhor item e devolvo a capa. */
    return escolherCapa(dados?.results, musica)

  } catch (erro) {

    /* Eu conto a falha de rede para parar insistindo. */
    falhasSeguidas += 1
    if (falhasSeguidas >= 3) redeCaiu = true

    /* Eu sigo sem capa quando não há internet. */
    return null

  } finally {
    clearTimeout(limite)
  }

}

/* Eu busco a capa tentando a loja brasileira e depois a americana. */
async function executarBusca(musica, chave) {

  /* Eu devolvo a capa já conhecida sem consultar a rede. */
  const conhecida = cache[chave]
  if (conhecida) return conhecida

  /* Eu devolvo vazio quando a rede caiu nesta sessão. */
  if (redeCaiu) return null

  /* Eu consulto primeiro a loja do Brasil (biblioteca brasileira). */
  const capa = (await procurarNoPais(musica, 'BR')) || (await procurarNoPais(musica, 'US'))

  /* Eu guardo quando encontramos uma capa confiável. */
  if (capa) {

    /* Eu atualizo a memória. */
    cache[chave] = capa

    /* Eu descarto as entradas mais antigas quando o cache cresce. */
    const chaves = Object.keys(cache)
    if (chaves.length > LIMITE_CACHE) {
      cache = Object.fromEntries(chaves.slice(-LIMITE_CACHE).map((chaveCache) => [chaveCache, cache[chaveCache]]))
    }

    /* Eu gravo no navegador para não buscar de novo. */
    guardarArmazenamento(CHAVE_CACHE, cache)

    /* Eu devolvo o endereço da capa. */
    return capa

  }

  /* Eu marco a ausência quando a rede funcionou e não achou nada. */
  if (redeFuncionou) {
    semCapa.add(chave)
    cache[chave] = ''
    guardarArmazenamento(CHAVE_CACHE, cache)
  }

  /* Eu devolvo vazio para o app manter o degradê. */
  return null

}


/* ============================================= */
/* FILA COM LIMITE DE CONEXÕES                   */
/* ============================================= */

/* Eu coloco uma tarefa na fila de busca. */
function enfileirar(tarefa) {
  return new Promise((resolver, rejeitar) => {
    FILA.push({ tarefa, resolver, rejeitar })
    processarFila()
  })
}

/* Eu libero as vagas da fila enquanto existir trabalho. */
function processarFila() {

  /* Eu atendo até o limite de conexões simultâneas. */
  while (emUso < LIMITE_SIMULTANEAS && FILA.length > 0) {

    /* Eu pego a próxima tarefa da fila. */
    const { tarefa, resolver, rejeitar } = FILA.shift()

    /* Eu ocupo uma vaga. */
    emUso += 1

    /* Eu executo e devolvo a vaga quando termina. */
    tarefa()
      .then(resolver, rejeitar)
      .finally(() => {
        emUso -= 1
        processarFila()
      })

  }

}


/* ============================================= */
/* API USADA PELOS COMPONENTES                   */
/* ============================================= */

/* Eu devolvo a capa já descoberta sem sair da memória (ou null). */
export function capaConhecida(musica) {
  const valor = cache[chaveDe(musica)]
  return valor ? valor : null
}

/* Eu busco a capa de uma música: promessa única, sem repetição. */
export function buscarCapa(musica) {

  /* Eu preparo a chave desta faixa. */
  const chave = chaveDe(musica)

  /* Eu devolvo o resultado guardado imediatamente (capa ou "sem capa"). */
  if (Object.prototype.hasOwnProperty.call(cache, chave)) {
    return Promise.resolve(cache[chave] || null)
  }

  /* Eu devolvo vazio quando já procuramos nesta sessão. */
  if (semCapa.has(chave)) return Promise.resolve(null)

  /* Eu reaproveito a busca que já está em andamento. */
  if (emAndamento.has(chave)) return emAndamento.get(chave)

  /* Eu preparo a promessa desta busca. */
  const promessa = enfileirar(() => executarBusca(musica, chave))

  /* Eu anoto a busca para não duplicar. */
  emAndamento.set(chave, promessa)

  /* Eu libero o registro quando a busca termina. */
  promessa.finally(() => emAndamento.delete(chave))

  /* Eu devolvo a promessa para quem chamou. */
  return promessa

}
