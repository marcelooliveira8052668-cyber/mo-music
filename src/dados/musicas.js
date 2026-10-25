
/* ============================================= */
/* M.O MUSIC - BIBLIOTECA MUSICAL                */
/* ARQUIVO: src/dados/musicas.js                 */
/* ============================================= */

/* Eu importo a versão da biblioteca preparada para o navegador. */
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js'

/* Eu importo as faixas de demonstração liberadas para publicação. */
import { musicasDemonstracao } from './demonstracao'


/* ============================================= */
/* LEITURA DOS METADADOS MUSICAIS                */
/* ============================================= */

/* Eu crio uma função assíncrona para ler as informações de um áudio. */
export async function lerMetadadosMusica(urlAudio) {

  /* Eu preparo valores vazios para quando não houver metadados. */
  const dadosVazios = {
    titulo: null,
    artista: null,
    album: null
  }

  /* Eu tento carregar e analisar o arquivo musical. */
  try {

    /* Eu solicito o áudio ao servidor do Vite. */
    const resposta = await fetch(urlAudio)

    /* Eu verifico se o servidor encontrou o arquivo. */
    if (!resposta.ok) {

      /* Eu interrompo a leitura quando ocorre um erro HTTP. */
      throw new Error('Não foi possível carregar o arquivo musical.')

    }

    /* Eu converto a resposta em dados binários. */
    const arquivo = await resposta.blob()

    /* Eu aguardo a leitura dos metadados. */
    return await new Promise((resolve) => {

      /* Eu solicito à biblioteca que analise o arquivo. */
      jsmediatags.read(arquivo, {

        /* Eu recebo as informações quando a leitura funciona. */
        onSuccess: (resultado) => {

          /* Eu obtenho as informações musicais encontradas. */
          const tags = resultado.tags

          /* Eu devolvo as informações ao React. */
          resolve({
            titulo: tags.title || null,
            artista: tags.artist || null,
            album: tags.album || null
          })

        },

        /* Eu trato possíveis erros da biblioteca. */
        onError: (erro) => {

          /* Eu mostro um aviso sem interromper a aplicação. */
          console.warn('Não consegui ler os metadados:', erro)

          /* Eu devolvo os valores vazios. */
          resolve(dadosVazios)

        }

      })

    })

  } catch (erro) {

    /* Eu registro um aviso caso não consiga carregar o arquivo. */
    console.warn('Erro ao carregar o áudio:', erro)

    /* Eu mantenho a aplicação funcionando mesmo com erro. */
    return dadosVazios

  }

}


/* ============================================= */
/* IDENTIFICAÇÃO AUTOMÁTICA DOS ARQUIVOS         */
/* ============================================= */

/* Eu localizo os arquivos musicais na pasta do projeto. */
const arquivosDeAudio = import.meta.glob(
  '../assets/musicas/*.{mp3,m4a,ogg,wav}',
  {
    /* Eu carrego os caminhos dos arquivos imediatamente. */
    eager: true,

    /* Eu solicito as URLs dos arquivos. */
    query: '?url',

    /* Eu importo diretamente o endereço de cada áudio. */
    import: 'default'
  }
)

/* ============================================= */
/* ORGANIZAÇÃO DOS NOMES DAS MÚSICAS             */
/* ============================================= */

/* Eu crio uma função para identificar título e artista pelo nome do arquivo. */
function identificarMusica(caminho) {

  /* Eu obtenho somente o nome do arquivo. */
  const nomeArquivo = caminho.split('/').pop()

  /* Eu retiro a extensão do arquivo musical. */
  const nomeSemExtensao = nomeArquivo.replace(
    /\.(mp3|m4a|ogg|wav)$/i,
    ''
  )

  /* Eu preparo uma variável para armazenar o nome decodificado. */
  let nomeDecodificado

  /* Eu tento recuperar caracteres especiais do nome. */
  try {

    /* Eu decodifico caracteres que possam estar codificados. */
    nomeDecodificado = decodeURIComponent(nomeSemExtensao)

  } catch {

    /* Eu mantenho o nome original quando a decodificação falha. */
    nomeDecodificado = nomeSemExtensao

  }

  /* Eu substituo sublinhados por espaços e retiro espaços extras. */
  const nomeLimpo = nomeDecodificado
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  /* Eu separo artista e título quando encontro um traço entre espaços. */
  const partes = nomeLimpo.split(/\s+[-–—]\s+/)

  /* Eu verifico se existem duas partes preenchidas. */
  if (
    partes.length === 2 &&
    partes[0].trim() &&
    partes[1].trim()
  ) {

    /* Eu considero a primeira parte como o artista. */
    const artista = partes[0].trim()

    /* Eu considero a segunda parte como o título. */
    const titulo = partes[1].trim()

    /* Eu devolvo o título e o artista identificados. */
    return {
      titulo: titulo,
      artista: artista
    }

  }

  /* Eu mantenho o nome do arquivo como título quando não identifico o artista. */
  return {
    titulo: nomeLimpo.replace(/-/g, ' '),
    artista: 'Artista não informado'
  }

}


