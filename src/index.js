import ConfigService from './services/config';
import TasksService from './services/tasks';
import ResourceService from './services/resources';
import SocketService from './services/socket';

ConfigService.setPluginsDir('./plugins');

export {
  ConfigService,
  TasksService,
  SocketService,
  ResourceService
};
