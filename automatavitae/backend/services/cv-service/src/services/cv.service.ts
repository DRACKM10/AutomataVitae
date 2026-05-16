import { CvRepository } from '../repositories/cv.repository.js';

const cvRepository = new CvRepository();

export class CvService {
    async createNewCv(userId: string, resumeData: any) {
        if (!resumeData.personalInfo || !resumeData.personalInfo.title) {
            throw new Error('EL_TITULO_ES_OBLIGATORIO');
        }
        return await cvRepository.createFullResume(userId, resumeData);
    }

    async getUserCvs(userId: string) {
        return await cvRepository.findByUserId(userId);
    }

    async getCvDetails(resumeId: string, userId: string) {
        const cv = await cvRepository.findById(resumeId);
        if (!cv) throw new Error('CV_NO_ENCONTRADO');

        if (cv.user_id !== userId) throw new Error('ACCESO_DENEGADO');

        return cv;
    }
}