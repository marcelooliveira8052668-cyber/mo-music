# 🎵 M.O Music

**Modelo de site para qualquer artista independente: apresentação, catálogo público, player, compartilhamento e apoio voluntário por Pix.** Uma cópia do site por artista; não é uma plataforma com várias contas de publicação.

## Página pública do artista

A página inicial apresenta nome, foto, biografia, músicas publicadas e canais de apoio. Sem músicas próprias cadastradas, mostra um catálogo vazio e uma demonstração claramente identificada com músicas de Kevin MacLeod (CC BY 4.0).

### Como personalizar e publicar

1. Edite `ARTISTA` em `src/configuracao.js`: nome, apresentação, biografia, foto, chave Pix, nome do recebedor e/ou link HTTPS de apoio. Deixe os canais vazios se não quiser receber contribuições. A chave Pix será pública; prefira uma chave aleatória em vez de CPF ou telefone pessoal.
2. Verifique os direitos de publicação e, para monetizar, a permissão de uso comercial da ferramenta/plano de IA utilizado. Não publique áudio ou imagem de terceiros sem autorização.
3. Coloque **somente os arquivos autorizados para divulgação** em `public/artista/`. Use nomes simples, por exemplo `cancao.mp3`, `capa.jpg` e `foto.jpg`. Alternativamente, hospede-os em um serviço HTTPS.
4. Cadastre as faixas no array `faixas` de `src/dados/publicadas.js`. Há um exemplo comentado nesse arquivo. Para arquivos da pasta pública, use `${import.meta.env.BASE_URL}artista/cancao.mp3`, inclusive para capas e foto. Isso funciona em domínio próprio e em subpastas do GitHub Pages.
5. Rode `npm run lint` e `npm run build`. Publique o conteúdo de `dist/` ou envie as alterações para `main` para usar o workflow do GitHub Pages já configurado.
6. Teste em outro aparelho: a página deve exibir as faixas públicas e permitir ouvi-las. O botão de compartilhar de uma faixa pública gera `?musica=publicada-ID`, destaca a faixa e aguarda o visitante clicar para ouvir (sem autoplay).

**Não é um upload online:** anexar arquivos pelo formulário só os guarda no navegador. A publicação pública desta versão depende de editar o catálogo e publicar o site. As alterações são controladas pelo acesso ao repositório/hospedagem, não por uma senha na interface. Não há painel administrativo online.

**Pagamentos:** Pix é uma contribuição manual; o site não confirma transferências, não paga por reprodução e não libera downloads automaticamente. Links de apoio abrem serviços externos, sujeitos às próprias taxas e regras. Áudios públicos podem ser baixados por quem tem acesso: não use esse catálogo para arquivos que precisam ser protegidos por pagamento.

**Privacidade do build:** `src/assets/musicas/` é uma biblioteca apenas de desenvolvimento. A configuração do Vite a substitui por um módulo vazio ao gerar a produção: esses arquivos pessoais não entram no `dist/`, mesmo que existam na máquina. Já tudo em `public/` é publicado.

> 🟢 **Demonstração pública:** o site vem com 5 faixas royalty-free para visitantes clicarem em **▶ Tocar** e ouvirem na hora.
> 🎧 **No seu computador:** a biblioteca local com centenas de arquivos de áudio é carregada automaticamente — e nunca é enviada para a internet.

---

## ✨ O que a plataforma faz

### 🎧 Player completo
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
- Sem taxa cobrada pelo M.O Music; serviços externos podem cobrar taxas. Não há confirmação de pagamento nem entrega automática.

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

- Arquivos **anexados pelo navegador** não são enviados à internet. As faixas do catálogo público e os arquivos em `public/` são publicados junto com o site.
- Músicas anexadas ficam guardadas no próprio navegador (IndexedDB) ou conectadas direto à pasta (Chrome/Edge), e voltam sozinhas ao abrir o site
- Só quem anexou usa o botão de excluir **no próprio aparelho**. Quem recebe o link vê o catálogo público, não as anexações de outro navegador.
- Favoritos, playlists, histórico, volume e preferências ficam no `localStorage` do seu navegador (prefixo `momusic:`)
- Busca de letras e busca opcional de capas consultam serviços externos com título/artista. Links de apoio levam ao serviço escolhido; áudios/imagens hospedados externamente também geram requisições.

---

## 🎁 Entregando o site a um cliente (cópia limpa)

O site **nasce limpo**: nenhuma música anexada por você vai junto — as músicas de cada pessoa ficam guardadas só no navegador dela, nunca nos arquivos do site. Para entregar:

1. **Troque a marca** em `src/configuracao.js` (nome da plataforma, nome curto e rodapé) e, se quiser, o `<title>` do `index.html`. O site inteiro passa a usar a marca nova.
2. **Não envie a pasta `src/assets/musicas/`** — é a biblioteca pessoal do dono e já é ignorada pelo Git (fica só na máquina de quem desenvolveu).
3. Personalize também `ARTISTA` e o catálogo de `src/dados/publicadas.js`. Remova arquivos públicos do cliente anterior antes de entregar uma cópia a outro artista. Anexar músicas pelo navegador serve apenas para ouvir localmente, não para divulgá-las por link.

