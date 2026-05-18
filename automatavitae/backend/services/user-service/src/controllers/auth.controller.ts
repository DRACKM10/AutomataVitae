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
            // req.user viene cargado desde el middleware
            res.status(200).json({ user: req.user });
        } catch (error) {
            res.status(500).json({ error: 'Error al recuperar perfil' });
        }
    }
}