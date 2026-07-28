import { CosmicParallaxBg } from "@/components/ui/parallax-cosmic-background";

/** Demo — uso na home TecnoCursos (CTA) */
const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <CosmicParallaxBg
        head="Pronto para transformar a gestão da sua empresa?"
        text="digitalizar processos, capacitar equipes, fortalecer a segurança"
        loop={true}
      />
    </div>
  );
};

export { DemoOne };
