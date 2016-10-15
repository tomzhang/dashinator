import request from 'request-promise-native';

const checkServiceHealth = service => request({
  uri: service.url,
  resolveWithFullResponse: true,
})
  .then(() => 'OK')
  .catch(err => err.message)
  .then(status => Object.assign({}, service, {
    status,
  }));

const healthChecksFor = servers => () =>
  Promise.all(servers.map(s => checkServiceHealth(s)));

module.exports = healthChecksFor;