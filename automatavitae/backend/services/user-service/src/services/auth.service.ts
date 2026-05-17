import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { OAuthHelper, OAuthUserProfile } from '../helpers/auth.helper';

const userRepository = new UserRepository();

export class AuthService {
    // Lógica de Registro
    async register(fullName: string, email: string, passwordPlain: string) {
        // 1. Verificar si el email ya está registrado
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('EL_EMAIL_YA_EXISTE');
        }

        // 2. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordPlain, salt);

        // 3. Guardar en base de datos
        const newUser = await userRepository.create(fullName, email, passwordHash);

        // 4. Generar el token JWT para loguearlo de una vez
        const token = this.generateToken(newUser.id, newUser.email);

        return { user: newUser, token };
    }

    // Lógica de Login
    async login(email: string, passwordPlain: string) {
        // 1. Buscar usuario
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('CREDENCIALES_INVALIDAS');
        }

        // 2. Si se registró con Google/Git y no tiene contraseña local
        if (!user.password_hash) {
            throw new Error('CUENTA_REGISTRADA_CON_OAUTH');
        }

        // 3. Validar contraseña
        const isMatch = await bcrypt.compare(passwordPlain, user.password_hash);
        if (!isMatch) {
            throw new Error('CREDENCIALES_INVALIDAS');
        }

        // 4. Generar token
        const token = this.generateToken(user.id, user.email);

        // No devolvemos el password_hash al frontend por seguridad
        const { password_hash, ...userProfile } = user;

        return { user: userProfile, token };
    }
    // Lógica unificada para procesar el login de Terceros
    async loginWithOAuth(provider: 'google' | 'github', tokenOrCode: string) {
        // 1. Validar externamente usando el Helper aislado
        let profile: OAuthUserProfile;
        if (provider === 'google') {
            profile = await OAuthHelper.verifyGoogleToken(tokenOrCode);
        } else {
            const accessToken = await OAuthHelper.exchangeGithubCodeForToken(tokenOrCode);
            profile = await OAuthHelper.verifyGithubToken(accessToken);
        }

        let user = provider === 'google'
            ? await userRepository.findByGoogleId(profile.id)
            : await userRepository.findByGithubId(profile.id);

        // 2. Si el usuario no existe por ID de proveedor, buscamos por email
        if (!user) {
            const existingEmailUser = await userRepository.findByEmail(profile.email);

            if (existingEmailUser) {
                // Vinculamos el proveedor a su cuenta existente
                user = await userRepository.linkOAuthProvider(existingEmailUser.id, provider, profile.id);
            } else {
                // Registramos un usuario nuevo sin contraseña local
                user = await userRepository.createOAuthUser(profile.fullName, profile.email, provider, profile.id, profile.avatarUrl);
            }
        }

        // 3. Emitir JWT de AutomataVitae
        const appToken = this.generateToken(user.id, user.email);
        const { password_hash, ...userProfile } = user;

        return { user: userProfile, token: appToken };
    }

    // Helper para firmar el token JWT
    private generateToken(userId: string, email: string): string {
        console.log("user-service signing with secret:", process.env.JWT_SECRET || 'fallback_secret');
        return jwt.sign(
            { userId, email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );
    }
}