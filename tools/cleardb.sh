#!/usr/bin/env mongo

db = new Mongo().getDB("OnlineWednesday");
db.dropDatabase();
print('Dropping: ' + db.getName());