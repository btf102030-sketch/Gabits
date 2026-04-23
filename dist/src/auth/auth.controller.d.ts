import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    signup(dto: SignupDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            onboardingCompleted: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            onboardingCompleted: any;
        };
    }>;
    me(user: {
        id: string;
        email: string;
        name: string;
    }): {
        user: {
            id: string;
            email: string;
            name: string;
        };
    };
}
