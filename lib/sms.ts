import axios from "axios";

const PAYAMAK_API_URL = "https://rest.payamak-panel.com/api/SendSMS/SendSMS";
const USERNAME = process.env.PAYAMAK_USER || "9124469400";
const PASSWORD = process.env.PAYAMAK_PASS || "7c45db3e-280c-4643-a88c-bd69915e81d9";
const FROM_NUMBER = process.env.PAYAMAK_FROM || "50004001469400";

/**
 * Send OTP via SMS Panel
 * @param {string} mobile - Destination mobile number
 * @param {string|number} code - Verification code
 * @param {string} [text] - Optional text
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function sendOtpSMS(mobile: string, code: string | number, text: string = "") {
  if (!mobile) {
    return { success: false, message: "شماره موبایل وارد نشده است." };
  }
  const body = {
    username: USERNAME,
    password: PASSWORD,
    to: mobile,
    from: FROM_NUMBER,
    text: text || `کد ورود شما: ${code}`,
    isFlash: false,
  };

  try {
    const { data } = await axios.post(PAYAMAK_API_URL, body);
    if (data?.RetStatus === 1) {
      return { success: true };
    }
    return {
      success: false,
      message: data?.StrRetStatus || "خطا در ارسال پیامک",
    };
  } catch (e) {
    return { success: false, message: "خطای ارتباط با سرویس پیامک" };
  }
}

export const sendOtp = sendOtpSMS;
export default { sendOtpSMS, sendOtp };
