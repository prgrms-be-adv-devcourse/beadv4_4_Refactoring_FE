import apiClient from '../apiClient';

class AuthApi {
    // 로그인
    async signin({ email, password }) {
        try {
            const response = await apiClient.post('/api/v1/auth/login', { email, password });

            // 토큰 저장
            if (response.accessToken) sessionStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) sessionStorage.setItem('refreshToken', response.refreshToken);

            return { success: true, data: response };
        } catch (error) {
            console.error('로그인 에러:', error);
            const errData = error.response?.data;

            return {
                success: false,
                error: {
                    code: errData?.code,
                    message: errData?.message,
                    status: errData?.status,
                    timestamp: errData?.timestamp
                }
            };
        }
    }

    // 회원가입
    async signup({ email, name, password }) {
        try {
            const response = await apiClient.post('/api/v1/members/signup', { email, name, password });
            return { success: true, data: response };
        } catch (error) {
            console.error('회원가입 에러:', error);
            const errData = error.response?.data;
            return {
                success: false,
                error: {
                    message: errData?.message || '회원가입에 실패했습니다.'
                }
            };
        }
    }

    // 토큰 갱신
    async refresh(refreshToken) {
        try {
            const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken });
            sessionStorage.setItem('accessToken', response.accessToken);
            return { success: true, data: response };
        } catch (error) {
            console.error('토큰 갱신 에러:', error);
            return { success: false, error: { message: '토큰 갱신 실패', code: 'GLOBAL-500-1' } };
        }
    }

    // TODO : 로그아웃
    // async signout() {
    //     try {
    //         const refreshToken = sessionStorage.getItem('refreshToken');
    //         if (refreshToken) {
    //             await apiClient.post('/api/v1/auth/signout', { refreshToken });
    //         }
    //     } catch (error) {
    //         console.warn('로그아웃 API 실패:', error);
    //     } finally {
    //         this.clearTokens();
    //         return { success: true };
    //     }
    // }

    // 토큰 관리
    saveTokens(accessToken, refreshToken) {
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
    }

    clearTokens() {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
    }

    getAccessToken() {
        return sessionStorage.getItem('accessToken');
    }

    getRefreshToken() {
        return sessionStorage.getItem('refreshToken');
    }

    isLoggedIn() {
        return !!this.getAccessToken();
    }
}

const authApi = new AuthApi();
export default authApi;
