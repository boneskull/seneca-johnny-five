'use strict';

const pkg = require('../package.json');
const Adapter = require('./adapter');

function registerActions(adapter) {
  function createComponent(msg, done) {
    if (!msg.class) {
      throw new Error('class property required');
    }

    const componentOptions = msg.options || {};
    return adapter.component(msg.class, componentOptions, done);
  }

  this.add({role: 'j5', create: 'component'}, createComponent);
}

function senecaJohnnyFive(options) {
  this.add(`init:${pkg.name}`, (initMsg, initDone) => {
    return Adapter(options, this)
      .tap(() => this.log.debug('Initialized Johnny-Five Board with options',
        options))
      .then(registerActions.bind(this))
      .nodeify(initDone);
  });

  return {
    name: pkg.name
  };
}

module.exports = senecaJohnnyFive;
