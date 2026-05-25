/** Auth method enum values */
const AUTH_METHOD_USERNAME_PASSWORD = 0;
const AUTH_METHOD_PHONE_OTP = 1;
const AUTH_METHOD_EMAIL_OTP = 2;
const AUTH_METHOD_SOCIAL = 3;

/**
 * Authentication method enum
 */
export enum AuthMethod {
  UsernamePassword = AUTH_METHOD_USERNAME_PASSWORD,
  PhoneOtp = AUTH_METHOD_PHONE_OTP,
  EmailOtp = AUTH_METHOD_EMAIL_OTP,
  Social = AUTH_METHOD_SOCIAL
}
