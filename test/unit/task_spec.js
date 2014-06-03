/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'tddtodo-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var app = require('../../app/app');
var request = require('supertest');
var traceur = require('traceur');

var Task;
var User;
var sue;
var bob;
var t1, t2, t3;

describe('Task', function(){
  before(function(done){
    request(app)
    .get('/')
    .end(function(){
      Task = traceur.require(__dirname + '/../../app/models/task.js');
      User = traceur.require(__dirname + '/../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('tasks').drop(function(){
      global.nss.db.collection('users').drop(function(){
        User.register({email:'sue@aol.com', password: '1234'}, function(u){
          sue = u;
          User.register({email:'bob@aol.com', password: '5678'}, function(u2){
            bob = u2;
            Task.create(sue._id, {title:'new task', due:'6/2/2014', color:'red'}, function(task){
              t1 = task;
              Task.create(sue._id, {title:'new task2', due:'6/2/2014', color:'red'}, function(task2){
                t2 = task2;
                Task.create(bob._id, {title:'bob\'s task', due:'6/3/2014', color:'green'}, function(task3){
                  t3 = task3;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('.create', function(){
    it('should create a new task, and pass it back to the user', function(done){
      var body = {title:'new task', due:'6/2/2014', color:'red'};
      Task.create(sue._id, body, function(task){
        expect(task).to.be.ok;
        expect(task).to.be.an.instanceOf(Task);
        expect(task._id).to.be.ok;
        expect(task._id).to.be.an.instanceOf(Mongo.ObjectID);
        expect(task.title).to.be.ok;
        expect(task.title).to.be.a('string');
        expect(task.due).to.be.ok;
        expect(task.due).to.be.an.instanceOf(Date);
        expect(task.color).to.be.ok;
        expect(task.color).to.be.a('string');
        expect(task.isComplete).to.be.false;
        expect(task.userId).to.be.ok;
        expect(task.userId).to.be.an.instanceOf(Mongo.ObjectID);
        done();
      });
    });

    it('should fail to create a task given an invalid userId', function(done){
      var body = {title:'new task', due:'6/2/2014', color:'red'};
      Task.create('not an id', body, function(task){
        expect(task).to.be.null;
        done();
      });
    });

    it('should default title to "new task"', function(done){
      var body = {title: null, due:'6/2/2014', color:'red'};
      Task.create(sue._id, body, function(task){
        expect(task.title).to.be.ok;
        expect(task.title).to.equal('new task');
        done();
      });
    });

    it('should default due date to "6/2/2014"', function(done){
      var body = {title:'new task', due:null, color:'red'};
      Task.create(sue._id, body, function(task){
        expect(task.due).to.be.ok;
        expect(task.due).to.be.an.instanceOf(Date);
        var tempDate = new Date('6/2/2014');
        expect(task.due.getTime()).to.equal(tempDate.getTime());
        done();
      });
    });

    it('should default color to "red"', function(done){
      var body = {title:'new task', due:'6/2/2014', color:null};
      Task.create(sue._id, body, function(task){
        expect(task.color).to.be.ok;
        expect(task.color).to.equal('red');
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should return a task object given an Object ID', function(done){
      Task.findById(t1._id, function(task){
        expect(task).to.be.ok;
        expect(task).to.be.an.instanceOf(Task);
        expect(task._id).to.be.deep.equal(t1._id);
        done();
      });
    });

    it('should return null given an invalid Object ID', function(done){
      Task.findById('not an id', function(task){
        expect(task).to.be.null;
        done();
      });
    });

    it('should return a task given an Object ID in string form', function(done){
      Task.findById(t1._id.toString(), function(task){
        expect(task).to.be.ok;
        expect(task).to.be.an.instanceOf(Task);
        done();
      });
    });
  });

  describe('.findByUserId', function(){
    it('should return an array of tasks given a userId', function(done){
      Task.findByUserId(sue._id, function(tasks){
        expect(tasks).to.be.ok;
        expect(tasks).to.have.length(2);
        expect(tasks[0].userId).to.deep.equal(sue._id);
        done();
      });
    });

    it('should return null given a userId that has no associated tasks', function(done){
      Task.findByUserId('538df9862cb7f41414511d67', function(tasks){
        expect(tasks).to.be.null;
        done();
      });
    });

    it('should return null given an invalid ID', function(done){
      Task.findByUserId('not an id', function(tasks){
        expect(tasks).to.be.null;
        done();
      });
    });
  });

  describe('#destroy', function(){
    it('should remove a task from the tasks collection', function(done){
      t2.destroy(function(){
        Task.findById(t2._id, function(task){
          expect(task).to.be.null;
          done();
        });
      });
    });
  });

  describe('#save', function(){
    it('should update/save an item to the database', function(done){
      t2.color = 'blue';
      t2.save(function(){
        Task.findById(t2._id, function(task){
          expect(task).to.be.ok;
          expect(task._id).to.deep.equal(t2._id);
          expect(task.color).to.equal(t2.color);
          done();
        });
      });
    });
  });

  describe('#toggleComplete', function(){
    it('should switch the isComplete boolean', function(){
      t2.toggleComplete();
      expect(t2.isComplete).to.be.true;
    });
  });
});
