export const canResendOtp = (lastSent: Date) => {
  const now = new Date();
  return (now.getTime() - new Date(lastSent).getTime()) > 30000;
};
