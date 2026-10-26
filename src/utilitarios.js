/* ============================================= */
/* M.O MUSIC - UTILITÁRIOS COMPARTILHADOS        */
/* ARQUIVO: src/utilitarios.js                   */
/* ============================================= */

/* Eu importo a identidade configurável da plataforma. */
import { NOME_PLATAFORMA, NOME_CURTO, ARTISTA } from './configuracao'

/* Eu defino o prefixo das chaves para não colidir com outros sites. */
const PREFIXO = 'momusic:'

/* Eu organizo as chaves usadas no armazenamento do navegador. */
export const CHAVES = {
  favoritas: 'favoritas',
  playlists: 'playlists',
  historico: 'historico',
  tocagens: 'tocagens',
  volume: 'volume',
  aleatorio: 'aleatorio',
  repetir: 'repetir',
  painelLetra: 'painelLetra',
  buscarCapas: 'buscarCapas'
}


/* ============================================= */
/* ARMAZENAMENTO DO NAVEGADOR                    */
/* ============================================= */

/* Eu leio um valor salvo no navegador com segurança. */
export function lerArmazenamento(chave, padrao) {

  try {

    /* Eu busco o valor salvo com o prefixo da M.O Music. */
    const guardado = localStorage.getItem(PREFIXO + chave)

    /* Eu devolvo o padrão quando nunca foi salvo. */
    if (guardado === null) return padrao

    /* Eu converto o texto salvo de volta para JavaScript. */
    return JSON.parse(guardado)

  } catch {

    /* Eu devolvo o padrão se o navegador bloquear a leitura. */
    return padrao

  }

}

/* Eu salvo um valor no navegador sem quebrar a aplicação. */
export function guardarArmazenamento(chave, valor) {

  try {

    /* Eu converto o valor em texto e gravo na chave. */
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor))

  } catch {

    /* Eu ignoro erros de armazenamento cheio ou bloqueado. */
    /* O aplicativo continua funcionando sem persistência. */

  }

}


/* ============================================= */
/* FORMATAÇÃO                                    */
/* ============================================= */

/* Eu formato segundos no padrão minutos:segundos. */
export function formatarTempo(segundos) {

  /* Eu evito valores inválidos ou negativos. */
  if (!Number.isFinite(segundos) || segundos < 0) return '0:00'

  /* Eu calculo os minutos completos. */
  const minutos = Math.floor(segundos / 60)

  /* Eu calculo os segundos restantes. */
  const resto = Math.floor(segundos % 60)

  /* Eu devolvo o tempo com dois dígitos nos segundos. */
  return `${minutos}:${String(resto).padStart(2, '0')}`

}


/* ============================================= */
/* CORES DERIVADAS DO CONTEÚDO                   */
/* ============================================= */

/* Eu transformo um texto em um número de matiz estável. */
export function matizDeTexto(texto) {

  /* Eu preparo o acumulador do cálculo. */
  let hash = 0

  /* Eu percorro cada caractere do texto. */
  for (let i = 0; i < texto.length; i++) {

    /* Eu misturo o caractere no acumulador. */
    hash = (hash * 31 + texto.charCodeAt(i)) % 360000

  }

  /* Eu devolvo uma matiz entre 0 e 359 graus. */
  return Math.abs(hash) % 360

}

/* Eu crio o estilo de degradê único de cada conteúdo. */
export function estiloDeGradiente(texto) {

  /* Eu devolvo a variável CSS usada pelo degradê. */
  return { '--matiz': String(matizDeTexto(texto || NOME_CURTO)) }

}


/* ============================================= */
/* PROPRIEDADE DAS MÚSICAS ANEXADAS              */
/* ============================================= */

/* Eu verifico se a música foi anexada por quem está usando este aparelho.
   Só o dono vê e usa o botão de excluir: quem recebe o link do site
   participa ouvindo e comprando, mas não apaga nada de mais ninguém. */
export function ehAnexadaMinha(musica) {

  /* Eu reconheço o dono pela marca anexada- no identificador. */
  return typeof musica?.id === 'string' && musica.id.startsWith('anexada-')

}


/* ============================================= */
/* SAUDAÇÃO DA TELA INICIAL                      */
/* ============================================= */

/* Eu crio uma saudação de acordo com o horário do usuário. */
export function saudacaoDoDia() {

  /* Eu descubro a hora atual do computador. */
  const hora = new Date().getHours()

  /* Eu escolho a saudação adequada ao período. */
  if (hora < 6) return 'Boa madrugada'
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  if (hora < 22) return 'Boa noite'

  /* Eu volto à madrugada após as 22 horas. */
  return 'Boa noite'

}


/* ============================================= */
/* COMPARTILHAMENTO COM AMIGOS                   */
/* ============================================= */

