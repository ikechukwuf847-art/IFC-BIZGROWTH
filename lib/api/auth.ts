const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  [key: string]: unknown;
};

async function callFunction<T extends ApiResponse>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  let data: T;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data.success) {
    const error = new Error(
      data.error || "Something went wrong. Please try again.",
    );

    (
      error as Error & {
        status?: number;
        code?: string;
        data?: T;
      }
    ).status = response.status;

    (
      error as Error & {
        status?: number;
        code?: string;
        data?: T;
      }
    ).code = data.code;

    (
      error as Error & {
        status?: number;
        code?: string;
        data?: T;
      }
    ).data = data;

    throw error;
  }

  return data;
}

/* =========================
   SIGN UP
========================= */

export type SignupResponse = {
  success: boolean;
  message: string;
  user_id: string;
  email: string;
  expires_in_seconds: number;
};

export async function signup(
  email: string,
  password: string,
): Promise<SignupResponse> {
  return callFunction<SignupResponse>("signup", {
    email,
    password,
  });
}

/* =========================
   VERIFY OTP
========================= */

export type VerifyOtpResponse = {
  success: boolean;
  message: string;
  user_id: string;
  email: string;
};

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<VerifyOtpResponse> {
  return callFunction<VerifyOtpResponse>("verify-otp", {
    email,
    otp,
  });
}

/* =========================
   RESEND OTP
========================= */

export type ResendOtpResponse = {
  success: boolean;
  message: string;
  expires_in_seconds?: number;
  retry_after_seconds?: number;
};

export async function resendOtp(
  email: string,
): Promise<ResendOtpResponse> {
  return callFunction<ResendOtpResponse>("resend-otp", {
    email,
  });
}

/* =========================
   LOGIN
========================= */

export type LoginResponse = {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number | null;
    expires_in: number;
    token_type: string;
  };
};

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return callFunction<LoginResponse>("login", {
    email,
    password,
  });
}

/* =========================
   FORGOT PASSWORD
========================= */

export type ForgotPasswordResponse = {
  success: boolean;
  message: string;
  expires_in_seconds?: number;
  retry_after_seconds?: number;
};

export async function forgotPassword(
  email: string,
): Promise<ForgotPasswordResponse> {
  return callFunction<ForgotPasswordResponse>("forgot-password", {
    email,
  });
}

/* =========================
   RESET PASSWORD
========================= */

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  return callFunction<ResetPasswordResponse>("reset-password", {
    email,
    otp,
    new_password: newPassword,
  });
}
