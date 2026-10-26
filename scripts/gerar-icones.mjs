/* ============================================= */
/* M.O MUSIC - GERAÇÃO DOS ÍCONES DO APP (PWA)    */
/* ARQUIVO: scripts/gerar-icones.mjs             */
/* ============================================= */

/*
 * Eu gero os ícones PNG usados pelo aplicativo instalável (manifest e
 * iOS) direto da identidade da marca: degradê verde → ciano → violeta
 * com as barrinhas do equalizador em branco.
 *
 * Uso:  node scripts/gerar-icones.mjs
 *
 * Sem dependências externas: o PNG é montado na mão com zlib.
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/* Eu descubro a pasta do projeto. */
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const pastaPublic = join(raiz, 'public')


/* ============================================= */
/* CORES DA MARCA                               */
/* ============================================= */

/* Eu defino os três pontos do degradê da identidade. */
const CORES = [
  [0.0, [30, 215, 96]],   /* verde  #1ed760 */
  [0.55, [52, 224, 232]], /* ciano  #34e0e8 */
  [1.0, [124, 92, 255]]   /* violeta #7c5cff */
]

/* Eu calculo a cor do degradê em um ponto (0 a 1). */
function corDoDegradê(t) {
  const ponto = Math.min(1, Math.max(0, t))

  for (let i = 1; i < CORES.length; i++) {
    const [tFim, corFim] = CORES[i]
    if (ponto <= tFim) {
      const [tInicio, corInicio] = CORES[i - 1]
      const peso = (ponto - tInicio) / (tFim - tInicio)
      return corInicio.map((canal, indice) => canal + (corFim[indice] - canal) * peso)
    }
  }

  return CORES[CORES.length - 1][1]
}


/* ============================================= */
/* FORMAS                                       */
/* ============================================= */

/* Eu calculo a distância (com sinal) de um ponto até um retângulo arredondado. */
function distanciaRetangulo(px, py, cx, cy, largura, altura, raio) {
  const metade = Math.max(0.0001, raio)
  const dx = Math.abs(px - cx) - (largura / 2 - metade)
  const dy = Math.abs(py - cy) - (altura / 2 - metade)
  const ax = Math.max(dx, 0)
  const ay = Math.max(dy, 0)
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0) - metade
}

/* Eu converto a distância em cobertura suave (antisserrilhado). */
function cobertura(distancia) {
  return Math.min(1, Math.max(0, 0.5 - distancia))
}


/* ============================================= */
/* DESENHO                                       */
/* ============================================= */

/* Eu desenho um ícone num buffer RGBA já na escala pedida. */
function desenhar(tamanho, { cantosArredondados = true, escalaBarras = 1 } = {}) {

  /* Eu preparo o buffer RGBA. */
  const pixels = Buffer.alloc(tamanho * tamanho * 4)

  /* Eu defino o raio dos cantos do fundo. */
  const raioFundo = cantosArredondados ? tamanho * 0.22 : 0

  /* Eu preparo as quatro barrinhas do equalizador. */
  const larguraBarra = tamanho * 0.09 * escalaBarras
  const espaco = tamanho * 0.055 * escalaBarras
  const larguraTotal = larguraBarra * 4 + espaco * 3
  const inicioX = (tamanho - larguraTotal) / 2
  const alturas = [0.3, 0.46, 0.38, 0.52].map((altura) => altura * tamanho * escalaBarras)

  /* Eu percorro cada pixel da imagem. */
  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {

      /* Eu calculo a posição do pixel no centro do subpixel. */
      const px = x + 0.5
      const py = y + 0.5

      /* Eu calculo a cobertura do fundo arredondado. */
      const fundo = cantosArredondados
        ? cobertura(distanciaRetangulo(px, py, tamanho / 2, tamanho / 2, tamanho, tamanho, raioFundo))
        : 1

      /* Eu escolho a cor do degradê na diagonal. */
      const [r, g, b] = corDoDegradê((px / tamanho + py / tamanho) / 2)

      /* Eu começo com o degradê do fundo. */
      let vermelho = r
      let verde = g
      let azul = b
      let alpha = fundo * 255

      /* Eu aplico as barrinhas brancas em cima do fundo. */
      let barra = 0
      for (let i = 0; i < 4; i++) {
        const centroX = inicioX + i * (larguraBarra + espaco) + larguraBarra / 2
        const altura = alturas[i]
        const distancia = distanciaRetangulo(px, py, centroX, tamanho / 2, larguraBarra, altura, larguraBarra / 2)
        barra = Math.max(barra, cobertura(distancia))
      }

      /* Eu misturo o branco das barras sobre o degradê. */
      const peso = barra * fundo
      vermelho = vermelho + (255 - vermelho) * peso
      verde = verde + (255 - verde) * peso
      azul = azul + (255 - azul) * peso

      /* Eu gravo o pixel no buffer. */
      const deslocamento = (y * tamanho + x) * 4
      pixels[deslocamento] = Math.round(vermelho)
      pixels[deslocamento + 1] = Math.round(verde)
      pixels[deslocamento + 2] = Math.round(azul)
      pixels[deslocamento + 3] = Math.round(alpha)

    }
  }

  return pixels
}

