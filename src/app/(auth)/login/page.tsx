"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import InputField from "@/common/form/InputField";
import PasswordField from "@/common/form/PasswordField";
import ButtonField from "@/common/basic/ButtonField";
import BrandLogo from "@/common/basic/BrandLogo";
import FormStatusMessage, { SubmitStatusType } from "@/common/form/FormStatusMessage";
import { employeeApi } from "@/common/utils/api";
import { responseError } from "@/common/utils/main.utils";
import { APP_CONFIG } from "@/config/app.config";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const methods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    setSubmitStatus(null);
    try {
      const res = await employeeApi.login({
        email: data.email,
        password: data.password,
      });
      const json = res.data;

      if (!json?.success) {
        setSubmitStatus({
          type: "error",
          text: json?.message || "Incorrect email or password.",
        });
        return;
      }

      setSubmitStatus({
        type: "success",
        text: "Signed in successfully! Redirecting...",
      });

      setTimeout(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl");
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
      }, 400);
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
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-background px-4 pt-10 sm:pt-12">
      {/* Top Header & Logo */}
      <div className="flex flex-col items-center w-full max-w-[460px] my-auto">
        <div className="flex items-center justify-center mb-4">
          <BrandLogo size="xl" />
        </div>

        <h1 className="text-xl font-normal text-text-secondary tracking-tight mb-6 text-center">
          Sign in to your CRM workspace
        </h1>

        {/* Form Container (No border, no shadow) */}
        <div className="w-full">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-text-primary">
                  Email address
                </label>
                <InputField
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Enter your email"
                  autoComplete="email"
                  control={methods.control as any}
                  className="rounded-md"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-text-primary">
                    Password
                  </label>
                </div>
                <PasswordField
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  control={methods.control as any}
                  className="rounded-md"
                />
              </div>

              {submitStatus && (
                <div className="pt-1">
                  <FormStatusMessage status={submitStatus} className="text-xs" />
                </div>
              )}

              <ButtonField
                htmlType="submit"
                loading={isLoading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover !border-none text-white font-semibold rounded-md transition-colors text-sm mt-1"
              >
                Sign in
              </ButtonField>
            </form>
          </FormProvider>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto flex items-center justify-center text-xs text-text-secondary">
        <span>© {new Date().getFullYear()} {APP_CONFIG.name}</span>
      </footer>
    </div>
  );
}
