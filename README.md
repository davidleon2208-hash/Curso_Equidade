# Curso: Educação Profissional — Equidade em Saúde

Este repositório contém os arquivos do curso "Educação Profissional Equidade em Saúde" (PET-Equidade), uma proposta educativa híbrida com recursos textuais, vídeos e atividades presenciais.

## Visão geral
- Objetivo: qualificar trabalhadoras e trabalhadores da SESAPI sobre equidade em saúde, abordando conceitos, práticas e estratégias para redução de iniquidades.
- Formato: híbrido (atividades autoinstrucionais no AVA + três encontros presenciais).
- Carga horária: 60h (certificação por ESP-PI e UFPI).

## Conteúdo principal
- Página principal: [index.html](index.html)
- Módulos e material didático: [md01.html](md01.html) (ex.: Módulo 1).
- Estilos: [styles.css](styles.css)
- Scripts auxiliares: [json.js](json.js) — controla comportamento da sidebar/hamburger.
- Pastas de mídia: imagem/ (imagens) e video/ (vídeos)

## Estrutura do projeto

- [index.html](index.html) — página principal com apresentação do curso;
- [md01.html](md01.html), [md01_nuvem.html](md01_nuvem.html), [md01_ferramenta.html](md01_ferramenta.html) — páginas de módulos e conteúdos;
- [styles.css](styles.css) — folha de estilos principal (layout, sidebar, nuvem de palavras);
- [json.js](json.js) — pequenos comportamentos JS (toggle da sidebar e botão hambúrguer);
- imagem/ — imagens e logos usados no conteúdo;
- video/ — arquivos de vídeo exibidos nos módulos;
- aviso.html, outros md02_*.html — documentos e módulos adicionais.

> Nota: Tailwind CSS é carregado via CDN em [index.html](index.html); não há build step necessário para ver o site localmente.

## Como abrir localmente

Opção rápida (abrir diretamente):

- No Windows: dê duplo clique em [index.html](index.html) para abrir no navegador.

Opção recomendada (servidor local simples, evita problemas de CORS e caminhos relativos):

1. Abra um terminal na pasta do repositório.
2. Execute um servidor HTTP simples. Exemplo com Python 3:

```bash
python -m http.server 8000
```

3. Acesse http://localhost:8000/ no navegador.

## Navegação e UX

- A versão de módulos usa uma sidebar fixa para navegar entre módulos; em telas menores a sidebar some e aparece um botão hambúrguer gerenciado por [json.js](json.js).
- Os arquivos de módulo (ex.: [md01.html](md01.html)) contêm navegação interna (botões Anterior / Próximo) para seguir o fluxo do curso.

## Edição e personalização

- Para alterar estilos, edite [styles.css](styles.css).
- Para atualizar textos e conteúdo dos módulos, edite os respectivos arquivos HTML (mdXX*.html).
- Para adicionar/atualizar imagens ou vídeos, coloque os arquivos em imagem/ ou video/ e atualize as referências nos HTMLs.

## Testes rápidos

- Abra [md01.html](md01.html) e verifique se o vídeo em video/ carrega corretamente.
- Reduza a largura da janela para testar o comportamento da sidebar/hamburger.

## Autor e contato

Desenvolvido por David Perfeito Leôncio.

Para dúvidas sobre o conteúdo, use o e-mail de suporte presente no rodapé das páginas.