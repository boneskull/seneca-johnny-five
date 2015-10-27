'use strict';

const stampit = require('stampit');
const j5 = require('johnny-five');
const Board = j5.Board;
const _ = require('lodash');
const Promise = require('bluebird');
const j5Classes = require('./j5-reflect');
const Joi = require('joi');

const Adapter = stampit({
  refs: {
    debug: false,
    repl: false,
    components: {}
  },
  props: {
    j5Classes: j5Classes
  },
  init(context) {
    const seneca = this.seneca = context.args.shift();
    const done = context.args.shift();

    const stamp = context.stamp;
    const boardOpts = _.omit(this, _(stamp.fixed.props)
      .keys()
      .concat(_.keys(stamp.fixed.methods))
      .concat('seneca', 'components')
      .value());

    return new Promise((resolve, reject) => {
      seneca.log.debug(boardOpts);
      this.board = new Board(boardOpts)
        .on('ready', resolve)
        .on('error', reject);
    })
      .return(this)
      .nodeify(done);
  },
  methods: {
    component(klass, opts, done) {
      return Promise.try(() => {
        Joi.assert(klass, Joi.string().required());
        if (!this.j5Classes[klass]) {
          throw new Error(`Unknown class ${klass}`);
        }
        Joi.assert(opts, Joi.object());
        Joi.assert(done, Joi.func());

        opts = opts || {};
        opts.id = opts.id || _.uniqueId(`${klass}-`);

        this.components[opts.id] = new j5[klass](opts);

        return _.extend({
          id: opts.id
        }, this.j5Classes[klass]);
      })
      .nodeify(done);
    }
  }
});

module.exports = Adapter;
