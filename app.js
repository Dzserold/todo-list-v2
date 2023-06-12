const express = require('express')
const bodyParser = require("body-parser")
const app = express()
// const date = require(__dirname + "/date.js")
const port = 3000
const mongoose = require("mongoose")

const items = ["cook"];
const workItems = []

app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static("public"))

mongoose.connect("mongodb+srv://fdzserold:kecske113@dzserold.zypmygl.mongodb.net/todolistDB", { useNewUrlParser: true })

const itemSchema = new mongoose.Schema({
  name: String,
})

const Item = mongoose.model("item", itemSchema)

const buyFood = new Item({
  name: "Buy Food"
})

const cookFood = new Item({
  name: "Cook Food"
})

const eatFood = new Item({
  name: "Eat Food"
})

const defaultItems = [buyFood, cookFood, eatFood]

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.set('view engine', 'ejs');

app.get('/', (req, res) => {

  Item.find().then(function (items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems).then(() => {
        console.log("Success")
        res.redirect("/")
      }).catch((err) => {
        console.log(err)
      })
    }
    else {
      res.render("list", { listTitle: "Today", newListItem: items })
    }
  })
})

app.get("/:customListName", function (req, res) {
  let customListName = req.params.customListName
  customListName = capitalize(customListName)

  List.findOne({ name: customListName }).then(function (doc) {
    if (doc == null) {
      console.log("new list created")
      const list = new List({
        name: customListName,
        items: defaultItems
      })

      list.save()

      res.redirect("/" + customListName)
    }
    else {
      res.render("list", { listTitle: doc.name, newListItem: doc.items })
    }

  }).catch((err) => {
    console.log("ERROR")
    console.log(err)
  })

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.post('/', function (req, res) {
  const itemName = req.body.newItem
  const listName = req.body.list
  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    }).catch((err) => {
      console.log(err)
    })
  }
})

app.post('/delete', function (req, res) {
  const chekedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === "Today") {
    Item.findByIdAndRemove(chekedItemId).then(() => {
      console.log("Item removed")
      res.redirect("/")
    }).catch((err) => {
      console.log(err)
    })
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: chekedItemId } } })
      .then((foundList) => {
        res.redirect("/" + listName)
      }).catch((err) => {
        console.log(err)
      })
  }

})

app.get("/about", function (req, res) {
  res.render("about")
})

app.get("/work", function (req, res) {
  res.render('list', { listTitle: "Work", newListItem: workItems })
})

app.post("/work", function (req, res) {
  let item = req.body.newItem
  workItems.push(item)
  res.redirect("/work")
})

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}