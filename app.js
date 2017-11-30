// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId:'97a5ee98-4bdb-4fa8-9492-83fccccca8cc',
    appPassword: 'pkrYI97#+*;lnstLLMSE105'
});
server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, function (session) {
    session.send("Welcome to pizza ordering bot");
    //session.beginDialog("OrderPizza");
});

var luisAppUrl = process.env.LUIS_APP_URL || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6c859e94-4d71-4698-ab95-11775ba29f57?subscription-key=137d934f7aea4f45a2216f250237285a&verbose=true&timezoneOffset=0&q=';

bot.recognizer(new builder.LuisRecognizer(luisAppUrl));

bot.dialog("OrderPizza",[
  function(session,args,next){
     var intent = args.intent;
     var type= builder.EntityRecognizer.findEntity(intent.entities,'Order.Type');
     var size = builder.EntityRecognizer.findEntity(intent.entities,'Order.Size');
     var toppings = builder.EntityRecognizer.findEntity(intent.entities,'Order.Toppings');
     var order = session.dialogData.order ={
       type: type ? type.resolution.values[0] : null,
        size: size ? size.resolution.values[0] : null,
        toppings: toppings ? toppings.resolution.values[0] : null
     }
console.log("intent.entities  :",intent.entities);
     console.log("type : ",type);
     console.log("size : ",size);
     console.log("toppings : ",toppings);
  if (!order.type) {
     builder.Prompts.text(session, "What type of pizza you want?");
  } else {
      next();
  }
},

function (session, results, next) {
    var order = session.dialogData.order;
    if (results.response) {
        console.log(order.type);
        var veg=["veg","vegetarian","vege","veggies"];
         var non= ["non veg","chicken","beef","non"];
         if(veg.indexOf(results.response)!=-1){
           order.type="Veg";
           console.log(order.type);
         }
         else if(non.indexOf(results.response)!=-1){
           order.type="Non Veg";
         }
         else{
           builder.Prompts.text("Enter valid Reply");
         }
    }

    // Prompt for the size of pizza
    if (!order.size) {
       builder.Prompts.text(session, "What size of pizza you want?");
      //  builder.Prompts.text(session, "What size of pizza you want?");
    } else {
      console.log(order.size);
        next();
    }
},
function (session, results, next) {
    var order = session.dialogData.order;
    if (results.response) {
        var large=["large","big","lrge","lrg"];
var small=["small","sml","little","tiny"];
var medium =["medium","med","medium sized","regular"];
        if(large.indexOf(results.response)!=-1){
          order.size="large";
          console.log(order.size);
        }
        else if(small.indexOf(results.response)!=-1){
          order.size="small";
        }
      else if(medium.indexOf(results.response)!=-1){
        order.size="medium";
      }
      else{
        builder.Prompts.text("Please enter valid reply");

      }
    }
    // Prompt for toppings of pizza
    if (!order.toppings) {
        builder.Prompts.text(session, "Do you want any Toppings ?");
    } else {
        next();
    }
},
function (session,results) {
    var order = session.dialogData.order
    if (results.response) {
        order.toppings = results.response;
        console.log(results.response);
        var Olive=["Olive","olive","olive slices"];
        var mushroom=["mushroom", "mushrooms","common mushroom","oyster"];
        var pepper=["pepperoni","pepprni","pepproni","spicy"];
        var onion=["onions","onion","onin","shallots"];
         if(Olive.indexOf(results.response)!=-1){
           order.toppings="Olive";
           console.log(order.toppings);
         }
         else if(mushroom.indexOf(results.response)!=-1){
           order.toppings="mushroom";
         }
         else if(pepper.indexOf(results.response)!=-1){
           order.toppings="Pepperoni";
         }
         else if(onion.indexOf(results.response)!=-1){
           order.toppings="Onions";
         }
         else {
           builder.Prompts.text("Please enter valid reply")
         }
    }

    // Send confirmation to user
    session.send(`Order confirmed. Order details: <br/>Type: ${order.type} <br/>size: ${order.size} <br/>toppings: ${order.toppings}`);
    session.endDialog();
}
]).triggerAction({
    matches: 'Order',
    confirmPrompt: "This will cancel the ordering. Are you sure?"
}).cancelAction('cancelpizza', "pizza order canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});
