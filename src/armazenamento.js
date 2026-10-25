/* ============================================= */
/* M.O MUSIC - ARMAZENAMENTO LOCAL DO NAVEGADOR  */
/* ARQUIVO: src/armazenamento.js                 */
/* ============================================= */

/* ============================================= */
/* BANCO DE DADOS (IndexedDB)                    */
/* ============================================= */

/* Eu uso o IndexedDB porque ele guarda arquivos grandes (Blob) por tempo
   indeterminado, diferente do localStorage que é só para textos curtos. */

/* Eu nomeio o banco com o prefixo do aplicativo. */
const NOME_BANCO = 'momusic-dados'

/* Eu fixo a versão inicial do banco. */
const VERSAO_BANCO = 1

/* Eu abro o banco de dados com uma promessa de resposta. */
function abrirBanco() {

  /* Eu devolvo uma promessa para o restante do app trabalhar com async. */
  return new Promise((resolve, reject) => {

    /* Eu peço ao navegador para abrir (ou criar) o banco. */
    const pedido = indexedDB.open(NOME_BANCO, VERSAO_BANCO)

    /* Eu preparo as lojas de dados na primeira criação. */
    pedido.onupgradeneeded = () => {

      /* Eu pego a referência do banco recém-aberto. */
      const banco = pedido.result

      /* Eu crio a loja das músicas anexadas (chave: id da música). */
      if (!banco.objectStoreNames.contains('anexadas')) {
        banco.createObjectStore('anexadas', { keyPath: 'id' })
      }

      /* Eu crio a loja de permissões (handle da pasta escolhida). */
      if (!banco.objectStoreNames.contains('chaves')) {
        banco.createObjectStore('chaves', { keyPath: 'chave' })
      }

    }

    /* Eu devolvo o banco quando estiver pronto. */
    pedido.onsuccess = () => resolve(pedido.result)

    /* Eu reporto a falha quando o navegador recusar o banco. */
    pedido.onerror = () => reject(pedido.error)

  })

}

/* Eu executo uma operação de escrita em uma loja. */
async function operarEscrita(loja, operacao) {

  /* Eu abro o banco. */
  const banco = await abrirBanco()

  /* Eu preparo a promessa que espera a transação terminar. */
  const resposta = new Promise((resolve, reject) => {

    /* Eu inicio a transação de escrita na loja pedida. */
    const transacao = banco.transaction(loja, 'readwrite')

    /* Eu pego a loja dentro da transação. */
    const armazem = transacao.objectStore(loja)

    /* Eu executo a operação pedida (put, delete ou clear). */
    const resultado = operacao(armazem)

    /* Eu resolvo quando a transação confirmar. */
    transacao.oncomplete = () => resolve(resultado?.result ?? null)

    /* Eu rejeito quando a transação falhar (ex.: espaço cheio). */
    transacao.onerror = () => reject(transacao.error)
    transacao.onabort = () => reject(transacao.error)

  })

  /* Eu aguardo a resposta e fecho o banco em seguida. */
  try {
    return await resposta
  } finally {
    banco.close()
  }

}

/* Eu executo uma operação de leitura em uma loja. */
async function operarLeitura(loja, operacao) {

  /* Eu abro o banco. */
  const banco = await abrirBanco()

  /* Eu preparo a promessa de leitura. */
  const resposta = new Promise((resolve, reject) => {

    /* Eu inicio a transação somente de leitura. */
    const transacao = banco.transaction(loja, 'readonly')

    /* Eu pego a loja dentro da transação. */
    const armazem = transacao.objectStore(loja)

    /* Eu disparo a leitura pedida. */
    const pedido = operacao(armazem)

    /* Eu devolvo o resultado quando chegar. */
    if (pedido) {
      pedido.onsuccess = () => resolve(pedido.result)
      pedido.onerror = () => reject(pedido.error)
    }

  })

  /* Eu aguardo a resposta e fecho o banco em seguida. */
  try {
    return await resposta
  } finally {
    banco.close()
  }

}


/* ============================================= */
/* MÚSICAS ANEXADAS (copia no navegador)         */
/* ============================================= */

/* Eu guardo uma música anexada com o seu arquivo de áudio. */
export async function salvarAnexada(registro) {

  /* Eu gravo o registro inteiro (metadados + Blob do áudio/capa). */
  return operarEscrita('anexadas', (armazem) => armazem.put(registro))

}

/* Eu recupero todas as músicas anexadas guardadas. */
export async function listarAnexadas() {

  /* Eu leio todos os registros da loja. */
  const registros = await operarLeitura('anexadas', (armazem) => armazem.getAll())

  /* Eu devolvo a lista ordenada pela data de anexação. */
  return (registros ?? []).sort((a, b) => (a.criadoEm ?? 0) - (b.criadoEm ?? 0))

}

