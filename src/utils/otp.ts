export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (phone: string, otp: string) => {
  console.log(`Sending OTP ${otp} to ${phone}`);
  // Integrate with SMS gateway here
};
