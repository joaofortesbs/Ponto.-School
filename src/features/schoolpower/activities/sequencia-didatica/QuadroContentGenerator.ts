
export class QuadroContentGenerator {
  static generateContent(data: any) {
    return {
      slides: [
        {
          slideNumber: 1,
          title: `Introdução: ${data.tituloTemaAssunto || 'Tema da Sequência'}`,
          content: `Esta é uma apresentação sobre ${data.tituloTemaAssunto || 'o tema escolhido'} para ${data.anoSerie || 'a série específica'}.`,
          visual: "Slide introdutório com elementos visuais relevantes ao tema.",
          audio: `Narração introdutória sobre ${data.tituloTemaAssunto || 'o tema'}.`
        },
        {
          slideNumber: 2,
          title: "Objetivos de Aprendizagem",
          content: data.objetivosAprendizagem || "Objetivos específicos da sequência didática.",
          visual: "Lista visual dos objetivos com ícones e elementos gráficos.",
          audio: "Narração detalhando cada objetivo de aprendizagem."
        }
      ]
    };
  }

  static validateContent(content: any): boolean {
    return content && 
           content.slides && 
           Array.isArray(content.slides) && 
           content.slides.length > 0;
  }
}

export default QuadroContentGenerator;
