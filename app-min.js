require("dotenv").config();const express=require("express"),bodyParser=require("body-parser"),ejs=require("ejs"),mongoose=require("mongoose"),passport=require("passport"),session=require("express-session"),passportLocalMongoose=require("passport-local-mongoose"),multer=require("multer");var fs=require("fs"),nodemailer=require("nodemailer"),path=require("path");const app=express();app.set("view engine","ejs"),app.use(bodyParser.urlencoded({extended:!0})),app.use(express.static("public")),app.use(session({secret:"secret",resave:!1,saveUninitialized:!1})),app.use(passport.initialize()),app.use(passport.session()),mongoose.connect(`mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.eyjhl.mongodb.net/projectDB`,{useUnifiedTopology:!0,useNewUrlParser:!0});const eventSchema=new mongoose.Schema({username:String,organizerName:String,eventName:String,description:String,location:String,tolalCapacity:Number,startDate:Number,startTime:String,endDate:Number,endTime:String,price:Number,city:String,image:{data:Buffer,contentType:String},Booked:Number,BookedPer:Number,eventType:String}),Event=mongoose.model("Event",eventSchema),audianceSchema=new mongoose.Schema({audiName:String,audiEmail:String,audiPhNum:Number,audiAge:Number,audiAddress:String,eventId:String,noOfTickets:Number,gender:String,username:String,password:String}),Audiance=mongoose.model("AudianceDetail",audianceSchema),organiserSchema=new mongoose.Schema({username:String,name:String,email:String,password:String,role:String,prefEvent:String});organiserSchema.plugin(passportLocalMongoose);const Organiser=mongoose.model("Organiser",organiserSchema);passport.use(Organiser.createStrategy()),passport.serializeUser(Organiser.serializeUser()),passport.deserializeUser(Organiser.deserializeUser());const collegeEventSchema=new mongoose.Schema({username:String,name:String,description:String,location:String,startDate:Number,startTime:String,endDate:Number,endTime:String,price:Number,collegeName:String,type:String,image:{data:Buffer,contentType:String},Booked:Number,rules:String}),CollegeEvent=mongoose.model("CollegeEvent",collegeEventSchema);function dateToNumber(e){let n=[];for(let t=0;t<e.length;t++)"-"!=e[t]&&n.push(e[t]);let t=n.join("");return Number(t)}function handleError(e){}function numberToDate(e){let n=[];for(let t=0;t<e.length;t++)3==t||5==t?(n.push(e[t]),n.push("-")):n.push(e[t]);return n.join("")}function today(){let e=new Date,n=e.getDate(),t=e.getMonth()+1,r=e.getFullYear();return`${r}-0${t}-${n}`}app.get("/",((e,n)=>{e.url;n.render("landing")})),app.get("/organiser",(function(e,n){if(e.isAuthenticated()){var t=e.user.name,r=[];Event.find({username:e.user.username},(function(n,t){if(n);else{e.user.name;r=t}})).then((()=>{CollegeEvent.find({username:e.user.username},(function(e,a){e?handleError(e):n.render("organiser",{passedname:t,arr:r,foundcolEvents:a})}))}))}else n.redirect("/login");Event.deleteMany({endDate:{$lte:dateToNumber(today())}},(e=>{}))}));var Storage=multer.diskStorage({destination:"./public/uploads/",filename:(e,n,t)=>{t(null,n.fieldname+"_"+Date.now())}}),upload=multer({storage:Storage}).single("file");app.get("/createEvent",(function(e,n){n.render("createEvent")})),app.get("/pictures",(function(e,n){Event.find({image:{$ne:null}},(function(e,t){e||t&&n.render("pictures",{items:t})}))})),app.post("/createEvent",upload,(function(e,n){new Event({username:e.user.username,eventName:e.body.Name,description:e.body.description,location:e.body.location,tolalCapacity:e.body.capacity,startDate:dateToNumber(e.body.startDate),startTime:e.body.startTime,endDate:dateToNumber(e.body.endDate),endTime:e.body.endTime,price:e.body.price,city:e.body.city,eventType:e.body.eventType,Booked:0,BookedPer:0,image:{data:fs.readFileSync(path.join("./public/uploads/"+e.file.filename)),contentType:"image/png"}}).save((function(e,t){if(e)throw e;n.redirect("/organiser")}))})),app.post("/delete",(function(e,n){var t=e.body.id;Event.deleteOne({_id:t},(function(e){})),CollegeEvent.deleteOne({_id:t},(function(e){e&&handleError(e)})),n.redirect("organiser")})),app.get("/collegeEventform",(function(e,n){n.render("collegeEventform")})),app.post("/collegeEvent",upload,(function(e,n){new CollegeEvent({username:e.body.username,name:e.body.Name,description:e.body.description,location:e.body.location,startDate:dateToNumber(e.body.startDate),startTime:e.body.startingTime,endDate:dateToNumber(e.body.endDate),endTime:e.body.endTime,price:e.body.price,collegeName:e.body.colName,rules:e.body.rules,type:e.body.type,image:{data:fs.readFileSync(path.join("./public/uploads/"+e.file.filename)),contentType:"image/png"}}).save((function(e,t){e||n.redirect("/createEvent")}))})),app.get("/collegeEvents/:id",((e,n)=>{const t=e.params.id;CollegeEvent.find({_id:t},((e,t)=>{n.render("collegeEvent",{foundEvent:t,startDate:numberToDate(String(t[0].startDate)),endDate:numberToDate(String(t[0].endDate))})}))})),app.get("/cities/:city",((e,n)=>{const t=e.params.city;Event.find({city:t},((e,t)=>{e||n.render("events",{foundEvents:t})}))})),app.get("/cities/:city/:eventId",((e,n)=>{const t=e.params.eventId,r=e.params.city;Event.find({city:r,_id:t},((e,t)=>{e||n.render("eventDetails",{foundEvent:t})}))})),app.get("/analytics/:id",(function(e,n){const t=e.params.id;let r=0,a=0,i=0,o=0,s=0,d=0,u=[];Event.find({_id:t},(function(e,n){e||(u=n)})).then((()=>{Audiance.find({eventId:t},(function(e,t){e||(t.forEach((function(e){"Male"===e.gender&&(r+=1),"Female"===e.gender&&(a+=1),e.audiAge>=0&&e.audiAge<=14&&(i+=1),e.audiAge>14&&e.audiAge<=24&&(o+=1),e.audiAge>24&&e.audiAge<=64&&(s+=1),e.audiAge>64&&(d+=1)})),n.render("analytics",{passedAudience:t,male:r,female:a,children:i,teenager:o,middleAged:s,seniorCitizen:d,booking:u[0].Booked,cap:u[0].tolalCapacity}))}))}))})),app.get("/cities/:city",((e,n)=>{const t=e.params.city;Event.deleteMany({endDate:{$lte:dateToNumber(today())}},(e=>{})),Event.find({city:t},((e,t)=>{e||n.render("events",{foundEvents:t})}))})),app.get("/events",((e,n)=>{Event.find({},((e,t)=>{e||n.json(t)}))})),app.post("/audiDetailsInput",((e,n)=>{const{AudiName:t,email:r,ph_num:a,age:i,address:o,id:s,tickets:d,gender:u}=e.body;new Audiance({audiName:t,audiEmail:r,audiPhNum:a,audiAge:i,audiAddress:o,eventId:s,noOfTickets:d,gender:u}).save(),Event.findById(s,((e,n)=>{n.Booked=Number(n.Booked)+Number(d),n.BookedPer=Number(n.Booked)/n.tolalCapacity*100,n.save(((e,n)=>{}))})),n.render("audiBookConfirm",{AudiName:t});var c=nodemailer.createTransport({service:"gmail",auth:{user:"grabmyseatSquad@gmail.com",pass:`${process.env.NODEMAILERPASSWORD}`}}),p={from:"grabmyseatSquad@gmail.com",to:e.body.email,subject:"Test Email",text:"Thanks for contacting GRAB MY SEAT"};c.sendMail(p,(function(e,n){}))})),app.get("/cities/:city/:eventId/booking",((e,n)=>{const t=e.params.city,r=e.params.eventId;Event.find({city:t,_id:r},((e,t)=>{if(e);else{var r=t[0].tolalCapacity-t[0].Booked;n.render("audiDetailsInput",{foundEvent:t,remain:r})}}))})),app.get("/audiregister",(function(e,n){n.render("audiRegister")})),app.post("/audiregister",(function(e,n){Organiser.register({username:e.body.username,name:e.body.name,email:e.body.email,role:e.body.role,prefEvent:e.body.preferred},e.body.password,(function(t,r){t?n.redirect("/audiregister"):passport.authenticate("local")(e,n,(function(){"AUDIENCE"==e.user.role&&n.redirect("/audiLanding")}))}))})),app.get("/audiLanding",(function(e,n){if(e.isAuthenticated()){var t=[],r=e.user.prefEvent;Event.find({},(function(e,n){e||(t=n).sort(function(e,n){var t=1;"desc"===n&&(t=-1);return function(n,r){return n[e]<r[e]?-1*t:n[e]>r[e]?1*t:0*t}}("BookedPer","desc"))})).then((()=>{Event.find({eventType:r},(function(e,r){e||n.render("audiLanding",{passedEvent:r,arr:t})}))}))}else n.redirect("/audiLogin")})),app.get("/audiLogin",(function(e,n){n.render("audiLogin")})),app.post("/audiLogin",(function(e,n){const t=new Organiser({username:e.body.username,password:e.body.password});e.login(t,(function(t){t||passport.authenticate("local",{failureRedirect:"/audiLogin"})(e,n,(function(){"AUDIENCE"==e.user.role&&n.redirect("/audiLanding")}))}))})),app.get("/register",(function(e,n){n.render("register")})),app.post("/register",(function(e,n){Organiser.register({username:e.body.username,name:e.body.name,email:e.body.email,role:e.body.role},e.body.password,(function(t,r){t?n.redirect("/register"):passport.authenticate("local")(e,n,(function(){"ORGANISER"==e.user.role&&n.redirect("/organiser");var t=nodemailer.createTransport({service:"gmail",auth:{user:"grabmyseatSquad@gmail.com",pass:`${process.env.NODEMAILERPASSWORD}`}}),r={from:"grabmyseatSquad@gmail.com",to:e.body.email,subject:"Test Email",text:"Thanks for contacting GRAB MY SEAT"};t.sendMail(r,(function(e,n){}))}))}))})),app.get("/login",((e,n)=>{n.render("login")})),app.post("/login",(function(e,n){const t=new Organiser({username:e.body.username,password:e.body.password});e.login(t,(function(t){t||passport.authenticate("local",{failureRedirect:"/login"})(e,n,(function(){"ORGANISER"==e.user.role&&n.redirect("/organiser")}))}))})),app.get("/collegeEvents",(function(e,n){CollegeEvent.find({},(function(e,t){e||n.render("collegeEvents",{foundEvents:t})}))})),app.get("/logout",(function(e,n){e.logout(),n.redirect("/")})),app.listen(3e3,(()=>{}));