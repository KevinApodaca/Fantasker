const express = require('express');
const app = express();

const {mongoose} = require('./db/mongoose');
const bodyParser = require('body-parser');

const { List, Task } = require('./db/models');

app.use(bodyParser.json());

/* CORS Header */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* **** LIST ROUTE HANDLERS ***** */

/* GET the lists */
app.get('/lists', (req, res) => {
    List.find().then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
})
/* POST a new list */
app.post('/lists', (req, res) => {
    let title = req.body.title;
    let newList = new List ({
        title
    });
    newList.save().then((listDoc) => {
        // return full list doc
        res.send(listDoc);
    })
})
/* PATCH and update a new list */
app.patch('/lists/:id', (req, res) => {
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });

})
/* DELETE a specific list */
app.delete('/lists/:id', (req, res) => {
    List.findOneAndRemove({ 
        _id: req.params.id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
    })
});

/* **** LIST ROUTE HANDLERS ***** */

/* GET all tasks in a list */
app.get('/lists/:listId/tasks', (req, res) => {
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
});

/* GET: the document for a specific item*/
app.get('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOne({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((task) => {
        res.send(task);
    })
});
/* POST a new task in some given list */
app.post('/lists/:listId/tasks', (req, res) => {
    let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId

    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    })
})
/* PATCH and update some task in some list */
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({
        _id: req.params.taskId,
        _listId: req.params.listId
    }, {
            $set: req.body
        }
    ).then(() => {
        res.send({message: "updated succesfully"});
    })
});
/* DELETE some unit task in some list */
app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndRemove({ 
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    })
});

app.listen(3000, () => {
    console.log('Listening on port 3000')
})
