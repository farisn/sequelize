'use strict';

/* jshint -W030 */
/* jshint -W110 */
var chai = require('chai')
  , sinon = require('sinon')
  , Sequelize = require('../../../index')
  , Promise = Sequelize.Promise
  , expect = chai.expect
  , Support = require(__dirname + '/../support')
  , DataTypes = require(__dirname + '/../../../lib/data-types')
  , config = require(__dirname + '/../../config/config')
  , current = Support.sequelize;

chai.config.includeStack = true;

describe(Support.getTestDialectTeaser('Model'), function() {
  if (current.dialect.supports.JSONB) {
    describe('JSONB', function () {
      beforeEach(function () {
        this.Event = this.sequelize.define('Event', {
          data: {
            type: DataTypes.JSONB,
            field: 'event_data',
            index: true
          }
        });

        return this.Event.sync({force: true});
      });

      it('should create an instance with JSONB data', function () {
        return this.Event.create({
          data: {
            name: {
              first: 'Homer',
              last: 'Simpson'
            },
            employment: 'Nuclear Safety Inspector'
          }
        }).bind(this).then(function () {
          return this.Event.findAll().then(function (events) {
            var event = events[0];

            expect(event.get('data')).to.eql({
              name: {
                first: 'Homer',
                last: 'Simpson'
              },
              employment: 'Nuclear Safety Inspector'
            });
          });
        });
      });

      it('should be possible to query a nested value', function () {
        return Promise.join(
          this.Event.create({
            data: {
              name: {
                first: 'Homer',
                last: 'Simpson'
              },
              employment: 'Nuclear Safety Inspector'
            }
          }),
          this.Event.create({
            data: {
              name: {
                first: 'Marge',
                last: 'Simpson'
              },
              employment: 'Housewife'
            }
          })
        ).bind(this).then(function () {
          return this.Event.findAll({
            where: {
              data: {
                employment: 'Housewife'
              }
            }
          }).then(function (events) {
            var event = events[0];

            expect(events.length).to.equal(1);
            expect(event.get('data')).to.eql({
              name: {
                first: 'Marge',
                last: 'Simpson'
              },
              employment: 'Housewife'
            });
          });
        });
      });

      it('should be possible to query multiple nested values', function () {
        return Promise.join(
          this.Event.create({
            data: {
              name: {
                first: 'Homer',
                last: 'Simpson'
              },
              employment: 'Nuclear Safety Inspector'
            }
          }),
          this.Event.create({
            data: {
              name: {
                first: 'Marge',
                last: 'Simpson'
              },
              employment: 'Housewife'
            }
          }),
          this.Event.create({
            data: {
              name: {
                first: 'Bart',
                last: 'Simpson'
              },
              employment: 'None'
            }
          })
        ).bind(this).then(function () {
          return this.Event.findAll({
            where: {
              data: {
                name: {
                  last: 'Simpson'
                },
                employment: {
                  $ne: 'None'
                }
              }
            },
            order: [
              ['id', 'ASC']
            ]
          }).then(function (events) {
            expect(events.length).to.equal(2);

            expect(events[0].get('data')).to.eql({
              name: {
                first: 'Homer',
                last: 'Simpson'
              },
              employment: 'Nuclear Safety Inspector'
            });

            expect(events[1].get('data')).to.eql({
              name: {
                first: 'Marge',
                last: 'Simpson'
              },
              employment: 'Housewife'
            });
          });
        });
      });
    });
  };
});