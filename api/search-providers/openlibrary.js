import axios from 'axios';

const OL_BASE = 'https://openlibrary.org';

export async function searchOpenLibrary(query, options = {}) {
  const { limit = 4 } = options;

  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    fields: 'key,title,author_name,first_publish_year,language,subject,publisher',
  });

  const response = await axios.get(`${OL_BASE}/search.json?${params.toString()}`, {
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'PontoSchool-Jota/1.0 (jota@pontoschool.com)',
    },
  });

  const docs = response.data?.docs || [];

  return docs
    .filter(r => r.title && r.author_name && r.first_publish_year)
    .map(r => {
      const url = `${OL_BASE}${r.key}`;
      const authors = (r.author_name || []).slice(0, 2).join(', ');
      const subjects = (r.subject || []).slice(0, 3).join(', ');
      const publishers = (r.publisher || []).slice(0, 1).join('');

      const snippet = [
        `Livro publicado em ${r.first_publish_year}`,
        authors ? `Autores: ${authors}` : '',
        subjects ? `Temas: ${subjects}` : '',
        publishers ? `Editora: ${publishers}` : '',
      ].filter(Boolean).join('. ').slice(0, 400);

      return {
        title: r.title || '',
        url,
        snippet,
        year: r.first_publish_year || null,
        authors,
        subjects,
        languages: r.language || [],
        source_type: 'book',
        provider: 'openlibrary',
      };
    });
}
