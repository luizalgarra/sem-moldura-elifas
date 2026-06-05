## Objetivo

No controle global de voz, separar Carla e Danilo Tenfen em **dois botões lado a lado**, cada um com sua própria amostra. Clicar em um botão define essa voz como a usada para regenerar o áudio.

## O que muda

Editar apenas `src/routes/admin.tsx`.

### Controle global (topo)

- Remover o `<Select>` único de voz padrão.
- Mostrar dois botões lado a lado:
  - **Carla (feminina)** — `7eUAxNOneHxqfyRS77mW`
  - **Danilo Tenfen (masculina)** — `rVRk0uJAtO8T38Gm03mf`
- O botão correspondente à voz ativa fica destacado (variant `default`); o outro fica como `outline`. Clicar troca a voz ativa (`vozGlobal`).
- Ao lado de cada botão, um botão menor **Ouvir amostra** que toca a amostra daquela voz específica (reaproveita `amostraVoz` e o cache existente).

### Restante

- A voz ativa (`vozGlobal`) continua sendo passada para cada `ObraEditor` e usada na regeneração — sem mudanças nessa parte nem nos componentes de obra.

## Detalhes técnicos

- A função de amostra passa a receber o `id` da voz como argumento (em vez de usar só `vozGlobal`), para tocar a amostra de qualquer um dos dois botões.
- Estado de "tocando amostra" por voz (ou um id em carregamento) para mostrar o spinner no botão certo.
