'use strict';

const _ = require('lodash');
const isAsync = require('is-async-function');
const j5 = require('johnny-five');

function isClass(funcName) {
  return /^[A-Z]/.test(funcName);
}

function isPublic(funcName) {
  return funcName.charAt(0) !== '_';
}

module.exports = _(j5)
  .functions()
  .filter(isClass)
  .map(className => {
    const j5Class = j5[className];
    const prototype = j5Class.prototype;
    return [
      className, {
        methods: _(prototype)
          .functions()
          .filter(isPublic)
          .map(methodName => {
            const method = prototype[methodName];
            return [
              methodName, {
                params: method.length,
                isAsync: isAsync(method)
              }
            ];
          })
          .object()
          .value(),
        params: j5Class.length
      }
    ];
  })
  .object()
  .value();
