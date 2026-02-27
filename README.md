# BI Crédito Viewer

Aplicação desktop em **Electron + Node.js** para listar relatórios `.pbix`, abrir cada relatório em instância isolada do Power BI Desktop e facilitar apresentações sem bloquear o Windows.

## Funcionalidades

- Seleção de pasta local com arquivos `.pbix`.
- Persistência da última pasta selecionada em JSON local.
- Listagem dinâmica de relatórios com botão **Abrir** para cada item.
- Painel de **Prévia** na tela inicial com imagem local opcional (mesmo nome do `.pbix`).
- Abertura de relatório em **nova instância isolada** do app.
- Janela de visualização sem frame nativo (`frame: false`) com barra superior customizada.
- Execução do Power BI Desktop por `child_process.spawn`.
- Tentativa automática de modo apresentação (`F11`) após 3 segundos (Windows).
- Encerramento controlado da instância do Power BI ao fechar janela.
- Registro do protocolo customizado `bicreditoviewer://`.
- Log local simples de aberturas com timestamp (`openings.log`).

## Estrutura do projeto

```text
.
├─ assets/
├─ config/
│  └─ default.json
├─ renderer/
│  ├─ index.html
│  ├─ renderer.js
│  ├─ styles.css
│  ├─ viewer.html
│  └─ viewer.js
├─ services/
│  ├─ configService.js
│  ├─ logService.js
│  ├─ powerBIService.js
│  └─ reportService.js
├─ main.js
├─ preload.js
└─ package.json
```

## Requisitos

- Windows 10 ou 11
- Node.js 20+
- Power BI Desktop instalado no caminho padrão:
  - `C:\Program Files\Microsoft Power BI Desktop\bin\PBIDesktop.exe`

## Instalação

```bash
npm install
```

## Execução em desenvolvimento

```bash
npm run dev
```

## Build para instalador `.exe`

```bash
npm run build
```

Saída esperada em `dist/` com instalador NSIS.

> Observação: compilar alvo Windows em ambiente não-Windows pode exigir toolchain adicional.


### Prévia de relatório

A prévia usa imagem local opcional com o **mesmo nome** do arquivo `.pbix` no mesmo diretório.

Exemplo:

- `Financeiro.pbix`
- `Financeiro.png` (ou `.jpg`, `.jpeg`, `.webp`, `.bmp`)

Se a imagem não existir, o app mostra aviso e permite vincular manualmente uma imagem de prévia pelo botão "Vincular imagem de prévia".

## Protocolo customizado

O app registra o protocolo:

```text
bicreditoviewer://nomeDoRelatorio
```

Com isso, ao receber a URI, o app tenta localizar `nomeDoRelatorio.pbix` na pasta configurada e abre direto em modo viewer.

## Configuração local e logs

Arquivos criados no `userData` do Electron:

- `config.json`: última pasta selecionada e configurações locais.
- `openings.log`: log de abertura de relatórios (`timestamp | nomeRelatorio`).

## Segurança

- Apenas caminhos locais são lidos/gravados.
- Não há envio de dados para internet.
- Não utiliza backend remoto, Azure ou Power BI Service.
