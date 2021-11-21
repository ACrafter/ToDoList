const express = require("express");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Ahmed-Admin:test123@cluster0.hhtu3.mongodb.net/todolistDB")
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemsSchema);

const getFood = new Item({
  name: "Welcome To Your Todolist!"
});

const cookFood = new Item({
  name: "Hit the + button to add a new task"
});

const eatFood = new Item({
  name: "{-- Hit the checkbox to delete an item"
});

const defaultItems = [getFood, cookFood, eatFood]

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  const day = date.getDate();


  Item.find({}, function(err, todoitems) {
    if (err) {
      console.log(err);
    } else {
      if (todoitems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("No Error");
          }
        });
        res.redirect("/")
      } else {
        res.render("list", {
          listTitle: "Default List",
          newListItems: todoitems,
          date: day
        });
      }
    }
  })
});

app.get("/:customListName", function(req, res) {
  const day = date.getDate();
  if (req.params.customListName != "favicon.ico") {
    var newListName = _.capitalize(req.params.customListName);


    List.findOne({
      name: newListName
    }, function(err, foundList) {
      if (!err) {
        if (!foundList) {
          //Creating a new list
          const list = new List({
            name: newListName,
            items: defaultItems
          });

          list.save();
          res.redirect("/" + newListName)
        } else {
          //Showing the required list
          res.render("list", {
            listTitle: newListName,
            newListItems: foundList.items,
            date: day
          })

        }
      }
    })


  }
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;

  item = new Item({
    name: itemName
  });

  if (req.body.list === "Default List") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: req.body.list}, function (err, listFound) {
      listFound.items.push(item);
      listFound.save();
      res.redirect("/" + req.body.list);
    });
  };
});

app.post("/delete", function(req, res) {
  const deletedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Default List") {
    Item.findByIdAndRemove(deletedItemId, function(err) {
      if (!err) {
        console.log("Error");
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedItemId}}}, function (err, foundList) {
      if(!err){
        res.redirect("/" + listName)
      }
    })
  }


});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
