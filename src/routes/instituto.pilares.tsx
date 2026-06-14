import { createFileRoute } from "@tanstack/react-router";
import { PaginaArtigo } from "@/components/PaginaArtigo";

const TITULO = "Pilares";
const DESC =
  "Conheça os pilares do Instituto Elifas Andreato: Preservação do acervo, Difusão da obra e Ação Educativa, democratizando a memória e a cultura brasileira.";
const URL = "https://institutoelifasandreato.org.br/instituto/pilares";

export const Route = createFileRoute("/instituto/pilares")({
  head: () => ({
    meta: [
      { title: "Pilares — O Instituto" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Pilares — O Instituto" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: () => (
    <PaginaArtigo
      titulo={TITULO}
      paragrafos={[
        "Como o legado de um artista de origens operárias, que dedicou sua vida a desenhar para o povo, se mantém vivo e operante? O Instituto Elifas Andreato atua estrategicamente a partir de três eixos fundamentais: Preservação, Difusão e Ação Educativa. Essa tríade institucional garante não apenas a proteção do patrimônio físico contra o desgaste do tempo, mas também o acesso público e a democratização perene do conhecimento contido em cada traço, pincelada e manifesto.",
        "No pilar da Preservação, conduzimos um meticuloso trabalho de arqueologia e arquivologia contemporânea. O Instituto é responsável pelo acondicionamento técnico, higienização e catalogação de quase 7.000 unidades documentais — que incluem matrizes físicas, cadernos manuscritos, capas de discos icônicos e cartazes da imprensa alternativa. Através da digitalização de alta resolução, criamos um banco de dados seguro, assegurando que o substrato frágil da história brasileira seja salvo da degradação.",
        "A Difusão é o braço que rompe barreiras geográficas e devolve a arte à sociedade. Realizamos a organização de exposições temáticas de grande porte (físicas e virtuais), o licenciamento organizado de imagens e a publicação de obras inéditas e catálogos de arte. Por meio de plataformas globais e exposições itinerantes, fazemos com que os contornos da música carioca, do samba e das lutas sociais transitem livremente, alcançando o grande público e consolidando um acervo acessível a todos.",
        "Por fim, a Ação Educativa transforma a memória em ferramenta de transformação cívica. Inspirados pelo autodidatismo e pela sensibilidade de Elifas para com as infâncias e as classes trabalhadoras, promovemos oficinas comunitárias de arte gráfica, formação de educadores e palestras que utilizam as capas de discos e as ilustrações políticas como fontes primárias para o ensino de História e Cultura. A mediação cultural atua diretamente em escolas e praças públicas, plantando sementes de letramento visual, senso crítico e cidadania.",
      ]}
    />
  ),
});
