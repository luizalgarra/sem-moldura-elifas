# Histórico — Audiodescrição + Geração de Locução

## 1. Sintoma relatado
- Geração de audiodescrição "ficava girando e parou".
- Locução era gerada mas "não salvava e voltava ao estado anterior".

## 2. Dúvida sobre interferência
- Pergunta: salvar a audiodescrição recém-gerada interfere na geração da locução?
- Conclusão: NÃO interfere. Ambas as ações usam o mesmo texto do campo no
  momento da ação, sem cópia intermediária. A geração de locução salva o texto
  no banco ANTES de gerar o áudio. Salvar é opcional e seguro.

## 3. Investigação aprofundada (locução não salva)
Arquivos analisados: admin-obras.functions.ts, admin.tsx, AudioDescricao.tsx,
obras.$num.tsx. Logs verificados: regenerarAudio, upload, ElevenLabs.
Banco consultado: obra_overrides, obra_versoes, storage.objects.

Achados:
- O áudio era realmente gerado e salvo no armazenamento (obra-1-fem-...mp3),
  mas havia arquivos órfãos no storage sem referência no banco.
- Causa raiz da percepção de "voltou ao estado": após refetch(), o ObraEditor
  mantinha estados locais (versaoAudio, audiodescricao) derivados do override
  antigo e não sincronizava com os dados novos.
- Risco de órfãos: o áudio era enviado ao storage ANTES do registro final no
  banco. Falha nesse intervalo deixava MP3 órfão e tela sem áudio salvo.

## 4. Correções implementadas
src/lib/admin-obras.functions.ts
- Preservação do áudio anterior em caso de falha no registro final: se o upsert
  falhar, o novo arquivo é removido do storage e a função retorna erro claro.
- Adicionado audioPath ao retorno de sucesso.

src/routes/admin.tsx
- versaoAudio passa a ser inicializado por versaoDeOverride(override).
- useEffect sincroniza versaoAudio com o banco quando override.audioFemPath /
  override.updatedAt mudam.
- handleRegenerar usa r.versao (versão salva pelo backend) e exibe
  "Locução gerada e salva."

## 5. Estado atual
- Locução persiste no banco e a tela reflete o áudio salvo após refetch().
- Pendente: confirmar com o usuário se o problema foi resolvido na prática.
