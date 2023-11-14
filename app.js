const express = require("express");
const bodyParser= require("body-parser");
const date= require(__dirname + "/date.js");
const mongoose= require("mongoose");
const _ = require('lodash');

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

const day = Date;

mongoose.connect('mongodb://localhost:27017/todoListDB')

const itemsSchema={
  name:{
    type:String,
    rquired:true
  }
}

const listSchema={
  name:{
    type:String,
    required:true
  },
  items:[itemsSchema]
}

const item= mongoose.model("item", itemsSchema)
const list= mongoose.model("list", listSchema)

const item1= new item({name:"Eat"});
const item2= new item({name:"Code"});
const item3 =new item({name:"Repeat"});

const defaultItems=[item1,item2,item3];

app.get("/",function(req,res){
  item.find({}).then((list)=>{
    if(list.length===0){
      item.insertMany(defaultItems).then(()=>{console.log("Database creted successfully")});
      res.redirect("/");
    }else{
      res.render("days",{
        today: "Today",
        listItem:list
      })
    }
  })
})

app.get("/:page",(req,res) => {
  const title= _.capitalize(req.params.page);
  list.findOne({name: title}).then((result) => {
    if(!result){
      const list1 = new list({
        name: title,
        items: defaultItems
      })
      list1.save();
      res.redirect("/" + title )
    }else{
      res.render("days",{
        today: result.name,
        listItem: result.items

      })
    }
  })
})

app.post("/",function(req,res){
    let itemName = req.body.listItem;
    let pagebutton= req.body.work;
    const item4= new item({name: itemName});
    if(pagebutton=== "Today"){
      item4.save();
      res.redirect("/");
    }else{
      list.findOne({name: pagebutton}).then((result)=>{
        result.items.push(item4);
        result.save();
        res.redirect("/" + pagebutton);
      })
    }
});

app.post("/delete", (req,res) => {
  let id= req.body.checkBox;
  let page= req.body.work;
  if (page === "Today"){
    item.deleteOne({_id: id}).then((response) => {
      console.log("Item Removed");
    });
    res.redirect("/");
  }else{
    list.updateOne({
      name: page,
    },
    {
      $pull:{
        items:{
          _id: id
        }
      }
    }
  ).then((response)=>{console.log('Item removed')})
    res.redirect("/" + page);
  }

})

app.listen( process.env.PORT || 3000,function(){
  console.log("server is running on port 3000");
});
