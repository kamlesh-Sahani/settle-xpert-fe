import { z } from "zod";
import { COUNTRIES } from "headless-countries";

/**
 * Validates a phone number using headless-countries data.
 * Designed to be used with Zod's `superRefine`.
 */
export const validatePhoneNumber = (val: string | undefined, ctx: z.RefinementCtx) => {
  if (!val) return;
  const sortedCountries = [...COUNTRIES].sort((a: any, b: any) => b.dial.length - a.dial.length);
  const country = sortedCountries.find((c: any) => val.startsWith(c.dial));
  
  if (!country) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid phone number format",
    });
    return;
  }
  
  const localNumber = val.substring(country.dial.length);
  if (country.digits && localNumber.length !== country.digits) {
    ctx.addIssue({
      code: "custom",
      message: `Must be exactly ${country.digits} digits`,
    });
  }
};
