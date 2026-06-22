O MP4 demora porque o processo tem duas partes inevitavelmente pesadas:

1. A gravação do vídeo acontece em tempo real
- Se o áudio tem 60 segundos, a captura precisa acompanhar esses 60 segundos.
- Reduzir resolução não muda essa parte: ela só reduz o peso do arquivo e o tempo da conversão depois.

2. A conversão para MP4 é feita no navegador
- O app grava primeiro um vídeo bruto/webm e depois converte para MP4 usando ffmpeg em WebAssembly.
- Isso usa CPU do computador/celular do usuário, não um servidor dedicado.
- MP4 com H.264 é mais compatível com redes sociais, mas é mais lento para codificar.
- A redução para 720×1280 ajuda bastante, mas não elimina o custo da conversão.

Plano para acelerar mais, se aprovado:

1. Trocar o preset do encoder para ultrafast
- Mantém MP4/H.264.
- Reduz bastante o tempo de conversão.
- Pode aumentar um pouco o tamanho do arquivo ou reduzir levemente a compressão.

2. Mostrar progresso real da etapa de conversão
- Hoje a demora pode parecer travamento depois que a geração chega a 99%.
- Exibir “Convertendo para MP4” com percentual/etapa deixará claro que ainda está processando.

3. Manter fallback em WebM
- Se MP4 demorar ou falhar no dispositivo, o usuário ainda consegue baixar o WebM.

Detalhe técnico:
- A mudança principal seria ajustar os argumentos do ffmpeg em `GeradorReels.tsx`, usando `-preset ultrafast` e mantendo 720×1280.
- Isso não remove a gravação em tempo real, mas acelera a etapa mais pesada depois da gravação.