/* Eu desenho em alta resolução e reduzo para ter bordas suaves. */
function desenharComAntisserrilhado(tamanho, opcoes) {

  /* Eu renderizo em 4 vezes o tamanho. */
  const fator = 4
  const alto = tamanho * fator
  const pixelsAltos = desenhar(alto, opcoes)

  /* Eu preparo a imagem final. */
  const pixels = Buffer.alloc(tamanho * tamanho * 4)

  /* Eu reduzo fazendo a média de cada bloco. */
  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {

      let r = 0
      let g = 0
      let b = 0
      let a = 0

      for (let fy = 0; fy < fator; fy++) {
        for (let fx = 0; fx < fator; fx++) {
          const deslocamento = (((y * fator + fy) * alto) + (x * fator + fx)) * 4
          r += pixelsAltos[deslocamento]
          g += pixelsAltos[deslocamento + 1]
          b += pixelsAltos[deslocamento + 2]
          a += pixelsAltos[deslocamento + 3]
        }
      }

      const total = fator * fator
      const deslocamento = (y * tamanho + x) * 4
      pixels[deslocamento] = Math.round(r / total)
      pixels[deslocamento + 1] = Math.round(g / total)
      pixels[deslocamento + 2] = Math.round(b / total)
      pixels[deslocamento + 3] = Math.round(a / total)

    }
  }

  return pixels
}


/* ============================================= */
/* MONTAGEM DO PNG                               */
/* ============================================= */

/* Eu monto a tabela de verificação do CRC. */
const TABELA_CRC = (() => {
  const tabela = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabela[n] = c >>> 0
  }
  return tabela
})()

/* Eu calculo o CRC de um buffer. */
function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i++) c = TABELA_CRC[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/* Eu monto um bloco do PNG (tamanho + tipo + dados + CRC). */
function bloco(tipo, dados) {
  const nome = Buffer.from(tipo, 'ascii')
  const corpo = Buffer.concat([nome, dados])
  const tamanho = Buffer.alloc(4)
  tamanho.writeUInt32BE(dados.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(corpo), 0)
  return Buffer.concat([tamanho, corpo, crc])
}

/* Eu escrevo o arquivo PNG completo. */
function gravarPng(caminho, tamanho, pixels) {

  /* Eu assino o formato PNG. */
  const assinatura = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  /* Eu declaro largura, altura e cor RGBA. */
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(tamanho, 0)
  ihdr.writeUInt32BE(tamanho, 4)
  ihdr[8] = 8   /* bits por canal */
  ihdr[9] = 6   /* RGBA */
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  /* Eu preparo os dados com o filtro de cada linha. */
  const linhas = Buffer.alloc((tamanho * 4 + 1) * tamanho)
  for (let y = 0; y < tamanho; y++) {
    const inicio = y * (tamanho * 4 + 1)
    linhas[inicio] = 0
    pixels.copy(linhas, inicio + 1, y * tamanho * 4, (y + 1) * tamanho * 4)
  }

  /* Eu compacto os pixels. */
  const idat = deflateSync(linhas, { level: 9 })

  /* Eu gravo os blocos na ordem correta. */
  writeFileSync(caminho, Buffer.concat([
    assinatura,
    bloco('IHDR', ihdr),
    bloco('IDAT', idat),
    bloco('IEND', Buffer.alloc(0))
  ]))

}


/* ============================================= */
/* GERAÇÃO                                       */
/* ============================================= */

/* Eu crio a pasta public caso ainda não exista. */
mkdirSync(pastaPublic, { recursive: true })

/* Eu gero cada tamanho exigido pelas lojas e navegadores. */
const arquivos = [
  /* Ícone comum do Android, Chrome e Windows. */
  { nome: 'icon-192.png', tamanho: 192, opcoes: { cantosArredondados: true } },

  /* Ícone grande do manifest e da tela de instalação. */
  { nome: 'icon-512.png', tamanho: 512, opcoes: { cantosArredondados: true } },

  /* Versão de tela cheia para o Android recortar (zona segura). */
  { nome: 'icon-maskable-512.png', tamanho: 512, opcoes: { cantosArredondados: false, escalaBarras: 0.72 } },

  /* Ícone da tela inicial do iPhone e do iPad. */
  { nome: 'apple-touch-icon.png', tamanho: 180, opcoes: { cantosArredondados: false, escalaBarras: 0.82 } }
]

/* Eu monto e gravo cada arquivo. */
for (const arquivo of arquivos) {
  const caminho = join(pastaPublic, arquivo.nome)
  const pixels = desenharComAntisserrilhado(arquivo.tamanho, arquivo.opcoes)
  gravarPng(caminho, arquivo.tamanho, pixels)
  console.log(`ok  ${arquivo.nome} (${arquivo.tamanho}x${arquivo.tamanho})`)
}
