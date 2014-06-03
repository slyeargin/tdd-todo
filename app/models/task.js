'use strict';

var Mongo = require('mongodb');
var tasks = global.nss.db.collection('tasks');
var _ = require('lodash');

class Task{
  static create(userId, obj, fn){
    var task = new Task();
    if(typeof userId === 'string'){
      if(userId.length !== 24){ fn(null); return;}
      userId = Mongo.ObjectID(userId);
    }else{
      task.title = obj.title ? obj.title : 'new task';
      task.due = obj.due ? new Date(obj.due) : new Date('6/2/2014');
      task.color = obj.color ? obj.color : 'red';
      task.isComplete = false;
      task.userId = userId;
    }
    tasks.save(task, (e, t)=>fn(task));
  }

  static findById(taskId, fn){
    if(typeof taskId === 'string'){
      if(taskId.length !== 24){
        fn(null);
        return;
      }
      taskId = Mongo.ObjectID(taskId);
    }

    tasks.findOne({_id: taskId}, (e, task)=>{
      if(!task){fn(null); return;}
      task = _.create(Task.prototype, task);
      fn(task);
    });
  }

  static findByUserId(userId, fn){
    if(typeof userId === 'string'){
      if(userId.length !== 24){
        fn(null);
        return;
      }
      userId = Mongo.ObjectID(userId);
    }

    tasks.find({userId: userId}).toArray((e, objs)=>{
      if(objs.length === 0){fn(null); return;}
      var tasks = objs.map(o=>_.create(Task.prototype, o));
      fn(tasks);
    });
  }

  destroy(fn){
    tasks.findAndRemove({_id:this._id}, (e,t)=>{
      fn(t);
    });
  }

  save(fn){
    tasks.save(this, ()=>fn());
  }

  toggleComplete(){
    this.isComplete = !this.isComplete;
  }
}

  module.exports = Task;
