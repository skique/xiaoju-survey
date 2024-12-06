import { type App, onErrorCaptured, getCurrentInstance } from 'vue';

const errorCapturePlugin = {
  install(app: App) {
    app.config.globalProperties.$reportError = (errorInfo: any) => {

      // 在这里处理错误，例如发送到监控服务
      console.error('捕获到错误:', JSON.stringify(errorInfo));
    };
    app.config.globalProperties.$captureVueError = (error: Error, context: any = {}) => {
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        component: context.componentName || 'Unknown Component',
        route: {
          path: context.route?.path || 'Unknown Path',
          params: context.route?.params || {},
        },
      };

      // 在这里处理错误，例如发送到监控服务
      console.error('捕获到错误:', errorInfo);
    };

    // 捕获全局错误
    app.mixin({
      setup() {
        onErrorCaptured((error) => {
          const componentInstance = getCurrentInstance();
          const context = {
            componentName: componentInstance?.type.name,
            route: app.config.globalProperties.$route, // Vue Router 实例
          };
          // 使用全局错误捕获方法
          app.config.globalProperties.$captureVueError(error, context);
          // 返回 false 来停止错误传播
          return false;
        });
      },
    });
    // 捕获全局未处理的错误
    window.onerror = (message, source, lineno, colno, error) => {
      app.config.globalProperties.$reportError(error as Error);
    };
  },
};

export default errorCapturePlugin;
