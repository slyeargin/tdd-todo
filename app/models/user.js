'use strict';

var Mongo = require('mongodb');
var users = global.nss.db.collection('users');
var bcrypt = require('bcrypt');
var _ = require('lodash');

class User{
  static register(obj, fn){
    User.findByEmail(obj.email, u=>{
      if(u !== null){
        fn(null);
      }else{
        obj.password = bcrypt.hashSync(obj.password, 8);
        obj = _.create(User.prototype, obj);
        users.save(obj, ()=>fn(obj));
      }
    });
  }

  static findByEmail(email, fn){
    users.findOne({email:email}, (e, u)=>fn(u));
  }

  static findById(userId, fn){
    if (userId.length !== 24){
      fn(null);
      return;
    }
    userId = Mongo.ObjectID(userId);
    users.findOne({_id: userId}, (e, user)=>{
      user = _.create(User.prototype, user);
      fn(user);
    });
  }
}

module.exports = User;
