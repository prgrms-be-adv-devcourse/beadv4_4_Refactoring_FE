// 개발 환경에서는 Vite 프록시 사용 (CORS 우회), 프로덕션에서는 환경변수 사용
const API_BASE_URL = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_BASE_URL || 'https://api.thock.site');

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    processQueue(error, token = null) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) reject(error);
            else resolve(token);
        });
        this.failedQueue = [];
    }

    async refreshToken() {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        try {
            const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) throw new Error('Token refresh failed');

            const data = await response.json();
            sessionStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } catch (error) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            throw error;
        }
    }

    async request(endpoint, options = {}, isCritical = false) {
        let url = `${this.baseURL}${endpoint}`;

        if (options.params) {
            const params = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value);
                }
            });
            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        const isFormData = options.body instanceof FormData;

        const headers = { ...(options.headers || {}) };
        if (!isFormData) headers['Content-Type'] = 'application/json';

        const token = sessionStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const config = { ...options, headers };

        try {
            if (import.meta.env.DEV) {
                console.log(`➡️ API 요청: ${options.method || 'GET'} ${url}`);
                if (headers['Authorization']) {
                    console.log('🔑 Auth Token attached');
                } else {
                    console.log('❌ No Auth Token sent');
                }
            }

            const response = await fetch(url, config);

            if (import.meta.env.DEV) {
                console.log(`⬅️ 응답 상태: ${response.status}`);
            }

            // 토큰 자동 갱신 제외 엔드포인트
            const skipRefresh = ['/refresh', '/error', '/login', '/signup', '/signin'];
            const shouldSkipRefresh = skipRefresh.some(skip => endpoint.startsWith(skip));
            const isRetry = options._isRetryAttempt === true;

            if (response.status === 401 && token && !shouldSkipRefresh && !isRetry && !isCritical) {
                if (this.isRefreshing) {
                    return new Promise((resolve, reject) => {
                        this.failedQueue.push({ resolve, reject });
                    }).then(() => this.request(endpoint, { ...options, _isRetryAttempt: true }));
                }

                this.isRefreshing = true;
                try {
                    const newToken = await this.refreshToken();
                    this.processQueue(null, newToken);
                    return this.request(endpoint, { ...options, _isRetryAttempt: true });
                } catch (err) {
                    this.processQueue(err, null);
                    console.error('토큰 갱신 실패, 로그인 페이지로 이동');
                    window.location.href = '/login';
                    throw err;
                } finally {
                    this.isRefreshing = false;
                }
            }

            if (response.status === 401 && isRetry) {
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                window.location.href = '/login';
                throw new Error('인증 실패: 다시 로그인해주세요.');
            }

            // 응답 처리
            const text = await response.text();
            let data = null;

            if (text) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        data = JSON.parse(text);
                    } catch (err) {
                        console.error('JSON 파싱 실패:', text);
                        throw new Error('서버 응답을 해석할 수 없습니다.');
                    }
                } else {
                    data = text;
                }
            }

            if (!response.ok) {
                const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
                error.response = { status: response.status, data };
                throw error;
            }

            return data; // DTO 그대로 반환
        } catch (err) {
            if (!err.response) {
                if (err.name === 'AbortError') {
                    const timeoutErr = new Error('요청 시간 초과');
                    timeoutErr.type = 'TIMEOUT_ERROR';
                    throw timeoutErr;
                }
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    const networkErr = new Error('서버 연결 실패');
                    networkErr.type = 'NETWORK_ERROR';
                    throw networkErr;
                }
            }
            throw err;
        }
    }

    // GET, POST, PUT, DELETE, PATCH
    get(endpoint, options = {}) { return this.request(endpoint, { ...options, method: 'GET' }); }

    /**
     * @param endpoint
     * @param data
     * @param options
     * @param isCritical - 자동 토큰 갱신 + 재시도 로직 동작
     * 일반 요청은 isCritical = false 또는 생략 / 결제, 정산등 요청에서는 재시도 못하도록 true로 설정
     * @returns {Promise<*|null|undefined>}
     */
    post(endpoint, data, options = {}, isCritical = false) {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return this.request(endpoint, { ...options, method: 'POST', body }, isCritical);
    }
    put(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }); }
    delete(endpoint, options = {}) { return this.request(endpoint, { ...options, method: 'DELETE' }); }
    patch(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }); }

    requestWithTimeout(endpoint, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        return this.request(endpoint, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(timeoutId));
    }
}

const apiClient = new ApiClient();
export default apiClient;
