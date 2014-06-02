/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'tddtodo-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var app = require('../../app/app');
var request = require('supertest');
var traceur = require('traceur');

var User;

describe('User', function(){
  before(function(done){
    request(app)
    .get('/')
    .end(function(){
      User = traceur.require(__dirname + '/../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(done);
  });

  beforeEach(function(done){
    var obj = {email:'sue@aol.com', password: '1234'};
    User.register(obj, done);
  });

  describe('.register', function(){
    it('should successfully register a user', function(){
      var obj = {email:'bob@aol.com', password: '1234'};
      User.register(obj, function(u){
        expect(u).to.be.ok;
        expect(u).to.be.an.instanceOf(User);
        expect(u._id).to.be.an.instanceOf(Mongo.ObjectID);
        expect(u.password).to.not.equal(obj.password);
      });
    });

    it('should refuse to register a duplicate user', function(){
      var obj = {email:'sue@aol.com', password: '1234'};
      User.register(obj, function(u){
        expect(u).to.be.null;
      });
    });

  });
});
