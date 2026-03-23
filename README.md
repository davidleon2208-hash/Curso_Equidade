# Curso: Educacao Profissional - Equidade em Saude

Este repositorio contem o site do curso "Educacao Profissional Equidade em Saude", com pagina inicial, modulos em HTML, autenticacao de alunos, acompanhamento de progresso e uma area do aluno para retomar ou reiniciar o percurso formativo.

## Visao geral

O projeto e uma aplicacao front-end estatica baseada em HTML, CSS e JavaScript puro.

Principais objetivos da plataforma:

- apresentar o curso e sua estrutura
- disponibilizar os 5 modulos e suas etapas
- permitir cadastro e login de alunos
- registrar automaticamente o progresso de visualizacao
- mostrar um painel do aluno com andamento geral e por modulo
- permitir continuidade do curso ou reinicio do processo
- oferecer integracao opcional com banco em nuvem via Firebase

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript vanilla
- Tailwind CSS via CDN apenas na pagina inicial `index.html`
- Local Storage do navegador para sessao, usuarios e progresso
- Firebase Authentication e Firestore como integracao opcional

## Estrutura do projeto

### Paginas principais

- `index.html`: landing page do curso com apresentacao geral
- `login.html`: tela de autenticacao com abas de entrar e cadastrar
- `aluno.html`: area do aluno com painel de progresso
- `agradecimento.html`: tela final de conclusao

### Modulos do curso

Cada modulo possui uma pagina principal e, em geral, 3 etapas complementares:

- `md01.html`, `md01_nuvem.html`, `md01_ferramenta.html`, `md01_avaliacao.html`
- `md02.html`, `md02_nuvem.html`, `md02_ferramenta.html`, `md02_avaliacao.html`
- `md03.html`, `md03_nuvem.html`, `md03_ferramenta.html`, `md03_avaliacao.html`
- `md04.html`, `md04_nuvem.html`, `md04_ferramenta.html`, `md04_avaliacao.html`
- `md05.html`, `md05_nuvem.html`, `md05_ferramenta.html`, `md05_avaliacao.html`

### Arquivos de suporte

- `styles.css`: folha de estilos principal do site e da area do aluno
- `json.js`: logica de navegacao, autenticacao, progresso, sessao e painel do aluno
- `firebase-config.example.js`: modelo de configuracao para integrar com Firebase
- `imagem/`: logos, banners e imagens do curso
- `TUTORIAL.pdf`: material auxiliar
- `Apresentacao_dos_Modulos.md`: apoio textual sobre os modulos

## Arquitetura funcional

### 1. Entrada do usuario

O fluxo principal comeca em `index.html`.

Os botoes "Entrar" e "Link para o Curso" direcionam o usuario para `login.html`.

### 2. Autenticacao

A autenticacao e controlada por `json.js`.

O sistema oferece:

- cadastro de aluno com nome, email e senha
- login com email e senha
- sessao persistida no navegador
- protecao das paginas internas do curso

Se o usuario tentar abrir uma pagina protegida sem sessao, ele e redirecionado para `login.html`.

### 3. Armazenamento local

Sem configuracao de nuvem, os dados ficam no `localStorage`.

Chaves utilizadas:

- `cursoEquidadeUsers`: lista de usuarios cadastrados
- `cursoEquidadeSession`: sessao atual do usuario logado

Cada usuario possui:

- identificador
- nome
- email
- senha
- origem (`local` ou `firebase`)
- progresso
- datas de criacao e atualizacao

### 4. Progresso do curso

O progresso e registrado automaticamente quando o aluno acessa uma pagina rastreada.

Paginas monitoradas:

- todas as etapas dos modulos `md01` a `md05`
- `agradecimento.html` como etapa final

Dados de progresso armazenados por usuario:

- paginas visitadas
- ultima pagina acessada
- data de atualizacao
- quantidade de reinicios

### 5. Area do aluno

A pagina `aluno.html` mostra:

- progresso geral do curso em percentual
- total de paginas visitadas
- paginas restantes
- numero de reinicios
- ultimo acesso
- ultima pagina visitada
- andamento por modulo
- botao para continuar do ponto atual
- botao para voltar ao inicio
- botao para recomecar o curso
- botao para sair

### 6. Integracao opcional com Firebase

O sistema tenta carregar `firebase-config.js`.

Se esse arquivo existir e estiver configurado corretamente, o projeto passa a usar:

- Firebase Authentication para cadastro e login
- Firestore para salvar dados do aluno
- sincronizacao do progresso na colecao `alunos`

Se o arquivo nao existir ou estiver com placeholders, a aplicacao continua funcionando normalmente em modo local.

