/**
 * NÃO use este script no mockup da plataforma.
 *
 * O arquivo enviado pelo chat chega como JPEG (sem alpha), mesmo com extensão .png.
 * Remover o fundo preto com threshold gera bordas esverdeadas/irregulares
 * quando a aura verde do site fica atrás da imagem.
 *
 * Solução correta:
 * 1) Coloque o PNG exportado com transparência real em mockup-plataforma.png
 *    (arraste direto na pasta do projeto, sem passar pelo chat), OU
 * 2) Use mix-blend-mode: screen no CSS (já aplicado no index.html).
 */