As 5 faixas de demonstração (Kevin MacLeod, CC BY 4.0) servem de vitrine. Para removê-las, esvazie o array de `src/dados/demonstracao.js`.

---

## 🗄️ Armazenamento e banco de dados (guia de quem comprou o site)

> **Obs do vendedor:** quem comprar o site **faz todo o trâmite sozinho** — os passos abaixo são o roteiro completo. A publicação na nuvem é opcional: o site funciona sem ela (músicas guardadas em cada aparelho).

### Como o app guarda música hoje — sem servidor

| O que | Onde fica | Até quando |
|---|---|---|
| Músicas anexadas (metadados + arquivo) | **IndexedDB**, banco `momusic-dados`, loja `anexadas` | Até o dono apagar (botão de excluir) ou limpar os dados do navegador |
| Pasta conectada (Chrome/Edge) | Handle salvo na loja `chaves` do mesmo banco | Enquanto o navegador lembrar a permissão |
| Favoritas, playlists, histórico, preferências | **localStorage** com prefixo `momusic:` | Enquanto não limpar o navegador |

- O **IndexedDB** é o "banco de dados" do navegador: guarda textos **e arquivos grandes (Blob)**, sobrevive a fechar o PC, reiniciar e atualizar o site.
- **Nenhum arquivo anexado sai do aparelho** — por isso outro celular vê somente as faixas públicas cadastradas no projeto e a demonstração, não a biblioteca particular.

### O trâmite para ativar a publicação na nuvem (opcional)

O catálogo estático descrito no início deste README já permite ouvir músicas em outros aparelhos, sem banco de dados. Para uma futura área de publicação pelo navegador, é possível usar armazenamento em nuvem e banco de dados. **O roteiro a seguir é apenas uma proposta futura, não uma integração implementada:**

1. **Crie a conta grátis** em [supabase.com](https://supabase.com) → **New Project** (nome `mo-music`, senha forte, região *South America (São Paulo)*).
2. **Rode o SQL** no **SQL Editor** do Supabase (colar e clicar em Run) — cria a tabela e as regras de segurança:

```sql
-- Tabela das músicas publicadas no catálogo público
create table if not exists musicas_publicadas (
  id text primary key,
  titulo text not null,
  artista text not null,
  categoria text,
  apoio text,
  preco numeric,
  letra text,
  arquivo_url text not null,
  capa_url text,
  tamanho bigint,
  dono uuid,
  criado_em timestamptz default now()
);

alter table musicas_publicadas enable row level security;

-- Quem abre o site ouve (leitura pública)
create policy "leitura_publica" on musicas_publicadas
  for select to anon using (true);

-- Só quem está logado na conta do dono publica, edita e apaga
create policy "dono_administra" on musicas_publicadas
  for all to authenticated
  using (auth.uid() = dono)
  with check (auth.uid() = dono);
```

3. **Copie as chaves**: em *Project Settings → API*, pegue a **Project URL** e a **anon public** key.
4. **Preencha o `.env`**: copie `.env.example` para `.env` na raiz do projeto e cole os dois valores. O Git ignora o `.env` (nunca vai para o repositório).
5. **Implemente e teste o botão "Publicar"**: login via *Supabase Auth*, bucket de áudio com políticas próprias de Storage, upload e cadastro na tabela. As regras da tabela não protegem automaticamente os arquivos do Storage. Restringir quem pode se cadastrar/publicar e testar as permissões também é necessário.

> **Segurança:** a chave anon é feita para o navegador e é pública de propósito — a proteção vem das **regras (RLS)** do passo 2: anônimo (quem recebe o link) **só lê**; escreve e apaga **apenas a conta do dono**, logada. É o que garante que "só quem publicou pode excluir".

---

## 🗺️ Fase 2 — Monetização real (roadmap)

Hoje o pagamento acontece **direto entre ouvinte e artista** (Pix/link de compra), o que já permite vender e apoiar sem custo para a plataforma. Para escalar:

1. **Gateway de pagamento** (Mercado Pago, Stripe, Asaas) com checkout dentro do site
2. **Entrega automática** do arquivo após a confirmação do pagamento
3. **Múltiplos artistas e contas** (a página pública de um artista por site já está disponível)
4. **Contas opcionais** para sincronizar playlists entre dispositivos
5. **Painel de publicação na nuvem** sem editar código (o catálogo público estático já toca em outros aparelhos)

---

## 🛠️ Tecnologias

- **React 19** + **Vite 8**
- **Context API** para estado global
- **Web Share API** para compartilhamento nativo
- **jsmediatags** para leitura de metadados (ID3) e capas
- CSS puro com variáveis — sem dependências de UI

---

Feito com 💚 para músicos independentes que querem mostrar seu som sem depender de plataforma grande.
