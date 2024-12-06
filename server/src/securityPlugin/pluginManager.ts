import { SecurityPlugin } from './interface';

type AllowHooks =
  | 'encryptResponseData' // 数据加密
  | 'decryptResponseData' // 数据解密
  | 'maskData'            // 数据脱敏
  | 'genSurveyPath'       // 获取问卷id
  | 'approval'            // 审批流程

export class PluginManager {
  private plugins: Array<SecurityPlugin> = [];
  // 注册插件
  registerPlugin(...plugins: Array<SecurityPlugin>) {
    this.plugins.push(...plugins);
  }

  // 触发钩子
  async triggerHook(hookName: AllowHooks, data?: any) {
    for (const plugin of this.plugins) {
      if (plugin[hookName]) {
        return await plugin[hookName](data);
      }
    }
  }
}

export default new PluginManager();
