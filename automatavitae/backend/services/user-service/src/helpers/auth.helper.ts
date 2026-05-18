export interface OAuthUserProfile {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
}

interface GoogleTokenPayload {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}

interface GithubUserPayload {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url?: string;
}

interface GithubEmailPayload {
    email: string;
    primary: boolean;
    verified: boolean;
}

export class OAuthHelper {
    // Validar Token de Google (Access Token recibido del Frontend con useGoogleLogin)
    static async verifyGoogleToken(accessToken: string): Promise<OAuthUserProfile> {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                throw new Error('Token de Google inválido');
            }

            const data = await response.json() as GoogleTokenPayload;

            return {
                id: data.sub, // ID único de Google
                email: data.email,
                fullName: data.name,
                avatarUrl: data.picture
            };
        } catch (error) {
            throw new Error('Error al verificar identidad con Google');
        }
    }

    // Intercambiar Code de GitHub por Access Token
    static async exchangeGithubCodeForToken(code: string): Promise<string> {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Configuración de GitHub incompleta en el backend');
        }

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code
            })
        });

        const data = await response.json() as { access_token?: string; error?: string };

        if (data.error || !data.access_token) {
            throw new Error(`Error de GitHub: ${data.error || 'Token no recibido'}`);
        }

        return data.access_token;
    }

    // Validar Token de GitHub (Access Token recibido del Frontend)
    static async verifyGithubToken(accessToken: string): Promise<OAuthUserProfile> {
        try {
            // 1. Obtener perfil básico de GitHub
            const userResponse = await fetch('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!userResponse.ok) throw new Error('Token de GitHub inválido');
            const userData = await userResponse.json() as GithubUserPayload;

            // 2. GitHub no siempre expone el email público, lo consultamos explícitamente
            const emailsResponse = await fetch('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            let email = userData.email;
            if (emailsResponse.ok) {
                const emails = await emailsResponse.json() as GithubEmailPayload[];
                const primaryEmail = emails.find((e) => e.primary && e.verified);
                if (primaryEmail) email = primaryEmail.email;
            }

            return {
                id: userData.id.toString(), // ID único de GitHub
                email: email || `${userData.login}@github.placeholder`, // Fallback si no hay email
                fullName: userData.name || userData.login,
                avatarUrl: userData.avatar_url
            };
        } catch (error) {
            throw new Error('Error al verificar identidad con GitHub');
        }
    }
}