"use client";
import Image from "next/image";
import LoginImageOriginal from "@/assets/images/login.png";
import { useForm, FormProvider } from "react-hook-form";
import ButtonField from "@/common/basic/ButtonField";
import OtpField from "@/common/form/OtpField";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { otpApi } from "@/common/utils/api";
import { responseError } from "@/common/utils/main.utils";
import { App } from "antd";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeftOutlined, MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { APP_CONFIG } from "@/config/app.config";

const otpSchema = z.object({
  otp: z.string().length(6, "Please enter all 6 digits of the verification code"),
});
type OtpSchema = z.infer<typeof otpSchema>;

const VerifyOtpPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background text-sm text-gray-500">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
};

export default VerifyOtpPage;

const VerifyOtpContent = () => {
  return (
    <div className="flex justify-between w-full h-screen bg-background">
      {/* Left Panel */}
      <div className="w-[40%] flex flex-col items-center justify-between mt-[50px] overflow-y-auto pb-[100px] register-scroll">
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center justify-center mb-6">
            <Image src="/logo.png" alt={`${APP_CONFIG.name} Logo`} width={40} height={40} />
            <span className="font-bold text-xl text-text-primary tracking-wide">{APP_CONFIG.name}</span>
          </div>

          <VerifyOtpForm />
        </div>

        {/* Footer Copyright */}
        <div className="fixed bottom-4 left-[10%] text-xs text-gray-500 bg-background/80 p-2 rounded-md">
          Copyright © {new Date().getFullYear()} {APP_CONFIG.name}™, All Rights Reserved.
        </div>
      </div>

      {/* Right Panel */}
      <ImageSection />
    </div>
  );
};

const VerifyOtpForm = () => {
  const { message } = App.useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const _emailParam = searchParams.get("email") || "";

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("pending_registration");
      if (saved) {
        setCompanyData(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const displayEmail = companyData?.adminEmail;

  const methods = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      const payload = companyData || { adminEmail: displayEmail, companyName: "Company", country: "US" };
      const res = await otpApi.send({
        action: "REGISTRATION",
        email: payload.adminEmail || displayEmail,
      });
      const json = res.data;

      if (!json?.success) {
        message.error(json?.message || "Failed to resend code");
        return;
      }

      const newOtpId = json?.data?.id;
      if (newOtpId) {
        const newData = { ...payload, otpId: newOtpId };
        setCompanyData(newData);
        try {
          sessionStorage.setItem("pending_registration", JSON.stringify(newData));
        } catch {
          // ignore
        }
      }

      message.success(json?.message);
      setCountdown(60);
      methods.reset({ otp: "" });
    } catch (err: any) {
      message.error(responseError(err));
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (otpData: OtpSchema) => {
    setIsLoading(true);
    try {
      const payload = companyData || {
        companyName: "Company",
        adminEmail: displayEmail,
        country: "US",
      };

      const res = await otpApi.verify({
        id: payload.otpId,
        token: otpData.otp,
        email: payload.adminEmail || displayEmail,
      });
      const json = res.data;

      if (!json?.success) {
        message.error(json?.message || "Verification failed");
        return;
      }

      // Clear stored pending registration on success
      try {
        sessionStorage.removeItem("pending_registration");
      } catch {
        // ignore
      }

      message.success(json?.message);
      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (err: any) {
      message.error(responseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full max-w-[380px]">
      {/* Header Badge */}
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl shadow-sm mb-3">
          <SafetyCertificateOutlined />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-1 tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-xs text-text-secondary max-w-[300px]">
          Please enter the 6-digit verification code sent to
        </p>
        <div className="flex items-center gap-1.5 bg-secondary border border-border px-3 py-1 rounded-full text-xs font-semibold text-text-primary mt-2 shadow-xs">
          <MailOutlined className="text-primary text-xs" />
          <span className="font-mono">{displayEmail}</span>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-primary hover:underline ml-1 font-bold text-[11px] cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form
          className="flex flex-col items-center gap-5 w-full mt-2"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <div className="w-full flex flex-col items-center gap-2">
            <OtpField
              id="otp"
              name="otp"
              length={6}
              size="large"
              control={methods.control as any}
            />
          </div>

          {/* Countdown & Resend */}
          <div className="text-center text-xs text-text-secondary -mt-1">
            {countdown > 0 ? (
              <span>
                Didn&apos;t receive code? Resend in{" "}
                <span className="font-bold text-primary font-mono">
                  {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
                </span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                Didn&apos;t receive code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-primary font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              </span>
            )}
          </div>

          <ButtonField
            htmlType="submit"
            loading={isLoading}
            className="py-2.5 rounded-md transition-colors bg-primary border-none hover:bg-primary-hover text-white w-full shadow-md shadow-primary/20"
          >
            <span className="text-[15px] font-semibold">
              Verify & Create Account
            </span>
          </ButtonField>

          <button
            type="button"
            onClick={() => router.push("/register")}
            disabled={isLoading}
            className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-1"
          >
            <ArrowLeftOutlined className="text-[10px]" />
            Back to Registration
          </button>
        </form>
      </FormProvider>

      <div className="w-full flex justify-center mt-2">
        <span className="text-sm font-semibold text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline transition-colors">
            Login here
          </Link>
        </span>
      </div>
    </div>
  );
};

const ImageSection = () => {
  return (
    <div className="flex items-center justify-center flex-col bg-gradient-to-bl from-primary-200 via-primary-100 w-[60%] relative overflow-hidden">
      <div className="absolute top-12 text-center z-10 w-full px-8">
        <h1 className="text-4xl font-extrabold text-text-primary mb-3 tracking-tight">
          The Unified Business Platform 🚀
        </h1>
        <p className="text-lg font-bold text-text-secondary max-w-xl mx-auto">
          WhatsApp • Accounting • Inventory • Billing • HR
        </p>
      </div>

      <div className="w-full h-full flex items-center justify-center mt-28 p-12">
        <Image
          alt="platform-preview"
          src={LoginImageOriginal}
          width={800}
          height={600}
          className="w-[85%] object-contain drop-shadow-xl"
          priority
        />
      </div>
    </div>
  );
};
