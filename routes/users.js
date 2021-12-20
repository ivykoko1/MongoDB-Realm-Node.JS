var express = require('express');
var router = express.Router();

/*MongoDB Realm Initialization*/
const Realm = require("realm");
const realmApp = new Realm.App({ id: "myfirstapp-dctbd" });

/*Database object schema*/
const TaskSchema = {
  name: 'Task',
  properties: {
    _id: 'string',
    _partition: 'string?',
    name: 'string',
    status: 'string',
  },
  primaryKey: '_id',
};


async function quickStart() {
  const realm = await Realm.open({
    path: "myrealm",
    schema: [TaskSchema],
  });
  // Add a couple of Tasks in a single, atomic transaction
  let task1, task2;



  realm.write(() => {
    task1 = realm.create("Task", {
      _id: "9",
      name: "go grocery shopping",
      status: "Open",
    });
    task2 = realm.create("Task", {
      _id: "5",
      name: "go exercise",
      status: "Open",
    });
    console.log(`created two tasks: ${task1.name} & ${task2.name}`);
  });
  // use task1 and task2
  // query realm for all instances of the "Task" type.
  const tasks = realm.objects("Task");
  console.log(`The lists of tasks are: ${tasks.map((task) => task.name)}`);
  // filter for all tasks with a status of "Open"
  const openTasks = tasks.filtered("status = 'Open'");
  console.log(
    `The lists of open tasks are: ${openTasks.map(
      (openTask) => openTask.name
    )}`
  );
  // Sort tasks by name in ascending order
  const tasksByName = tasks.sorted("name");
  console.log(
    `The lists of tasks in alphabetical order are: ${tasksByName.map(
      (taskByName) => taskByName.name
    )}`
  );
  // Define the collection notification listener
  function listener(tasks, changes) {
    // Update UI in response to deleted objects
    changes.deletions.forEach((index) => {
      // Deleted objects cannot be accessed directly,
      // but we can update a UI list, etc. knowing the index.
      console.log(`A task was deleted at the ${index} index`);
    });
    // Update UI in response to inserted objects
    changes.insertions.forEach((index) => {
      let insertedTasks = tasks[index];
      console.log(
        `insertedTasks: ${JSON.stringify(insertedTasks, null, 2)}`
      );
      // ...
    });
    // Update UI in response to modified objects
    // `newModifications` contains object indexes from after they were modified
    changes.newModifications.forEach((index) => {
      let modifiedTask = tasks[index];
      console.log(`modifiedTask: ${JSON.stringify(modifiedTask, null, 2)}`);
      // ...
    });
  }
  // Observe collection notifications.
  tasks.addListener(listener);
  realm.write(() => {
    task1.status = "InProgress";
  });
  realm.write(() => {
    // Delete the task from the realm.
    realm.delete(task1);
    // Discard the reference.
    task1 = null;
  });
  // Remember to close the realm
  realm.close();
}


async function logToRealm(){
  const credentials = Realm.Credentials.anonymous();
  const user = await realmApp.logIn(credentials);
  console.log(`Logged in with the user id: ${user.id}`);
  //Open the Realm with the desired schema
  const realm = await Realm.open({
    schema: [TaskSchema],
    sync: {
      user: realmApp.currentUser,
      partitionValue: "myPartition",
    },
  });
  console.log(realm);
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  quickStart().catch((error) => {
    console.log(`An error occurred: ${error}`);
  });
});

module.exports = router;
