import { query } from '../config/db';

export class UserRepository {
    async findByEmail(email: string) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    async findByGoogleId(googleId: string) {
        const result = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        return result.rows[0] || null;
    }

    async findByGithubId(githubId: string) {
        const result = await query('SELECT * FROM users WHERE github_id = $1', [githubId]);
        return result.rows[0] || null;
    }

    async create(fullName: string, email: string, passwordHash: string) {
        const sql = `INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at;`;
        const result = await query(sql, [fullName, email, passwordHash]);
        return result.rows[0];
    }

    // Crear usuario desde Google o GitHub
    async createOAuthUser(fullName: string, email: string, provider: 'google' | 'github', providerId: string, avatarUrl?: string) {
        const googleId = provider === 'google' ? providerId : null;
        const githubId = provider === 'github' ? providerId : null;

        const sql = `
      INSERT INTO users (full_name, email, google_id, github_id, avatar_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, avatar_url, created_at;
    `;
        const result = await query(sql, [fullName, email, googleId, githubId, avatarUrl]);
        return result.rows[0];
    }

    // Vincular un proveedor a una cuenta de correo ya existente
    async linkOAuthProvider(userId: string, provider: 'google' | 'github', providerId: string) {
        const field = provider === 'google' ? 'google_id' : 'github_id';
        const sql = `UPDATE users SET ${field} = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, avatar_url;`;
        const result = await query(sql, [providerId, userId]);
        return result.rows[0];
    }
}