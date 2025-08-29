import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('access_token'); // adapte si tu stockes ailleurs
    if (!token) return next(req);

    return next(
        req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
            withCredentials: true
        })
    );
};