/* ============================================= */
/* BIBLIOTECA AUTOMÁTICA                         */
/* ============================================= */

/* Eu transformo os arquivos encontrados em cadastros musicais. */
export const musicasAutomaticas = Object.entries(arquivosDeAudio)
  .map(([caminho, audio]) => {

    /* Eu identifico as informações disponíveis no nome do arquivo. */
    const informacoes = identificarMusica(caminho)

    /* Eu crio um identificador único usando o caminho do arquivo. */
    const id = `arquivo-${caminho}`

    /* Eu devolvo o cadastro completo da música. */
    return {

      /* Eu identifico a música pelo seu caminho. */
      id: id,

      /* Eu armazeno o título identificado. */
      titulo: informacoes.titulo,

      /* Eu armazeno o artista identificado. */
      artista: informacoes.artista,

      /* Eu deixo a capa vazia para utilizar a capa padrão. */
      capa: null,

      /* Eu conecto o endereço do arquivo de áudio. */
      audio: audio,

      /* Eu identifico a categoria da música. */
      categoria: 'Biblioteca musical'

    }

  })

/* ============================================= */
/* BIBLIOTECA MANUAL                             */
/* ============================================= */

/* Eu localizo o áudio local desta música sem travar o projeto em outra máquina. */
const audioFormulaMagica =
  arquivosDeAudio['../assets/musicas/formula-magica-da-paz.m4a'] ?? null

/* Eu mantenho os cadastros manuais separados da biblioteca automática. */
export const musicas = [

  /* Eu cadastro a segunda música da Fatica. */
  {
    id: 2,
    titulo: 'Minha Segunda Música',
    artista: 'Fatica',
    capa: null,

    /* Eu ainda não tenho o áudio desta música. */
    audio: null,

    categoria: 'Música independente'
  },

  /* Eu cadastro a terceira música da Fatica. */
  {
    id: 3,
    titulo: 'Minha Terceira Música',
    artista: 'Fatica',
    capa: null,

    /* Eu ainda não tenho o áudio desta música. */
    audio: null,

    categoria: 'Música independente'
  },

  /* Eu cadastro a música dos Racionais MC's. */
  {
    id: 4,
    titulo: 'Fórmula Mágica da Paz',
    artista: "Racionais MC's",
    capa: null,

    /* Eu conecto o arquivo quando ele existe nesta máquina. */
    audio: audioFormulaMagica,

    categoria: 'Rap nacional'
  }

]


/* ============================================= */
/* CATÁLOGO OFICIAL DA APLICAÇÃO                 */
/* ============================================= */

/* Eu mantengo somente as músicas manuais que já possuem áudio ou capa. */
const musicasManuaisComConteudo = musicas.filter(
  (musica) => musica.audio || musica.capa
)

/* Eu descubro quais áudios já estão na biblioteca manual. */
const audiosManuais = new Set(
  musicasManuaisComConteudo
    .map((musica) => musica.audio)
    .filter(Boolean)
)

/* Eu evito áudios repetidos na biblioteca automática. */
const musicasAutomaticasUnicas = musicasAutomaticas.filter(
  (musica) => !audiosManuais.has(musica.audio)
)

/* Eu monto o catálogo completo usado por toda a aplicação. */
export const catalogo = [
  ...musicasManuaisComConteudo,
  ...musicasDemonstracao,
  ...musicasAutomaticasUnicas
]
