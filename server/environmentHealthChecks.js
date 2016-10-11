import _ from 'lodash';
import winston from 'winston';
import checkServiceHealth from './checkServiceHealth';

class EnvironmentHealthChecks {
  constructor(connections, actionType, servers) {
    this.connections = connections;
    this.actionType = actionType;
    this.failures = [];
    this.count = 0;
    this.servers = servers;
  }

  monitor() {
    this.checkHealth()
      .then(() => setTimeout(() => this.monitor(), 5000))
      .catch((err) => {
        setTimeout(() => this.monitor(), 20000);
        winston.error(err);
      });
  }

  checkHealth() {
    return Promise.all(this.servers.map(s => checkServiceHealth(s)))
      .then(results => this.updateState(results));
  }

  updateState(results) {
    this.failures = _.reject(results, s => s.status === 'OK');
    this.broadcast();
  }

  broadcast() {
    winston.info('Broadcasting', this.failures);
    this.connections.forEach((socket) => {
      socket.emit('action', {
        type: this.actionType,
        failures: this.failures,
      });
    });
  }
}

module.exports = EnvironmentHealthChecks;