/* Eu apago uma música anexada específica. */
export async function removerAnexada(id) {

  /* Eu deleto o registro pelo identificador. */
  return operarEscrita('anexadas', (armazem) => armazem.delete(id))

}


/* ============================================= */
/* MODO PASTA (File System Access API)           */
/* ============================================= */

/* Eu confirmo se o navegador permite escolher pastas direto (Chrome/Edge). */
export function suportaPasta() {

  /* Eu verifico a existência da API no navegador atual. */
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window

}

/* Eu abro a janelinha de escolha de pasta. */
export async function escolherPasta() {

  /* Eu peço a pasta em modo leitura, com id fixo para o navegador
     lembrar a permissão quando o usuário marcar "permitir sempre". */
  return window.showDirectoryPicker({ mode: 'read', id: 'momusic-pastas' })

}

/* Eu guardo o endereço (handle) da pasta escolhida. */
export async function salvarHandlePasta(handle) {

  /* Eu gravo o handle — ele é serializável e sobrevive ao fechamento. */
  return operarEscrita('chaves', (armazem) =>
    armazem.put({ chave: 'pasta', handle }))

}

/* Eu recupero o endereço da pasta salva, se houver. */
export async function lerHandlePasta() {

  /* Eu leio o registro salvo. */
  const registro = await operarLeitura('chaves', (armazem) => armazem.get('pasta'))

  /* Eu devolvo apenas o handle quando existir. */
  return registro?.handle ?? null

}

/* Eu apago a pasta salva (para trocar de pasta). */
export async function apagarHandlePasta() {

  /* Eu deleto o registro da pasta. */
  return operarEscrita('chaves', (armazem) => armazem.delete('pasta'))

}

/* Eu pergunto se ainda temos permissão de leitura na pasta. */
export function permissaoDaPasta(handle) {

  /* Eu consulto a permissão atual do navegador. */
  return handle.queryPermission({ mode: 'read' })

}

/* Eu solicito a permissão de leitura (precisa vir de um clique). */
export function pedirPermissaoDaPasta(handle) {

  /* Eu disparo o pedido de permissão do navegador. */
  return handle.requestPermission({ mode: 'read' })

}

/* Eu confirmo se o nome parece um arquivo de música. */
function ehAudioNome(nome) {

  /* Eu aceito as extensões mais comuns de áudio. */
  return /\.(mp3|m4a|ogg|wav|flac|aac)$/i.test(nome)

}

/* Eu percorro a pasta (e subpastas) guardando os arquivos de áudio. */
async function percorrerDiretorio(diretorio, arquivos, nivel) {

  /* Eu limito a profundidade para não percorrer o disco inteiro. */
  if (nivel > 3) return

  /* Eu percorro cada entrada da pasta atual. */
  for await (const entrada of diretorio.values()) {

    /* Eu filtro os arquivos de áudio. */
    if (entrada.kind === 'file' && ehAudioNome(entrada.name)) {

      /* Eu transformo o arquivo em um objeto File utilizável. */
      arquivos.push(await entrada.getFile())

    } else if (entrada.kind === 'directory') {

      /* Eu desço para a subpasta encontrada. */
      await percorrerDiretorio(entrada, arquivos, nivel + 1)

    }

  }

}

/* Eu coleciono todos os áudios da pasta escolhida. */
export async function colecionarAudiosDaPasta(raiz) {

  /* Eu preparo a lista de arquivos. */
  const arquivos = []

  /* Eu percorro a pasta de cima. */
  await percorrerDiretorio(raiz, arquivos, 0)

  /* Eu devolvo os arquivos em ordem alfabética para uma lista previsível. */
  return arquivos.sort((a, b) => a.name.localeCompare(b.name))

}


/* ============================================= */
/* ESPAÇO DO NAVEGADOR                           */
/* ============================================= */

/* Eu peço ao navegador para não apagar o armazenamento automaticamente. */
export function solicitarPermanencia() {

  /* Eu disparo o pedido sem bloquear (nem todo navegador atende). */
  try {
    navigator.storage?.persist?.()
  } catch {
    /* Eu sigo sem problema quando a API não existe. */
  }

}

/* Eu confiro se cabe o total de bytes informado. */
export async function verificarEspaco(bytesNecessarios) {

  /* Eu leio o uso atual do armazenamento do site. */
  const estimativa = await navigator.storage?.estimate?.()

  /* Eu trato navegadores sem a API como espaço suficiente. */
  if (!estimativa?.quota) return { suficiente: true }

  /* Eu calculo o espaço ainda livre. */
  const livre = estimativa.quota - (estimativa.usage ?? 0)

  /* Eu devolvo o veredito com os números para o aviso. */
  return { suficiente: livre >= bytesNecessarios, livre }

}
