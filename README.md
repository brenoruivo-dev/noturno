# 🌙 Modo Noturno por Site (`noturno`)

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)
![Version](https://img.shields.io/badge/version-1.3.0-2e7d32)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-orange)
![Platform](https://img.shields.io/badge/browser-Chrome%20%7C%20Edge%20%7C%20Brave-informational)

Extensão leve e de alta performance (Manifest V3) para navegadores baseados em Chromium que aplica **Modo Noturno individualizado por domínio** com **3 níveis de intensidade**, prevenção de *Flash of Unstyled Content* (FOUC / tela branca no carregamento) e preservação inteligente de cores originais em imagens, vídeos, mapas e tela cheia.

---

## ✨ Funcionalidades Principais

- **Controle Granular por Domínio**: A preferência é salva por *hostname* normalizado (ex.: `www.exemplo.com.br` e `exemplo.com.br` compartilham a mesma regra automaticamente).
- **Ciclo de 3 Níveis com 1 Clique (ou Atalho)**:
  1. **Desativado (`Off`)**: Renderização original da página sem interferência.
  2. **Modo Intermediário (`MED` — Conforto Visual)**: Aplica inversão cromática com rotação de matiz (`180deg`) e atenuação de contraste (`contrast(0.75)`), resultando em fundo cinza-escuro confortável (`~#202020`) e compensação de nitidez (`contrast(1.15)`) para imagens e vídeos.
  3. **Modo Alto (`ALTO` — Noturno Pleno)**: Contraste total com fundo preto profundo (`#000000`), ideal para ambientes totalmente escuros e telas OLED/AMOLED.
- **Preservação Inteligente de Mídias (Sem Efeito Negativo)**: Reverte a inversão automaticamente em elementos visuais (`<img>`, `<video>`, `<canvas>`, `<embed>`, `<object>`, `input[type="image"]`, elementos com `background-image` decorativo e `<iframe>` de players como YouTube, Vimeo, Twitch, Dailymotion e Google Maps).
- **Zero Tela Branca no Carregamento (Anti-FOUC)**: Injeção em `document_start` combinada com cache síncrono em `sessionStorage` (`__site_dark_mode__`) antes mesmo da resposta assíncrona do `chrome.storage.local`.
- **Sincronização Multi-Abas em Tempo Real**: Alterar o modo de um domínio atualiza instantaneamente todas as abas abertas daquele mesmo site.
- **Modo Tela Cheia & Impressão Seguros**:
  - Desativa filtros automaticamente em `:fullscreen` / `:-webkit-full-screen` para reprodução fiel de vídeos.
  - Remove filtros em `@media print` para evitar páginas impressas com fundo escuro e desperdício de tinta.

---

## 🚀 Instalação (Modo Desenvolvedor)

1. Clone este repositório em sua máquina:
   ```bash
   git clone https://github.com/brenoruivo-dev/noturno.git
   ```
2. Abra o navegador (Google Chrome, Microsoft Edge, Brave, Opera ou Vivaldi) e acesse:
   ```text
   chrome://extensions/
   ```
3. No canto superior direito, ative a chave **Modo do desenvolvedor** (*Developer mode*).
4. Clique em **Carregar sem compactação** (*Load unpacked*) e selecione a pasta raiz deste projeto (`noturno`).

---

## 🎮 Como Usar

| Ação | Como acionar | Resultado |
| :--- | :--- | :--- |
| **Alternar Nível** | Clique no ícone da extensão na barra de ferramentas **ou** pressione `Alt + Shift + D` | Alterna sequencialmente entre `Desativado` → `Médio (MED)` → `Alto (ALTO)` → `Desativado` |
| **Indicador Visual (Badge)** | Observe o selo sobre o ícone da extensão | Sem selo (`Off`), Laranja `MED` (`#f57c00`) ou Verde `ALTO` (`#2e7d32`) |
| **Configurar Atalho** | Acesse `chrome://extensions/shortcuts` | Permite personalizar o atalho padrão `Alt + Shift + D` |

---

## 🗂️ Estrutura do Projeto

```text
noturno/
├── manifest.json          # Configuração da extensão (Manifest V3, permissões e comandos)
├── background.js          # Service Worker: gestão de estado por domínio, badges e sincronia de abas
├── content.js             # Content Script (document_start): cache anti-FOUC e atributo data-site-dark-mode
├── dark.css               # Motor visual CSS: filtros cromáticos, re-inversão de mídia, fullscreen e print
├── icons/                 # Ícones oficiais da extensão (16x16, 48x48, 128x128)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── docs/
    └── ARQUITETURA.md     # Documentação técnica detalhada de funcionamento e ciclo de vida
```

---

## 📖 Documentação Técnica

Para detalhes aprofundados sobre o funcionamento interno do **Service Worker**, a estratégia de **prevenção de FOUC**, o modelo de armazenamento em `chrome.storage.local` e as regras de especificidade do pipeline CSS, consulte:

👉 **[Documentação de Arquitetura (`docs/ARQUITETURA.md`)](./docs/ARQUITETURA.md)**

---

## 🔒 Privacidade e Permissões

Esta extensão opera **100% localmente** no navegador do usuário, sem telemetria, rastreamento ou chamadas externas:

- `storage`: Persistência local da lista de domínios e seus respectivos modos (`medio` / `alto`).
- `tabs`: Leitura da URL da aba ativa para identificar o domínio e atualizar o indicador (`MED` / `ALTO`).
- `scripting`: Aplicação imediata do script e folha de estilo em abas que já estavam abertas antes da instalação ou recarga da extensão.
- `host_permissions` (`http://*/*`, `https://*/*`): Necessário para injetar o tema escuro em qualquer site escolhido pelo usuário.

---

**Desenvolvido por Breno Ruivo (`brenoruivo-dev`) — Brazcraft Tecnologia.**
