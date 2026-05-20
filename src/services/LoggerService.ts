type LogLevel = 'info' | 'error' | 'warning' | 'debug';

interface LogSubscriber {
  (message: string, type: LogLevel): void;
}

class LoggerService {
  private static instance: LoggerService;
  private subscribers: LogSubscriber[] = [];
  private maxMessages: number = 50;
  private logHistory: string[] = [];

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  subscribe(callback: LogSubscriber): () => void {
    this.subscribers.push(callback);
    // Возвращаем функцию для отписки
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  log(message: string, type: LogLevel = 'info'): void {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;

    // Сохраняем историю
    this.logHistory = [formattedMessage, ...this.logHistory].slice(
      0,
      this.maxMessages,
    );

    // Пишем в консоль
    console.log(formattedMessage);

    // Уведомляем подписчиков
    this.subscribers.forEach(callback => callback(formattedMessage, type));
  }

  getHistory(): string[] {
    return [...this.logHistory];
  }

  clear(): void {
    this.logHistory = [];
    this.subscribers.forEach(callback => callback('Logs cleared', 'info'));
  }

  error(message: string): void {
    this.log(message, 'error');
  }

  warning(message: string): void {
    this.log(message, 'warning');
  }

  debug(message: string): void {
    this.log(message, 'debug');
  }
}

export const logger = LoggerService.getInstance();
