## Objetivo

Tornar a planilha **Consolidada** a fonte oficial do acervo: cada obra de parede passa a usar o **Nº de impressão** da planilha (1–88) e recebe os dados atualizados de **Título, Ano, Técnica, Dimensão e Parede**. Os textos de audiodescrição, imagens e áudios já existentes são **preservados** e remapeados para o novo número. Vídeos e shapes ficam para depois (apenas mantidos no final, sem alteração).

## O que muda para o visitante

- A numeração do site passa a bater com o catálogo impresso (ex.: "Gabriela" vira a obra **#1**; "Secos e Molhados, Opinião" vira **#2**).
- Ficha técnica de cada obra corrigida conforme a planilha.
- Nenhuma audiodescrição, imagem ou áudio é perdido — tudo acompanha a obra para o novo número.

## Mapa de numeração (resumo)

As 88 obras de parede recebem o Nº da planilha. As obras que existem no site mas **não** estão na planilha (Arca de Noé 2, Brasil História, Calunga, Legião Estrangeira, Movimento, Fátima Guedes ×2, Mão/Movimento, Muro de Arrimo, O Processo, Papai Noel, Pixinguinha) e os **duplicados** (2ª "Pirotecnico Zacarias", 2ª e 3ª "Passaros") vão para o **final da lista** (89 em diante), preservando seus dados. Vídeos e shapes seguem no fim.

Trechos principais do remapeamento (antigo → novo):

```text
115 → 1    Gabriela            1 → 2     Secos e Molhados
2 → 3      Arca de Noé         97 → 27   Dom Paulo (= "Opinião_DOM PAULO")
92 → 48    Samba de Dandara    100 → 84  Nervos de Aço
91 → 81    Encarte Cavaquinho  78 → 83   Passaros (mantida)
26 → 89    Pirotecnico (dup)   80,81 → 90,91  Passaros (dups)
86..101 → 92..103   (obras fora da planilha)
102..114 → 104..116 (vídeos)   116 → 117 (shapes)
```

Correspondências por título com ajustes manuais nas quase-iguais:
"Dom Paulo, Opinião"="Opinião_DOM PAULO"; "Pirotecnico Zacarias"="Capa Pirotecnico Zacarias"; "Encarte disco Paulinho da Viola"="Encarte Cavaquinho".

Observação: a planilha tem **#30 "Paulinho da Viola – Homenagem a Heitor dos Prazeres"** que hoje existe só como obra cadastrada no painel (não no arquivo estático). Ela será preenchida com os dados da planilha (sem imagem/áudio até serem gerados) para o número 30 não ficar vago.

## Etapas técnicas

### 1. Reescrever `src/data/obras.ts`
- Gerar a lista com os **novos números** conforme o mapa.
- Para as 88 obras de parede: aplicar **Título, Ano, Técnica, Dimensão e Parede** da planilha; manter `descricao`, `imagem` e `audio` herdados da obra correspondente.
- Obras fora da planilha e duplicados: mantidos no final com os dados atuais.
- Adicionar entrada estática para a obra **#30** (Homenagem a Heitor) com a ficha da planilha.

### 2. Renomear os ponteiros de mídia
- Em `src/assets/obras/` e `src/assets/audio/`, renomear `obra-<antigo>.jpg.asset.json` e `obra-<antigo>.mp3.asset.json` para o **novo número**, seguindo o mesmo mapa (feito via cópia em ordem segura para evitar colisões). Assim cada obra mantém sua imagem e áudio.

### 3. Migração no banco (remapear edições para o novo número)
Aplicar o mesmo mapa antigo→novo em:
- `obra_overrides.num` — textos editados hoje em 78→83, 81→91, 115→1 (e 1→2).
- `obras_ocultas.num` — itens ocultos (86–101, 116) movidos para seus novos números.
- `acervo_ordem.chave` — preservar a ordenação manual reapontando para os novos números (chaves ≥1000 das obras cadastradas no painel permanecem).
- A migração será feita com uma tabela de-para temporária e atualização em bloco, sem perder linhas.

### 4. Reconciliar obras cadastradas no painel (`obras_extras`)
- "Samba de Dandara" passa a existir como obra estática **#48** e também como cadastro (nº 1006): manter a estática e **ocultar/remover** o cadastro duplicado.
- "Homenagem a Heitor" (cadastro 1000) vira a estática **#30**: mesma reconciliação.
- Shapes (1001–1005) ficam intocados (tratamento adiado).

### 5. Conferência
- Validar build, abrir o acervo e checar: contagem por parede igual à planilha (Parede 1: 11, Parede 2: 27, Parede 3: 47, Parede 4: 7 + Trainel 1), fichas corretas em amostras (#1 Gabriela, #2 Secos, #56 Adoniran), e que imagens/áudios/textos seguiram corretamente após o remapeamento.

## Riscos e cuidados

- Renumerar é destrutivo; por isso o de-para é aplicado de forma **idêntica** em arquivo estático, mídias e banco, e validado por contagem antes/depois.
- "Imprimir? = Não" não altera visibilidade (conforme sua escolha de manter visíveis).
- Vídeos e shapes não recebem dados novos agora — apenas mantêm posição no fim.
