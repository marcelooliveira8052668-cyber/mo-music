import { useState } from 'react'
import { ARTISTA } from './configuracao'
import { musicasPublicadas } from './dados/publicadas'
import { musicasDemonstracao } from './dados/demonstracao'
import { useApp } from './contexto'
import ListaMusicas from './ListaMusicas'
import { IconeTocar, IconeCompartilhar, IconeCoracao } from './Icones'
import { compartilharPaginaArtista } from './utilitarios'
import './PaginaArtista.css'

export default function PaginaArtista() {
  const { tocarConjunto, mostrarAviso, musicaAtual } = useApp()
  const [fotoFalhou, setFotoFalhou] = useState(false)
  const [copiando, setCopiando] = useState(false)
  const linkSeguro = /^https:\/\//i.test(ARTISTA.linkApoio)
  const faixaCompartilhada = new URLSearchParams(window.location.search).get('musica')
  const destaque = musicasPublicadas.find((faixa) => faixa.id === faixaCompartilhada)

  async function compartilhar() {
    const resultado = await compartilharPaginaArtista()
    if (resultado === 'copiado') mostrarAviso('Link da artista copiado! Envie para quem você quiser.')
    if (resultado === 'erro') mostrarAviso('Não foi possível compartilhar. Copie o endereço na barra do navegador.')
  }

  async function copiarPix() {
    setCopiando(true)
    try {
      await navigator.clipboard.writeText(ARTISTA.pix)
      mostrarAviso('Chave Pix copiada. Confira o recebedor no aplicativo do seu banco.')
    } catch {
      mostrarAviso('Não foi possível copiar. Selecione a chave Pix abaixo e copie manualmente.')
    } finally {
      setCopiando(false)
    }
  }

  return (
    <div className="tela pagina-artista">
      <section className="artista-apresentacao" aria-labelledby="nome-artista">
        <div className="artista-retrato">
          {ARTISTA.foto && !fotoFalhou
            ? <img src={ARTISTA.foto} alt={`Retrato de ${ARTISTA.nome}`} onError={() => setFotoFalhou(true)} />
            : <span aria-hidden="true">♪</span>}
        </div>
        <div className="artista-identidade">
          <span className="artista-etiqueta">Música independente · Um espaço próprio</span>
          <h1 id="nome-artista">{ARTISTA.nome}</h1>
          <p>{ARTISTA.apresentacao}</p>
          <div className="artista-acoes">
            <button type="button" className="botao-verde-grande" onClick={() => tocarConjunto(musicasPublicadas.length ? musicasPublicadas : musicasDemonstracao)}>
              <IconeTocar /> {musicasPublicadas.length ? 'Ouvir músicas' : 'Experimentar o player'}
            </button>
            <button type="button" className="botao-secundario" onClick={compartilhar}>
              <IconeCompartilhar /> Compartilhar página
            </button>
            {(ARTISTA.pix || linkSeguro) && <a className="artista-link-apoio" href="#apoio-artista"><IconeCoracao /> Apoiar a artista</a>}
          </div>
          <small>Ouça gratuitamente e ajude a música a chegar a mais pessoas.</small>
        </div>
      </section>

      <div className="artista-colunas">
        <section className="artista-catalogo" aria-labelledby="titulo-catalogo">
          <div className="artista-titulo-secao">
            <h2 id="titulo-catalogo">Músicas da artista</h2>
            <span>{musicasPublicadas.length} {musicasPublicadas.length === 1 ? 'faixa publicada' : 'faixas publicadas'}</span>
          </div>
          {destaque && (
            <div className="artista-faixa-compartilhada">
              <p>Compartilharam esta música com você: <strong>{destaque.titulo}</strong></p>
              <button type="button" className="botao-secundario" onClick={() => tocarConjunto([destaque])}>
                <IconeTocar /> {musicaAtual?.id === destaque.id ? 'Ouvir novamente' : 'Ouvir esta música'}
              </button>
            </div>
          )}
          {musicasPublicadas.length > 0
            ? <ListaMusicas musicas={musicasPublicadas} conjunto={musicasPublicadas} />
            : <div className="artista-vazio"><span aria-hidden="true">♫</span><h3>Novas músicas chegando</h3><p>As primeiras canções aparecerão aqui quando forem publicadas. Volte em breve!</p></div>}
          <p className="artista-nota">Aqui aparecem somente as faixas publicadas da artista. Músicas anexadas à sua biblioteca continuam apenas no seu aparelho.</p>
          {!musicasPublicadas.length && <section className="artista-demonstracao" aria-labelledby="titulo-demo">
            <h2 id="titulo-demo">Experimente com músicas de demonstração</h2>
            <p className="artista-nota">Estas faixas são de Kevin MacLeod, não do artista que personalizar este site.</p>
            <ListaMusicas musicas={musicasDemonstracao} conjunto={musicasDemonstracao} />
            <p className="artista-nota">Music: Kevin MacLeod (<a href="https://incompetech.com" target="_blank" rel="noopener noreferrer">incompetech.com</a>). Licença <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0</a>.</p>
          </section>}
        </section>

        <aside className="artista-informacoes" aria-label="Sobre a artista e apoio">
          <section className="artista-painel">
            <h2>Por trás das canções</h2>
            <p className="artista-biografia">{ARTISTA.biografia}</p>
          </section>
          <section className="artista-painel artista-apoio" id="apoio-artista">
            <IconeCoracao />
            <h2>Apoie esta música</h2>
            <p>Gostou de ouvir? Compartilhar a página já é uma forma de apoiar. Se desejar, você também pode contribuir voluntariamente.</p>
            {ARTISTA.pix && <div className="artista-pix">
              <label htmlFor="chave-pix-artista">Chave Pix da artista</label>
              <input id="chave-pix-artista" value={ARTISTA.pix} readOnly onFocus={(evento) => evento.target.select()} />
              {ARTISTA.nomeRecebedor && <small>Recebedor informado: {ARTISTA.nomeRecebedor}</small>}
              <button type="button" className="botao-verde-grande" disabled={copiando} onClick={copiarPix}>{copiando ? 'Copiando…' : 'Copiar chave Pix'}</button>
              <small>Abra seu banco, escolha o valor e confira o nome do recebedor antes de confirmar.</small>
            </div>}
            {linkSeguro && <a className="botao-secundario" href={ARTISTA.linkApoio} target="_blank" rel="noopener noreferrer">Contribuir pelo serviço de pagamento ↗</a>}
            {!ARTISTA.pix && !linkSeguro && <p className="artista-nota">O canal de contribuições ainda não foi cadastrado.</p>}
            <p className="artista-nota">Apoio opcional: não é necessário pagar para ouvir. O site não processa nem confirma pagamentos e não remunera por reprodução.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
