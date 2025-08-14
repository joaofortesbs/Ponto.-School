1:export class QuadroContentGenerator {
2:  static generateContent(data: any) {
3:    return {
4:      slides: [
5:        {
6:          slideNumber: 1,
7:          title: `Introdução: ${data.tituloTemaAssunto || 'Tema da Sequência'}`,
8:          content: `Esta é uma apresentação sobre ${data.tituloTemaAssunto || 'o tema escolhido'} para ${data.anoSerie || 'a série específica'}.`,
9:          visual: "Slide introdutório com elementos visuais relevantes ao tema.",
10:         audio: `Narração introdutória sobre ${data.tituloTemaAssunto || 'o tema'}.`
11:        },
12:        {
13:          slideNumber: 2,
14:          title: "Objetivos de Aprendizagem",
15:          content: data.objetivosAprendizagem || "Objetivos específicos da sequência didática.",
16:          visual: "Lista visual dos objetivos com ícones e elementos gráficos.",
17:          audio: "Narração detalhando cada objetivo de aprendizagem."
18:        }
19:      ]
20:    };
21:  }
22:
23:  static validateContent(content: any): boolean {
24:    return content && 
25:           content.slides && 
26:           Array.isArray(content.slides) && 
27:           content.slides.length > 0;
28:  }
29:}
30:
31:export default QuadroContentGenerator;