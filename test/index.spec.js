'use strict';

const Seneca = require('seneca');
const MockFirmata = require('johnny-five/test/util/mock-firmata');

describe('seneca-johnny-five', () => {
  let sandbox;
  let seneca;
  let io;

  beforeEach(() => {
    sandbox = sinon.sandbox.create('seneca-johnny-five');
    seneca = Seneca({
      log: 'plugin:seneca-johnny-five'
    });
    io = new MockFirmata();
  });

  afterEach(() => {
    sandbox.restore();
  });

  // false positive; see senecajs/seneca#202
  it.skip(`should be a seneca plugin`, () => {
    expect(() => seneca.use('seneca-johnny-five', {
      io: io
    })).not.to.throw();
  });

  it(`should be a seneca plugin`, () => {
    expect(() => seneca.use('../lib', {
      io: io
    })).not.to.throw();
  });

  describe(`when ready`, () => {
    beforeEach(() => {
      seneca.use('../lib', {
        io: io
      });
    });

    it(`should start when seneca.ready() called`, done => {
      seneca.ready(err => {
        expect(err).to.be.undefined;
        done();
      });
      io.emit('connect');
      io.emit('ready');
    });
  });

  describe(`role:j5`, () => {
    beforeEach(done => {
      seneca.use('../lib', {
        io: io
      });
      seneca.ready(done);
      io.emit('connect');
      io.emit('ready');
    });

    describe(`create:component`, () => {
      it(`should create a component`, done => {
        seneca.act({
          role: 'j5',
          create: 'component',
          'class': 'Relay',
          options: {
            pin: 11
          }
        }, function(err, result) {
          expect(err).to.be.null;
          done();
        })
      });
    });
  });
});
