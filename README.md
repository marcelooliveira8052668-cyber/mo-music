# 🎵 M.O Music

**Uma plataforma de música estilo Spotify — feita para qualquer pessoa colocar as próprias músicas, compartilhar com amigos e receber apoio ou pagamento, sem cadastro e sem servidor.**

> 🟢 **Demonstração pública:** o site vem com 5 faixas royalty-free para visitantes clicarem em **▶ Tocar** e ouvirem na hora.
> 🎧 **No seu computador:** a biblioteca local com centenas de arquivos de áudio é carregada automaticamente — e nunca é enviada para a internet.

---

## ✨ O que a plataforma faz

### 🎧 Player completo (estilo Spotify)
- Barra de player fixa no rodapé com play/pausa, próxima/anterior, barra de progresso arrastável e volume
- **Aleatório** e **repetir** (fila inteira ou uma música só)
- **Fila de reprodução** com as próximas faixas
- Favoritos (❤), **playlists** criadas por você e histórico de reprodução
- Contador de reproduções e ranking de “Mais tocadas”
- Atalhos de teclado: `Espaço` (play/pausa), `→`/`←` (avançar/voltar 5s), `Shift + →`/`←` (próxima/anterior), `Ctrl + K` ou `/` (buscar)

### 📤 Qualquer pessoa coloca sua música em 10 segundos
- Botão **“Colocar minha música”** na barra lateral
- **Arraste e solte** vários arquivos de áudio de uma vez (MP3, M4A, OGG, WAV, FLAC, AAC)
- Título, artista e capa preenchidos **automaticamente dos metadados** do arquivo
- Campo opcional para **colar a letra** da música
- **Nenhum cadastro. Nenhum upload.** Tudo fica no seu navegador

### 🔗 Divulgação com amigos
- Botão de **compartilhar** em cada música, no player e nas listas
- Usa a **API de Compartilhamento** do celular/PC: envia o **arquivo de áudio de verdade** pelo WhatsApp, Telegram, e-mail etc.
- Quando o dispositivo não permite, copia um texto de divulgação pronto para colar

### 💰 Venda e apoio ao artista
- Ao adicionar a música, o artista informa **chave Pix ou link de compra** (Mercado Pago, Ko-fi, Hotmart…) e um **preço opcional**
- A faixa passa a exibir o botão **“Comprar R$ 9,90”** ou **“Apoiar artista”**
- O ouvinte clica → a loja abre ou a **chave Pix é copiada** → o dinheiro vai **direto para o artista**
- Sem intermediário, sem taxa da plataforma

### 📝 Letra da música (acompanhe cantando)
- Ao tocar, o painel **“Letra”** busca o texto automaticamente na internet (API gratuita *lyrics.ovh*)
- Se a música for sua/independente e não for encontrada, **cole a letra no painel** e ela fica salva naquela música
- Funciona offline quando a letra foi salva junto da música

### 📱 Responsivo
- Layout adaptado para desktop, tablet e celular
- Navegação inferior no celular, player compacto e botões maiores para toque

---

## 🚀 Como rodar o projeto

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`).

```bash
# Outros comandos úteis
npm run build    # Gera a versão de produção em dist/
npm run preview  # Visualiza a versão de produção
npm run lint     # Verifica a qualidade do código
```

---

## 🗂️ Estrutura do projeto

```
src/
├── App.jsx                 # Estado global, telas e navegação
├── App.css                 # Design system completo (tema escuro)
├── contexto.jsx            # Contexto React compartilhado
├── PlayerMusical.jsx       # Barra fixa + fila + painel de letra
├── BarraLateral.jsx        # Menu, CTA e playlists
├── ListaMusicas.jsx        # Linhas de faixas
├── MusicaCard.jsx          # Cards de grade
├── AdicionarMusicaForm.jsx # Arraste e solte de músicas
├── ModalPlaylists.jsx      # Adicionar música às playlists
├── Icones.jsx              # Ícones em SVG
├── utilitarios.js          # localStorage, tempo, compartilhar
└── dados/
    ├── musicas.js          # Montagem do catálogo
    ├── demonstracao.js     # Faixas royalty-free da demo
    └── assets/
        ├── demonstracao/   # MP3s da demonstração (no repositório)
        └── musicas/        # SUA biblioteca local (NÃO vai ao GitHub)
```

---

## 🎼 Sobre as músicas do repositório público

Para o site publicado funcionar de verdade (dando play), o repositório inclui **5 faixas royalty-free**:

| Faixa | Artista |
| --- | --- |
| Sneaky Snitch | Kevin MacLeod |
| Electrodoodle | Kevin MacLeod |
| Carefree | Kevin MacLeod |
| Vibe Ace | Kevin MacLeod |
| Hyperfun | Kevin MacLeod |

**Créditos obrigatórios (licença CC BY 4.0):**
> Music: Kevin MacLeod ([incompetech.com](https://incompetech.com))
> Licensed under Creative Commons: By Attribution 4.0 — <http://creativecommons.org/licenses/by/4.0/>

### ⚠️ Sua biblioteca pessoal não vai para o GitHub
Os arquivos de áudio locais ficam em `src/assets/musicas/` e são **ignorados pelo `.gitignore`** (cerca de 3,6 GB). Isso evita dois problemas:

1. **Tamanho:** o repositório continuaria leve;
2. **Direitos autorais:** músicas de terceiros não devem ser publicadas.

No seu computador, tudo funciona normalmente: basta rodar `npm run dev`.

---

## 🔒 Privacidade

- **Nenhum arquivo de áudio sai do seu computador**
- Favoritos, playlists, histórico, volume e preferências ficam no `localStorage` do seu navegador (prefixo `momusic:`)
- A única requisição externa é a busca de letras (nome de artista + título), feita apenas quando você toca uma música sem letra salva

---

## 🗺️ Fase 2 — Monetização real (roadmap)

Hoje o pagamento acontece **direto entre ouvinte e artista** (Pix/link de compra), o que já permite vender e apoiar sem custo para a plataforma. Para escalar:

1. **Gateway de pagamento** (Mercado Pago, Stripe, Asaas) com checkout dentro do site
2. **Entrega automática** do arquivo após a confirmação do pagamento
3. **Página de artista** com link público (`momusic.com/artista`)
4. **Contas opcionais** para sincronizar playlists entre dispositivos
5. **Upload para nuvem** opcional para quem quiser publicar sem manter o site no ar

---

## 🛠️ Tecnologias

- **React 19** + **Vite 8**
- **Context API** para estado global
- **Web Share API** para compartilhamento nativo
- **jsmediatags** para leitura de metadados (ID3) e capas
- CSS puro com variáveis — sem dependências de UI

---

Feito com 💚 para músicos independentes que querem mostrar seu som sem depender de plataforma grande.
