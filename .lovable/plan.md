Plano para fazer a página `/postar` realmente gerar e salvar os vídeos:

1. Corrigir o carregamento do FFmpeg no navegador
   - Trocar a URL fixa do core `@ffmpeg/core@0.12.10` por uma versão compatível com o pacote instalado (`@ffmpeg/ffmpeg@0.12.15`).
   - Incluir também o `workerURL`, que é necessário em alguns navegadores/ambientes para o FFmpeg WASM iniciar corretamente.
   - Melhorar a mensagem quando o FFmpeg falhar ao carregar, para a tela não parecer travada em “Gerando MP4 0%”.

2. Tornar a geração em lote mais transparente
   - Adicionar status de etapa por obra: carregando imagem, carregando áudio, carregando FFmpeg, gerando MP4 e salvando.
   - Exibir erros completos e úteis na lista da obra, em vez de mensagens genéricas.

3. Evitar travamento silencioso
   - Validar explicitamente se o canvas existe antes de iniciar a geração.
   - Adicionar tratamento para falha ao baixar imagem/áudio, falha de CORS/asset e falha de encode.
   - Garantir que, se uma obra falhar, o lote siga para a próxima obra em vez de parar parecendo congelado.

4. Verificar no navegador
   - Reproduzir a geração de pelo menos uma obra em `/postar`.
   - Confirmar se o progresso sai de 0%, se a obra muda para “Salvando/Salvo” ou mostra erro acionável, e se a postagem aparece em `/postagens` quando salva.

Arquivos previstos:
- `src/lib/gerar-reels.ts`
- `src/routes/postar.index.tsx`
- possivelmente `src/components/GeradorReels.tsx` apenas se a correção do FFmpeg também precisar refletir no gerador individual.