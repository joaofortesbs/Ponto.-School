declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GIS_SCRIPT_ID = 'gis-script';
let gisLoaded = false;

function loadGISScript(): Promise<void> {
  if (gisLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.getElementById(GIS_SCRIPT_ID)) {
      gisLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = GIS_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Falha ao carregar Google Identity Services'));
    document.head.appendChild(script);
  });
}

function getGoogleClientId(): string | null {
  return import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || null;
}

function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services não carregado'));
      return;
    }
    const clientId = getGoogleClientId();
    if (!clientId) {
      reject(new Error('VITE_GOOGLE_DRIVE_CLIENT_ID não configurado'));
      return;
    }
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || 'Falha na autenticação do Google'));
        } else {
          resolve(response.access_token);
        }
      },
    });
    tokenClient.requestAccessToken();
  });
}

async function uploadFileToDrive(
  accessToken: string,
  content: string | Blob,
  filename: string,
  mimeType: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata = {
    name: filename,
    mimeType,
    parents: ['root'],
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );

  const fileBlob =
    typeof content === 'string'
      ? new Blob([content], { type: mimeType })
      : content;
  form.append('file', fileBlob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao fazer upload para o Google Drive: ${errText}`);
  }

  return response.json();
}

export function isGoogleDriveConfigured(): boolean {
  return Boolean(getGoogleClientId());
}

export async function saveMarkdownToGoogleDrive(
  content: string,
  filename: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    await loadGISScript();
    const accessToken = await requestAccessToken();
    const result = await uploadFileToDrive(
      accessToken,
      content,
      filename,
      'text/markdown'
    );
    return {
      success: true,
      fileUrl: result.webViewLink,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return { success: false, error: message };
  }
}

export async function savePDFToGoogleDrive(
  blob: Blob,
  filename: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    await loadGISScript();
    const accessToken = await requestAccessToken();
    const result = await uploadFileToDrive(
      accessToken,
      blob,
      filename,
      'application/pdf'
    );
    return { success: true, fileUrl: result.webViewLink };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return { success: false, error: message };
  }
}

export async function saveDocxToGoogleDrive(
  blob: Blob,
  filename: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    await loadGISScript();
    const accessToken = await requestAccessToken();
    const result = await uploadFileToDrive(
      accessToken,
      blob,
      filename,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    return { success: true, fileUrl: result.webViewLink };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return { success: false, error: message };
  }
}
