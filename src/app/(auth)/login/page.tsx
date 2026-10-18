"use client";
import TextField from "@/common/form/TextField";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import InputField from "@/common/form/InputField";
import PasswordField from "@/common/form/PasswordField";
import ButtonField from "@/common/basic/ButtonField";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userApi, otpApi } from "@/common/utils/api";
import { responseError } from "@/common/utils/main.utils";
import FormStatusMessage, { SubmitStatusType } from "@/common/form/FormStatusMessage";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { MdPassword } from "react-icons/md";
import { ArrowLeftOutlined, MailOutlined, SafetyCertificateOutlined, CheckCircleFilled } from "@ant-design/icons";
import { APP_CONFIG } from "@/config/app.config";
import OtpField from "@/common/form/OtpField";

type AuthMode = "LOGIN" | "OTP" | "RESET";

const LoginPage = () => {
  const [authMode, setAuthMode] = useState<AuthMode>("LOGIN");

  return (
    <div className="flex justify-between w-full h-screen bg-background">
      {/* Left Panel */}
      <div className="w-[40%] flex flex-col items-center justify-between mt-[50px]">
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <Image src="/logo.png" alt={`${APP_CONFIG.name} Logo`} width={40} height={40} />
            <span className="font-bold text-xl text-text-primary tracking-wide">{APP_CONFIG.name}</span>
          </div>

          {authMode === "LOGIN" && <LoginForm setAuthMode={setAuthMode} />}
          {authMode === "OTP" && <OTPForm setAuthMode={setAuthMode} />}
          {authMode === "RESET" && <ResetPasswordForm setAuthMode={setAuthMode} />}
        </div>


        {/* Footer Copyright */}
        <div className="absolute bottom-8 lef text-xs text-gray-500">
          Copyright © 2026 {APP_CONFIG.name}™, All Rights Reserved.
        </div>
      </div>

      {/* Right Panel - CRM Overview */}
      <ImageSection />
    </div>
  );
};

export default LoginPage;

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

const LoginForm = ({ setAuthMode }: { setAuthMode: (mode: AuthMode) => void }) => {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatusType | null>(null);
  const methods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    setSubmitStatus(null);
    try {
      const payload = {
        email: data.email,
        password: data.password,
      };

      const res = await userApi.login(payload);
      const json = res.data;

      if (!json?.success) {
        setSubmitStatus({
          type: "error",
          text: json?.message || "Login failed",
        });
        return;
      }
      
      setSubmitStatus({
        type: "success",
        text: json?.message || "Login successful",
      });
      
      setTimeout(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl");

        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
      }, 500);

    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[380px]">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary mb-1">
          Welcome Back!
        </h2>
        <h3 className="text-lg font-bold text-primary">
          Login to access your account
        </h3>
      </div>

      <FormProvider {...methods}>
        <form
          className="flex flex-col gap-5 w-full"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-1.5">
            <TextField className="text-xs font-bold text-text-primary">
              Email Address
            </TextField>
            <InputField
              id="email"
              name="email"
              type="text"
              placeholder="Enter registered email address"
              control={methods.control as any}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <TextField className="text-xs font-bold text-text-primary">
              Password
            </TextField>
            <PasswordField
              id="password"
              name="password"
              placeholder="Enter password here"
              control={methods.control as any}
            />
          </div>

          <ButtonField
            htmlType="submit"
            loading={isLoading}
            className="py-2.5 rounded-md transition-colors bg-primary border-none hover:bg-primary-hover text-white w-full"
          >
            <span className="text-[15px] font-semibold">
              Login
            </span>
          </ButtonField>
        </form>
      </FormProvider>

      <div className="w-full flex items-center justify-between min-h-[24px] -mt-3">
        <div className="flex-1 mr-2 overflow-hidden">
          <FormStatusMessage status={submitStatus} className="text-xs" />
        </div>
        <span
          className="text-sm font-semibold text-text-secondary hover:text-primary cursor-pointer transition-colors shrink-0"
          onClick={() => setAuthMode("RESET")}
        >
          Forgot Password?
        </span>
      </div>

      <div className="w-full flex items-center gap-3">
        <div className="flex-1 border-t border-border"></div>
        <span className="text-sm text-text-secondary">Or Login With</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <div className="w-full flex gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-md cursor-pointer hover:bg-secondary transition-colors">
          <FcGoogle className="text-xl" />
          <span className="text-sm font-semibold text-text-primary">Google</span>
        </div>
        <div
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-md cursor-pointer hover:bg-secondary transition-colors"
          onClick={() => setAuthMode("OTP")}
        >
          <MdPassword className="text-xl text-primary" />
          <span className="text-sm font-semibold text-text-primary">OTP</span>
        </div>
      </div>
    </div>
  );
};

const requestOtpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});
type RequestOtpSchema = z.infer<typeof requestOtpSchema>;

const verifyOtpSchema = z.object({
  code: z.string().length(6, "Please enter all 6 digits of the verification code"),
});
type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

const OTPForm = ({ setAuthMode }: { setAuthMode: (mode: AuthMode) => void }) => {
  const router = useRouter();
  const [step, setStep] = useState<"EMAIL" | "VERIFY">("EMAIL");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatusType | null>(null);

  const emailMethods = useForm<RequestOtpSchema>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  const otpMethods = useForm<VerifyOtpSchema>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "VERIFY" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const onRequestOtp = async (data: RequestOtpSchema) => {
    setIsLoading(true);
    setSubmitStatus(null);
    try {
      const res = await otpApi.send({ action: "LOGIN", email: data.email });
      const json = res.data;
      if (!json?.success) {
        setSubmitStatus({
          type: "error",
          text: json?.message || "Failed to send login code",
        });
        return;
      }
      setEmail(data.email);
      setOtpId(json.data?.id || "");
      setCountdown(json.data?.resendAfter || 60);
      setStep("VERIFY");
      setSubmitStatus({
        type: "success",
        text: "Verification code sent to your email.",
      });
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setSubmitStatus(null);
    try {
      const res = await otpApi.send({ action: "LOGIN", email });
      const json = res.data;
      if (!json?.success) {
        setSubmitStatus({
          type: "error",
          text: json?.message || "Failed to resend code",
        });
        return;
      }
      setOtpId(json.data?.id || "");
      setCountdown(json.data?.resendAfter || 60);
      otpMethods.reset({ code: "" });
      setSubmitStatus({
        type: "success",
        text: "A fresh code has been sent.",
      });
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsResending(false);
    }
  };

  const onVerifyOtp = async (data: VerifyOtpSchema) => {
    setIsLoading(true);
    setSubmitStatus(null);
    try {
      const res = await userApi.loginWithOtp({
        email,
        otpId,
        code: data.code,
      });
      const json = res.data;
      if (!json?.success) {
        setSubmitStatus({
          type: "error",
          text: json?.message || "Login failed",
        });
        return;
      }

      setSubmitStatus({
        type: "success",
        text: "Login successful! Redirecting...",
      });

      setTimeout(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl");
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
      }, 500);
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full max-w-[380px]">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary mb-1">
          {step === "EMAIL" ? "Sign In with OTP" : "Enter Verification Code"}
        </h2>
        <p className="text-xs text-text-secondary">
          {step === "EMAIL"
            ? "Enter your registered email to receive a login code"
            : "Enter the 6-digit code sent to your email"}
        </p>
        {step === "VERIFY" && (
          <div className="inline-flex items-center gap-1.5 bg-secondary border border-border px-3 py-1 rounded-full text-xs font-semibold text-text-primary mt-2">
            <MailOutlined className="text-primary text-xs" />
            <span className="font-mono">{email}</span>
            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setSubmitStatus(null);
              }}
              className="text-primary hover:underline ml-1 font-bold text-[11px] cursor-pointer"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {step === "EMAIL" ? (
        <FormProvider {...emailMethods}>
          <form
            className="flex flex-col gap-5 w-full"
            onSubmit={emailMethods.handleSubmit(onRequestOtp)}
          >
            <div className="flex flex-col gap-1.5">
              <TextField className="text-xs font-bold text-text-primary">
                Email Address
              </TextField>
              <InputField
                id="email"
                name="email"
                type="email"
                placeholder="Enter your registered email"
                control={emailMethods.control as any}
              />
            </div>

            <ButtonField
              htmlType="submit"
              loading={isLoading}
              className="py-2.5 rounded-md transition-colors bg-primary border-none text-white w-full hover:bg-primary-hover"
            >
              <span className="text-[15px] font-semibold">
                Send Login Code
              </span>
            </ButtonField>
          </form>
        </FormProvider>
      ) : (
        <FormProvider {...otpMethods}>
          <form
            className="flex flex-col items-center gap-5 w-full"
            onSubmit={otpMethods.handleSubmit(onVerifyOtp)}
          >
            <div className="w-full flex flex-col items-center gap-2">
              <OtpField
                id="code"
                name="code"
                length={6}
                size="large"
                control={otpMethods.control as any}
              />
            </div>

            <div className="text-center text-xs text-text-secondary -mt-1">
              {countdown > 0 ? (
                <span>
                  Resend code in{" "}
                  <span className="font-bold text-primary font-mono">
                    {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResend}
                  disabled={isResending}
                  className="text-primary font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>

            <ButtonField
              htmlType="submit"
              loading={isLoading}
              className="py-2.5 rounded-md transition-colors bg-primary border-none text-white w-full hover:bg-primary-hover"
            >
              <span className="text-[15px] font-semibold">
                Verify & Sign In
              </span>
            </ButtonField>
          </form>
        </FormProvider>
      )}

      <div className="w-full">
        <FormStatusMessage status={submitStatus} className="text-xs" />
      </div>

      <div className="w-full flex justify-center">
        <span
          className="text-sm text-text-secondary hover:text-primary cursor-pointer flex items-center gap-2 transition-colors"
          onClick={() => setAuthMode("LOGIN")}
        >
          <ArrowLeftOutlined className="text-xs" />
          Back to Password Login
        </span>
      </div>
    </div>
  );
};

const requestResetSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});
type RequestResetSchema = z.infer<typeof requestResetSchema>;

const verifyResetSchema = z
  .object({
    code: z.string().length(6, "Please enter all 6 digits of the verification code"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type VerifyResetSchema = z.infer<typeof verifyResetSchema>;

const ResetPasswordForm = ({ setAuthMode }: { setAuthMode: (mode: AuthMode) => void }) => {
  const [step, setStep] = useState<"EMAIL" | "VERIFY">("EMAIL");
  const [email, setEmail] = useState("");
  const [otpId, setOtpId] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatusType | null>(null);

  const emailMethods = useForm<RequestResetSchema>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const resetMethods = useForm<VerifyResetSchema>({
    resolver: zodResolver(verifyResetSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "VERIFY" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const onRequestReset = async (data: RequestResetSchema) => {
    setIsLoading(true);
    setSubmitStatus(null);
    try {
      const res = await otpApi.send({ action: "PASSWORD_RESET", email: data.email });
      const json = res.data;
      if (!json?.success) {
        setSubmitStatus({
          type: "error",
          text: json?.message || "Failed to send reset code",
        });
        return;
      }
      setEmail(data.email);
      setOtpId(json.data?.id || "");
      setCountdown(json.data?.resendAfter || 60);
      setStep("VERIFY");
      setSubmitStatus({
        type: "success",
        text: "Reset code sent to your email.",
      });
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setSubmitStatus(null);
    try {
      const res = await otpApi.send({ action: "PASSWORD_RESET", email });
      const json = res.data;
      if (!json?.success) {
        setSubmitStatus({
          type: "error",
          text: json?.message || "Failed to resend code",
        });
        return;
      }
      setOtpId(json.data?.id || "");
      setCountdown(json.data?.resendAfter || 60);
      resetMethods.reset({
        code: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSubmitStatus({
        type: "success",
        text: "A fresh reset code has been sent.",
      });
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsResending(false);
    }
  };

  const onResetPassword = async (data: VerifyResetSchema) => {
    setIsLoading(true);
    setSubmitStatus(null);
    try {
      const res = await userApi.resetPassword({
        email,
        otpId,
        code: data.code,
        newPassword: data.newPassword,
      });
      const json = res.data;
      if (!json?.success) {
        setSubmitStatus({
          type: "error",
          text: json?.message || "Password reset failed",
        });
        return;
      }

      setSubmitStatus({
        type: "success",
        text: "Password reset successfully! Redirecting to login...",
      });

      setTimeout(() => {
        setAuthMode("LOGIN");
      }, 1500);
    } catch (err: any) {
      setSubmitStatus({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full max-w-[380px]">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary mb-1">
          {step === "EMAIL" ? "Reset Your Password" : "Set New Password"}
        </h2>
        <p className="text-xs text-text-secondary">
          {step === "EMAIL"
            ? "Enter your registered email to receive a password reset code"
            : "Enter the code sent to your email and your new password"}
        </p>
        {step === "VERIFY" && (
          <div className="inline-flex items-center gap-1.5 bg-secondary border border-border px-3 py-1 rounded-full text-xs font-semibold text-text-primary mt-2">
            <MailOutlined className="text-primary text-xs" />
            <span className="font-mono">{email}</span>
            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setSubmitStatus(null);
              }}
              className="text-primary hover:underline ml-1 font-bold text-[11px] cursor-pointer"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {step === "EMAIL" ? (
        <FormProvider {...emailMethods}>
          <form
            className="flex flex-col gap-5 w-full"
            onSubmit={emailMethods.handleSubmit(onRequestReset)}
          >
            <div className="flex flex-col gap-1.5">
              <TextField className="text-xs font-bold text-text-primary">
                Email Address
              </TextField>
              <InputField
                id="email"
                name="email"
                type="email"
                placeholder="Enter your registered email"
                control={emailMethods.control as any}
              />
            </div>

            <ButtonField
              htmlType="submit"
              loading={isLoading}
              className="py-2.5 rounded-md transition-colors bg-primary border-none hover:bg-primary-hover text-white w-full"
            >
              <span className="text-[15px] font-semibold">
                Send Reset Code
              </span>
            </ButtonField>
          </form>
        </FormProvider>
      ) : (
        <FormProvider {...resetMethods}>
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={resetMethods.handleSubmit(onResetPassword)}
          >
            <div className="w-full flex flex-col items-center gap-1.5">
              <TextField className="text-xs font-bold text-text-primary self-start">
                Verification Code
              </TextField>
              <OtpField
                id="code"
                name="code"
                length={6}
                size="large"
                control={resetMethods.control as any}
              />
            </div>

            <div className="text-center text-xs text-text-secondary -mt-1">
              {countdown > 0 ? (
                <span>
                  Resend code in{" "}
                  <span className="font-bold text-primary font-mono">
                    {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResend}
                  disabled={isResending}
                  className="text-primary font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <TextField className="text-xs font-bold text-text-primary">
                New Password
              </TextField>
              <PasswordField
                id="newPassword"
                name="newPassword"
                placeholder="Enter at least 6 characters"
                control={resetMethods.control as any}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <TextField className="text-xs font-bold text-text-primary">
                Confirm New Password
              </TextField>
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter new password"
                control={resetMethods.control as any}
              />
            </div>

            <ButtonField
              htmlType="submit"
              loading={isLoading}
              className="py-2.5 rounded-md transition-colors bg-primary border-none hover:bg-primary-hover text-white w-full mt-1"
            >
              <span className="text-[15px] font-semibold">
                Reset Password
              </span>
            </ButtonField>
          </form>
        </FormProvider>
      )}

      <div className="w-full">
        <FormStatusMessage status={submitStatus} className="text-xs" />
      </div>

      <div className="w-full flex justify-center">
        <span
          className="text-sm text-text-secondary hover:text-primary cursor-pointer flex items-center gap-2 transition-colors"
          onClick={() => setAuthMode("LOGIN")}
        >
          <ArrowLeftOutlined className="text-xs" />
          Back to Sign In
        </span>
      </div>
    </div>
  );
};

const ImageSection = () => {
  return (
    <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-50 border-l border-slate-200/80 p-12 xl:p-16 relative overflow-hidden">
      {/* Top Header */}
      <div className="max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs mb-4">
          <SafetyCertificateOutlined className="text-primary" />
          <span>Debt Assistance & Loan Management CRM</span>
        </div>
        <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          Streamlined Case Resolution & Borrower Protection
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Centralized workspace for managing borrower debt counseling, harassment complaints, multi-lender restructuring, and settlement execution.
        </p>
      </div>

      {/* Center Clean Snapshot Card */}
      <div className="my-auto py-6 max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
          {/* Case Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                AK
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-none">Anand Kumar</h4>
                <span className="text-xs text-slate-400 mt-1 inline-block">Case ID: #DC-2026-9481 • Active Restructuring</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Restructuring Active
            </span>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Total Enrolled Debt</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">₹24.8 Lakhs</div>
              <div className="text-[10px] text-slate-400 mt-0.5">4 Lenders Enrolled</div>
            </div>

            <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
              <div className="text-[11px] font-medium text-emerald-700">Settlement Target</div>
              <div className="text-base font-bold text-emerald-800 mt-0.5">₹11.9 Lakhs</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">52% Debt Relief</div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Legal & Protection</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">Shield Active</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">0 Escalations</div>
            </div>
          </div>

          {/* Resolution Timeline Progress */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>Resolution Progress</span>
              <span className="text-primary font-bold">Step 3 of 4</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 font-medium">1. Onboarding</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 font-medium">2. Assessment</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] text-primary font-bold">3. Negotiation</span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-slate-200" />
                <span className="text-[10px] text-slate-400">4. Settlement</span>
              </div>
            </div>
          </div>

          {/* Pillar Points */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-500 text-xs" /> Harassment Defense
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-500 text-xs" /> Multi-Lender Tracking
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleFilled className="text-emerald-500 text-xs" /> OTS Mediation
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-4">
        <span>Confidential • Internal Operations Platform</span>
        <span>Version 1.0</span>
      </div>
    </div>
  );
};