/* Eu descubro a extensão real de um endereço de áudio. */
function descobrirExtensao(endereco, tipoBlob) {

  /* Eu procuro extensões conhecidas no caminho. */
  const conhecida = /\.(mp3|m4a|ogg|wav|flac|aac)$/i.exec(endereco || '')

  /* Eu devolvo a extensão encontrada. */
  if (conhecida) return conhecida[1].toLowerCase()

  /* Eu adivinho pelo tipo do arquivo quando for blob. */
  if (tipoBlob?.includes('mp4')) return 'm4a'
  if (tipoBlob?.includes('ogg')) return 'ogg'
  if (tipoBlob?.includes('wav')) return 'wav'

  /* Eu uso MP3 como padrão. */
  return 'mp3'

}

/* Eu comparto a música com amigos usando o celular ou o computador. */
export function linkPaginaArtista(musicaId) {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  if (musicaId) url.searchParams.set('musica', musicaId)
  return url.href
}

async function compartilharLink(titulo, texto, url) {
  try {
    if (navigator.share) {
      await navigator.share({ title: titulo, text: texto, url })
      return 'texto'
    }
    await navigator.clipboard.writeText(`${texto} ${url}`)
    return 'copiado'
  } catch (erro) {
    if (erro?.name === 'AbortError') return 'cancelado'
    try {
      await navigator.clipboard.writeText(`${texto} ${url}`)
      return 'copiado'
    } catch {
      return 'erro'
    }
  }
}

export function compartilharPaginaArtista() {
  return compartilharLink(ARTISTA.nome, `Conheça as músicas de ${ARTISTA.nome} no ${NOME_PLATAFORMA}.`, linkPaginaArtista())
}

export async function compartilharMusica(musica) {

  /* Eu preparo a mensagem de divulgação. */
  const texto = `Ouça "${musica.titulo}" de ${musica.artista} — descobri no ${NOME_PLATAFORMA}`

  /* Faixas públicas compartilham o link, sem baixar ou enviar o áudio inteiro. */
  if (musica.publicada) {
    return compartilharLink(musica.titulo, texto, linkPaginaArtista(musica.id))
  }

  /* Eu preparo o link do site quando existir. */
  const link =
    typeof window !== 'undefined' && window.location
      ? window.location.href
      : ''

  try {

    /* ========================================= */
    /* MELHOR CASO: ENVIAR O ARQUIRO DA MÚSICA   */
    /* ========================================= */

    /* Eu verifico se o navegador aceita enviar arquivos. */
    if (musica.audio && typeof navigator !== 'undefined' && navigator.share) {

      try {

        /* Eu baixo o áudio da memória do navegador. */
        const resposta = await fetch(musica.audio)
        const blob = await resposta.blob()

        /* Eu descubro a extensão correta do arquivo. */
        const extensao = descobrirExtensao(musica.audio, blob.type)

        /* Eu monto um nome amigável para o arquivo. */
        const nomeArquivo =
          `${musica.titulo} - ${musica.artista}.${extensao}`.replace(
            /[\\/:*?"<>|]/g,
            '-'
          )

        /* Eu preparo o arquivo para o menu de compartilhamento. */
        const arquivo = new File([blob], nomeArquivo, {
          type: blob.type || 'audio/mpeg'
        })

        /* Eu verifico se o dispositivo aceita este arquivo. */
        if (navigator.canShare?.({ files: [arquivo] })) {

          /* Eu abro o menu de compartilhamento do sistema. */
          await navigator.share({
            files: [arquivo],
            title: musica.titulo,
            text: texto
          })

          /* Eu informo que o arquivo foi enviado. */
          return 'arquivo'

        }

      } catch (erro) {

        /* Eu ignoro cancelamentos e tento o próximo método. */
        if (erro?.name === 'AbortError') return 'cancelado'

      }

    }

    /* ========================================= */
    /* SEGUNDO CASO: LINK E MENSAGEM             */
    /* ========================================= */

    /* Eu verifico se existe o menu de compartilhamento simples. */
    if (typeof navigator !== 'undefined' && navigator.share) {

      /* Eu compartilho apenas o texto com o link. */
      await navigator.share({
        title: musica.titulo,
        text: `${texto} ${link}`
      })

      /* Eu informo que o link foi enviado. */
      return 'texto'

    }

    /* ========================================= */
    /* ÚLTIMO CASO: COPIAR PARA A ÁREA DE TRANSFERÊNCIA */
    /* ========================================= */

    /* Eu copio a divulgação para o usuário colar. */
    await navigator.clipboard.writeText(`${texto} ${link}`)

    /* Eu informo que o texto foi copiado. */
    return 'copiado'

  } catch (erro) {

    /* Eu trato o cancelamento do usuário. */
    if (erro?.name === 'AbortError') return 'cancelado'

    try {

      /* Eu tento copiar como última alternativa. */
      await navigator.clipboard.writeText(`${texto} ${link}`)
      return 'copiado'

    } catch {

      /* Eu devolvo erro quando o navegador bloqueia tudo. */
      return 'erro'

    }

  }

}