## Como o JavaScript esta organizado

Toda a logica principal esta em `json.js`.

Responsabilidades do arquivo:

- inicializacao da aplicacao no `DOMContentLoaded`
- identificacao da pagina atual
- protecao de rotas
- leitura e escrita no `localStorage`
- cadastro e login de alunos
- controle de sessao
- registro automatico de progresso
- renderizacao da area do aluno
- insercao do banner de progresso nas paginas do curso
- logout
- reinicio de progresso
- gerenciamento da sidebar e do menu hamburger
- abertura e fechamento do popup de suporte
- integracao opcional com Firebase

### Estruturas centrais em `json.js`

- `STORAGE_KEYS`: define as chaves do `localStorage`
- `COURSE_STRUCTURE`: descreve os modulos e suas paginas
- `TRACKED_PAGES`: lista completa de paginas que contam no progresso
- `PAGE_MAP`: mapeamento rapido de arquivo para metadados da pagina
- `PROTECTED_PAGES`: paginas que exigem autenticacao
- `firebaseState`: estado de carregamento e disponibilidade do Firebase

## Como abrir localmente

### Opcao 1: abrir direto no navegador

Basta abrir `index.html`.

### Opcao 2: usar servidor local

Recomendado para evitar problemas de caminho relativo e para simular melhor a navegacao do site.

Exemplo com Python:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000/
```

## Como configurar a integracao com Firebase

1. Crie um projeto no Firebase.
2. Ative o Authentication com login por email e senha.
3. Ative o Cloud Firestore.
4. Copie `firebase-config.example.js`.
5. Renomeie a copia para `firebase-config.js`.
6. Preencha os dados reais do seu projeto Firebase.

Exemplo:

```js
window.CURSO_FIREBASE_CONFIG = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJETO.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

Com isso, o sistema passa a:

- cadastrar usuarios na autenticacao do Firebase
- salvar dados do aluno em `alunos/{uid}`
- sincronizar progresso no Firestore

## Fluxo do usuario

1. O usuario acessa `index.html`.
2. Clica em entrar.
3. Faz login ou cria conta em `login.html`.
4. E redirecionado para `aluno.html`.
5. Inicia ou retoma o curso.
6. Cada pagina visitada atualiza o progresso.
7. O painel do aluno mostra o andamento consolidado.
8. O usuario pode continuar do ultimo ponto ou recomecar o curso.

## Estilos e interface

O arquivo `styles.css` concentra:

- layout geral do site
- sidebar dos modulos
- responsividade
- cards de conteudo
- botoes de navegacao
- layout da tela de login
- visual da area do aluno
- banner de progresso exibido nas paginas do curso
- popup de suporte

## Comportamentos importantes

### Paginas publicas

- `index.html`
- `login.html`

### Paginas protegidas

- `aluno.html`
- todas as paginas de modulo
- `agradecimento.html`

### Reinicio do curso

Quando o usuario escolhe recomecar:

- as paginas visitadas sao limpas
- o contador de reinicios e incrementado
- o curso pode ser iniciado novamente desde `md01.html`

## Limitacoes atuais

- a senha do modo local fica armazenada no navegador, sem criptografia
- nao existe backend proprio alem da opcao Firebase
- a maior parte do conteudo ainda e composta por HTML estatico
- nao ha suite automatizada de testes
- o projeto possui alguns textos com problemas de codificacao em partes do HTML original

## Sugestoes de evolucao

- mover autenticacao para um backend dedicado ou usar apenas Firebase
- criptografar ou eliminar o armazenamento local de senha
- separar o JavaScript em modulos menores
- padronizar codificacao UTF-8 em todos os arquivos
- criar componentes reutilizaveis para cabecalho, rodape e navegacao
- adicionar testes manuais documentados ou testes automatizados

## Manutencao do conteudo

Para atualizar textos dos modulos:

- edite os arquivos `mdXX*.html`

Para alterar estilos:

- edite `styles.css`

Para alterar regras de login, progresso e painel:

- edite `json.js`

Para configurar nuvem:

- crie e preencha `firebase-config.js` com base em `firebase-config.example.js`

## Autor

Desenvolvido por David Perfeito Leoncio.

## Resumo tecnico rapido

Se voce estiver chegando agora no projeto, estes sao os arquivos mais importantes:

- `index.html`: porta de entrada do curso
- `login.html`: autenticacao
- `aluno.html`: painel do aluno
- `json.js`: cerebro da aplicacao
- `styles.css`: apresentacao visual
- `firebase-config.example.js`: ponto de partida para integracao em nuvem
