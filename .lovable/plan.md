Diagnóstico confirmado: a chave está válida, mas a ElevenLabs está recusando a geração com `payment_required/payment_issue`: “Your subscription has a failed or incomplete payment”. Por isso o app mostra “Falha ao gerar áudio (401)”.

Plano:
1. Corrigir a cobrança/fatura pendente diretamente na conta ElevenLabs conectada (“Luiz's ElevenLabs”).
2. Depois disso, validar novamente a credencial com uma chamada não destrutiva à API.
3. Testar a geração de áudio no painel para confirmar que a locução é gerada e salva.
4. Se ainda falhar, ajustar o tratamento de erro no app para mostrar uma mensagem mais clara quando a ElevenLabs devolver problema de pagamento, em vez de apenas “401”.

Detalhe técnico:
- O servidor recebeu da ElevenLabs: `401 payment_required`, `code: payment_issue`, indicando problema de pagamento/assinatura, não chave inválida.