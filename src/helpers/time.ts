export function formatTime(seconds: number, t: any): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Форматируем с ведущими нулями
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes} ${t('time.minute')} ${formattedSeconds} ${t(
    'time.second',
  )}`;
}
