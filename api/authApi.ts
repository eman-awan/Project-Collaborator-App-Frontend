import apiURL from "@/api/axios";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
}

export interface SignInResponse {
  access_token: string;
  isTwoFactorAuthenticationEnabled?: boolean
}

export interface SignUpResponse {
  email: string;
  message: string;
}

export interface FetchUserDataResponse {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isOnboarded: boolean;
  role: 'user';
  isTwoFactorAuthenticationEnabled: boolean;
}

export interface VerifyOtpPayload {
  email: string,
  otp: string
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface UpdateProfileResponse {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  // etc
}

// 🔹 Function for sign in
export async function signinFn(credentials: SignInCredentials): Promise<SignInResponse> {
  try {
    const response = await apiURL.post("/auth/signin", credentials);
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}

export async function checkIfEmailInUse(email: string): Promise<boolean> {
  try {
    const response = await apiURL.post("/auth/email", { email });
    return response.data.available;
  } catch (err: any) {
    console.error('Email check API error:', err);
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    if (err.message) {
      throw new Error(err.message);
    }
    throw new Error("Something went wrong");
  }
}


// 🔹 Function for sign up
export async function signupFn(newUser: SignUpCredentials): Promise<SignUpResponse> {
  try {
    const response = await apiURL.post("/auth/signup", newUser);
    return {
      message: response.data.message,
      email: response.data.email,
    };
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}


export async function resendVerificationEmail(email: string) {
  try {
    const response = await apiURL.post("/auth/resend-otp", { email });
    return {
      message: response.data.message,
    };
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}

export async function verifyOTP(body: VerifyOtpPayload) {
  try {
    const response = await apiURL.post("/auth/verify-email", body);
    return {
      message: response.data.message,
    };
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}


export async function fetchUserData(): Promise<FetchUserDataResponse> {
  try {
    const response = await apiURL.get("/auth/my"); // Protected route
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}

type GenerateQrCodeResponse = {
  qrCode: string;
  authUrl: string;
}

export async function generateQRCode(): Promise<GenerateQrCodeResponse> {
  try {
    const response = await apiURL.post('auth/2fa/generate')
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}


export async function verifyAndEnableTwoFa(code: string): Promise<string> {
  try {
    const response = await apiURL.post('auth/2fa/turn-on', { twoFactorAuthenticationCode: code });
    return response.data.message;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}

export async function disableTwoFaApi(): Promise<string> {
  try {
    const response = await apiURL.post('auth/2fa/turn-off');
    return response.data.message;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}

export async function authenticateWith2FA(data: { twoFactorAuthenticationCode: string }): Promise<{
  access_token: string,
  isTwoFactorAuthenticationEnabled: boolean,
}> {
  try {
    const response = await apiURL.post('auth/2fa/authenticate', data);
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Something went wrong");
  }
}


export async function updateUserAvatarUrlApi(avatarUrl: string): Promise<{ avatarUrl: string }> {
  try {
    const response = await apiURL.patch('/users/avatarUrl', { avatarUrl });
    return response.data;  // assuming backend returns { avatarUrl: string }
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error('Something went wrong');
  }
}


export async function updateUserProfileApi(data: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  try {
    const response = await apiURL.patch('/users/profile', data);
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error('Something went wrong');
  }
}