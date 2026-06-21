import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { full_name, email, password } = req.body;

            if (!full_name || !email || !password) {
                res.status(400).json({ error: 'Todos los campos son obligatorios' });
                return;
            }

            const result = await authService.register(full_name, email, password);
            res.status(201).json(result);
        } catch (error: any) {
            console.error('Error in register:', error);
            if (error.message === 'EL_EMAIL_YA_EXISTE') {
                res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
            } else {
                res.status(500).json({ error: 'Error interno del servidor', details: error.message });
            }
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: 'Email y contraseña requeridos' });
                return;
            }

            const result = await authService.login(email, password);
            res.status(200).json(result);
        } catch (error: any) {
            console.error('Error in login:', error);
            if (error.message === 'CREDENCIALES_INVALIDAS') {
                res.status(401).json({ error: 'Credenciales incorrectas.' });
            } else if (error.message === 'CUENTA_REGISTRADA_CON_OAUTH') {
                res.status(400).json({ error: 'Esta cuenta utiliza inicio de sesión con Google o GitHub.' });
            } else {
                res.status(500).json({ error: 'Error interno del servidor', details: error.message });
            }
        }
    }

    async googleLogin(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body; // El idToken enviado por el front
            if (!token) { res.status(400).json({ error: 'Token de Google requerido' }); return; }

            const result = await authService.loginWithOAuth('google', token);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }

    async githubLogin(req: Request, res: Response): Promise<void> {
        try {
            const { code } = req.body; // El authorization code enviado por el front
            if (!code) { res.status(400).json({ error: 'Código de GitHub requerido' }); return; }

            const result = await authService.loginWithOAuth('github', code);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }

    // Endpoint protegido para obtener la info del usuario autenticado
    async getMe(req: Request, res: Response): Promise<void> {
        try {
            // req.user viene cargado desde el middleware, pero solo tiene userId y email
            const fullUser = await authService.getUserById(req.user!.userId);
            if (!fullUser) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }
            res.status(200).json({ 
                user: {
                    userId: fullUser.id,
                    email: fullUser.email,
                    fullName: fullUser.full_name,
                    picture: fullUser.avatar_url
                } 
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al recuperar perfil' });
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { fullName } = req.body;
            if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
                res.status(400).json({ error: 'El nombre es obligatorio.' });
                return;
            }
            const updated = await authService.updateProfile(userId, fullName.trim());
            if (!updated) {
                res.status(404).json({ error: 'Usuario no encontrado.' });
                return;
            }
            res.status(200).json({
                user: {
                    userId: updated.id,
                    email: updated.email,
                    fullName: updated.full_name,
                    picture: updated.avatar_url
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar perfil' });
        }
    }
}