import {
  PublicClientApplication,
  type Configuration,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser';

export type OneDriveAccountType = 'personal' | 'work';

function getMicrosoftClientId(): string | null {
  return import.meta.env.VITE_MICROSOFT_CLIENT_ID || null;
}

export function isOneDriveConfigured(): boolean {
  return Boolean(getMicrosoftClientId());
}

const authorityMap: Record<OneDriveAccountType, string> = {
  personal: 'https://login.microsoftonline.com/consumers',
  work: 'https://login.microsoftonline.com/organizations',
};

const scopes = ['Files.ReadWrite', 'User.Read'];

function createMSALInstance(accountType: OneDriveAccountType): PublicClientApplication {
  const clientId = getMicrosoftClientId();
  if (!clientId) {
    throw new Error('VITE_MICROSOFT_CLIENT_ID não configurado');
  }

  const msalConfig: Configuration = {
    auth: {
      clientId,
      authority: authorityMap[accountType],
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
  };

  return new PublicClientApplication(msalConfig);
}

async function acquireToken(
  msalInstance: PublicClientApplication,
  account: AccountInfo | null
): Promise<string> {
  const silentRequest = {
    scopes,
    account: account || undefined,
  };

  try {
    if (account) {
      const silentResult: AuthenticationResult =
        await msalInstance.acquireTokenSilent(silentRequest);
      return silentResult.accessToken;
    }
  } catch {
    // Token expired or not cached — fall through to popup
  }

  const popupResult: AuthenticationResult = await msalInstance.acquireTokenPopup({
    scopes,
  });
  return popupResult.accessToken;
}

async function uploadFileToOneDrive(
  accessToken: string,
  content: string | Blob,
  filename: string,
  mimeType: string
): Promise<{ id: string; name: string; webUrl?: string }> {
  const fileBlob =
    typeof content === 'string'
      ? new Blob([content], { type: mimeType })
      : content;

  const safeFilename = encodeURIComponent(filename);
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${safeFilename}:/content`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': mimeType,
    },
    body: fileBlob,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao fazer upload para o OneDrive: ${errText}`);
  }

  return response.json();
}

async function saveToOneDrive(
  content: string | Blob,
  filename: string,
  mimeType: string,
  accountType: OneDriveAccountType
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    const msalInstance = createMSALInstance(accountType);
    await msalInstance.initialize();

    const accounts = msalInstance.getAllAccounts();
    const account = accounts.length > 0 ? accounts[0] : null;

    let accessToken: string;
    if (account) {
      accessToken = await acquireToken(msalInstance, account);
    } else {
      const loginResult: AuthenticationResult = await msalInstance.loginPopup({
        scopes,
      });
      accessToken = loginResult.accessToken;
    }

    const result = await uploadFileToOneDrive(accessToken, content, filename, mimeType);
    return {
      success: true,
      fileUrl: result.webUrl,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    if (message.includes('user_cancelled') || message.includes('User cancelled')) {
      return { success: false, error: 'Autenticação cancelada pelo usuário' };
    }
    if (message.includes('popup_window_error')) {
      return {
        success: false,
        error: 'Popup bloqueado pelo navegador. Por favor, permita popups para este site.',
      };
    }
    return { success: false, error: message };
  }
}

export async function saveMarkdownToOneDrive(
  content: string,
  filename: string,
  accountType: OneDriveAccountType = 'personal'
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  return saveToOneDrive(content, filename, 'text/markdown', accountType);
}

export async function savePDFToOneDrive(
  blob: Blob,
  filename: string,
  accountType: OneDriveAccountType = 'personal'
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  return saveToOneDrive(blob, filename, 'application/pdf', accountType);
}

export async function saveDocxToOneDrive(
  blob: Blob,
  filename: string,
  accountType: OneDriveAccountType = 'personal'
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  return saveToOneDrive(
    blob,
    filename,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    accountType
  );
}
