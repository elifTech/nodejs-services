import path from 'path';

export default
class ConfigService {
  static pluginsDir = '';
  static accountGetter;
  static modelGetter;

  static setPluginsDir(dir) {
    ConfigService.pluginsDir = dir;
  }

  static getPluginsDir() {
    return ConfigService.pluginsDir;
  }

  static getPluginsDirFor(type) {
    return path.join(ConfigService.getPluginsDir(), type);
  }

  static setAccountGetter(getter) {
    ConfigService.accountGetter = getter;
  }

  static getAccountById(accountId, next) {
    if (!ConfigService.accountGetter) {
      return null;
    }
    return ConfigService.accountGetter(accountId, next);
  }

  static setModelGetter(getter) {
    ConfigService.modelGetter = getter;
  }

  static getModel(name) {
    if (!ConfigService.modelGetter) {
      return null;
    }
    return ConfigService.modelGetter(name);
  }
}
