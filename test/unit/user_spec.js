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
var sue;

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
    global.nss.db.collection('users').drop(function(){
      User.register({email:'sue@aol.com', password: '1234'}, function(u){
      sue = u;
      done();
      });
    });
  });

  describe('.register', function(){
    it('should successfully register a user', function(done){
      var obj = {email:'bob@aol.com', password: '1234'};
      User.register(obj, function(u){
        expect(u).to.be.ok;
        expect(u).to.be.an.instanceOf(User);
        expect(u._id).to.be.an.instanceOf(Mongo.ObjectID);
        expect(u.password).to.have.length(60);
        done();
      });
    });

    it('should refuse to register a duplicate user', function(done){
      var obj = {email:'sue@aol.com', password: '1234'};
      User.register(obj, function(u){
        expect(u).to.be.null;
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should successfully find a user by their _id', function(done){
      User.findById(sue._id.toString(), function(user){
        expect(user).to.be.ok;
        expect(user).to.be.an.instanceOf(User);
        expect(user._id).to.be.an.instanceOf(Mongo.ObjectID);
        expect(user.password).to.have.length(60);
        done();
      });
    });

    it('should fail to find a user with a nonexistent _id', function(done){
      User.findById('not an id', function(user){
        expect(user).to.be.null;
        done();
      });
    });
  });
});
