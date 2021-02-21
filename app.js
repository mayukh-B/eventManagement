require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');
const multer = require("multer");
var fs = require('fs');
var nodemailer=require('nodemailer');
var path = require("path");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.eyjhl.mongodb.net/projectDB`, { useUnifiedTopology: true, useNewUrlParser: true });
/*=======================================================================
                             EVENT SCHEMA
========================================================================*/
const eventSchema = new mongoose.Schema({
    username:String,
    organizerName: String,
    eventName: String,
    description: String,
    location: String,
    tolalCapacity: Number,
    startDate: Number,
    startTime: String,
    endDate: Number,
    endTime: String,
    price:Number,
    city:String,
    image: 
    {
        data: Buffer,
        contentType: String
    },
    Booked:Number,
});
const Event = mongoose.model("Event", eventSchema);
/*=======================================================================
                            AUDIANCE SCHEMA
========================================================================*/
const audianceSchema = new mongoose.Schema({
    audiName: String,
    audiEmail:String,
    audiPhNum:Number,
    audiAge:Number,
    audiAddress:String,
    eventId:String,
    noOfTickets:Number,
    gender:String,

});

const Audiance = mongoose.model("AudianceDetail", audianceSchema);
/*=======================================================================
                         ORGANISER SCHEMA
========================================================================*/

const organiserSchema = new mongoose.Schema({
    username: String,
    name: String,
    email:String,
    password: String
    
});

organiserSchema.plugin(passportLocalMongoose);
const Organiser = mongoose.model("Organiser", organiserSchema);
passport.use(Organiser.createStrategy());
passport.serializeUser(Organiser.serializeUser());
passport.deserializeUser(Organiser.deserializeUser());


/*=======================================================================
                         COLLEGE EVENT SCHEMA
========================================================================*/
const collegeEventSchema = new mongoose.Schema({
    username: String,
    name: String,
    description: String,
    location: String,
    startDate: Number,
    startTime: String,
    endDate: Number,
    endTime: String,
    price:Number,
    collegeName: String,
    type: String,
    image: 
    {
        data: Buffer,
        contentType: String
    },
    Booked:Number

});

const CollegeEvent = mongoose.model("CollegeEvent", collegeEventSchema);

// const colEvent = new CollegeEvent({
//     username: "hello",
//     name: "world",
//     description: "nice",
//     location: "kolkata",
//     startDate: 210320,
//     startTime: "20:00",
//     endDate: 210320,
//     endTime: "21:00",
//     price: 200,
//     collegeName: "nice",
//     rules: "wow",
//     type: "quiz"
// });

//colEvent.save();

/*=======================================================================
                         Functions
========================================================================*/
function dateToNumber(car){
    let str=[]
    for(let i = 0; i<car.length ; i++){
        if(car[i] == '-'){
            continue;
        }else{
            str.push(car[i]);
        }
    }
    let newStr = str.join('');
    let newNumber =  Number(newStr);
    return newNumber;
}
function handleError(e){
    console.log(e);
}

function today(){
    let date = new Date;
    let day = (date.getDate())
    let month = (date.getMonth()+1)
    let year = (date.getFullYear())
    let exactDate = month <10 ? `${year}-0${month}-${day}` :`${year}-0${month}-${day}`
return exactDate;
}
/*=======================================================================
                         HOME ROUTE
========================================================================*/

app.get("/", (req,res)=>{
    let current = req.url;
    console.log(dateToNumber(today()));
    res.render("landing");
})


/*=======================================================================
                         ORGANISER ROUTE
========================================================================*/
app.get("/organiser", function(req, res){
    if (req.isAuthenticated()) {
        Event.find({username:req.user.username},function(err,foundEvents) // getting the data from the database
        
        {
            if(err)console.log(err)
            else{
                var name = req.user.name;
                res.render('organiser', {passedname: name,foundEvents})
            }
        })
        
    } else {
        res.redirect('/login');
    }
        Event.deleteMany({endDate: { $lte : dateToNumber(today())}},(err)=>{
            if(err) console.log(err);
        });
});


/*=======================================================================
                          EVENT IMAGE UPLOAD
========================================================================*/

var Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now());
    }
});
 
var upload = multer({ storage: Storage }).single('file');
/*=======================================================================
                         CREATE EVENT ROUTE
========================================================================*/

app.get("/createEvent", function(req, res){
    res.render("createEvent");
});

app.get("/pictures", function(req, res){
    Event.find({ image: { $ne: null } }, function (err, items) {
        if (err) {
            console.log(err);
        } else {
            if (items) {
                res.render("pictures", { items: items });
                };
            }
        
    });
})


app.post("/createEvent", upload, function(req,res){


    const event = new Event({
    username:req.user.username,
    eventName: req.body.Name,
    description: req.body.description,
    location: req.body.location,
    tolalCapacity: req.body.capacity,
    startDate: dateToNumber(req.body.startDate),
    startTime: req.body.startTime,
    endDate: dateToNumber(req.body.endDate),
    endTime: req.body.endTime,
    price:req.body.price,
    city:req.body.city,
    Booked:0,
    image: 
    {
        data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)),
        contentType: 'image/png'
    }
    });
    event.save(function(err, doc){
        if(err){
            throw err;
        }
        else{
            res.redirect("/organiser");
        }
    });
})

 app.post("/delete",function(req,res){
    var delid= req.body.id

   Event.deleteOne({_id:delid},function(err){
    if (err) console.log(err);
   });  

   res.redirect('organiser');
})


/*=======================================================================
                         CREATE COLLEGE EVENT ROUTE
========================================================================*/

// app.post("/collegeEvent", function(req, res){
//     const {colUsername,colEventName,colEventDescription,colLocation,startDate1,endDate1,colEventStartingTime,colEventPrice,colName,colEventEndingTime,type} = req.body;
//    console.log(colUsername)
//     const colEvent = new CollegeEvent({
//         username: colUsername,
//         name: colEventName,
//         description:colEventDescription,
//         location: colLocation,
//         startDate: dateToNumber(startDate1),
//         startTime: colEventStartingTime,
//         endDate: dateToNumber(endDate1),
//         endTime: colEventEndingTime,
//         price: colEventPrice,
//         collegeName: colName,
//         type: type,
//         image: 
//         {
//             data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)),
//             contentType: 'image/png'
//         },
//         Booked:0
//     });
    
//     colEvent.save();
// });


/*=======================================================================
                         AUDIANCE ROUTE
========================================================================*/

  
app.get("/cities/:city", (req,res)=>{
    const requestedCity = req.params.city;
    Event.find({city:requestedCity},(err,foundEvents)=>{
        if(err){
            console.log(err);
        }else{
            res.render("events",{foundEvents});
        }
    })
});

app.get("/cities/:city/:eventId", (req,res)=> {
    const requestedEvent = req.params.eventId;
    const requestedCity = req.params.city;
   
    Event.find({city:requestedCity,_id:requestedEvent},(err,foundEvent)=>{
        if(err){
            console.log(err);
        }else{
            
            res.render("eventDetails",{foundEvent})
            
        }
    })
});


/*=======================================================================
                         ANALYTICS ROUTE
=======================================================================*/
app.get("/analytics/:id", function(req, res){
    const requestedId=req.params.id;
    let malecount = 0, femalecount = 0, childrenCount =0, teenagerCount=0, middleAgedCount =0, seniorCitizenCount=0 ,arr=[]; 
    Event.find({_id:requestedId},function(err,foundEvent){
        if(err){
            console.log(err);
        }
        else{
            arr = foundEvent;
            
        }
    })
    .then(()=>{
        Audiance.find({eventId:requestedId}, function(err, foundAudience){
            console.log(foundAudience);
            if(err){
                console.log(err);
            }else{
                console.log(arr)
                console.log(arr[0].tolalCapacity);
                foundAudience.forEach(function(audience){
                    if(audience.gender === "Male"){
                        malecount = malecount+1;
                    } if(audience.gender === "Female") {
                        femalecount = femalecount + 1;
                    } if(audience.audiAge>=0 && audience.audiAge<=14){
                        childrenCount = childrenCount+1;
                    }if(audience.audiAge>14 && audience.audiAge<=24){
                        teenagerCount = teenagerCount+1;
                    }if(audience.audiAge>24 && audience.audiAge<=64){
                        middleAgedCount = middleAgedCount+1;
                    }if(audience.audiAge>64){
                        seniorCitizenCount = seniorCitizenCount+1;
                    }
                });
                res.render("analytics",{
                    passedAudience:foundAudience,
                    male: malecount, 
                    female: femalecount, 
                    children: childrenCount, 
                    teenager: teenagerCount,
                     middleAged: middleAgedCount, 
                    seniorCitizen: seniorCitizenCount,
                    booking:arr[0].Booked,
                    cap:arr[0].tolalCapacity
                });
            }
        })  
    });
});
/*=======================================================================
                         CITY
========================================================================*/
app.get("/cities/:city", (req,res)=>{
    const requestedCity = req.params.city;
    Event.deleteMany({endDate: { $lte : dateToNumber(today())}},(err)=>{
        if(err) console.log(err);
    });
    Event.find({city:requestedCity},(err,foundEvents)=>{
        if(err){
            console.log(err);
        }else{
            res.render("events",{foundEvents});
        }
 
    })
    
});
app.get('/events',(req,res)=>{
    Event.find({},(err,foundEvents)=>{
        if(err){
            console.log(err);
        }else{
            res.json(foundEvents)
        }
    })
})
app.post("/audiDetailsInput",(req,res)=>{
    
    const {AudiName,email,ph_num,age,address,id,tickets,gender} = req.body
    
    const audiance = new Audiance({
        audiName: AudiName,
        audiEmail:email,
        audiPhNum:ph_num,
        audiAge:age,
        audiAddress:address,
        eventId:id,
        noOfTickets:tickets,
        gender:gender
       });
    audiance.save();  

    console.log(id);
    Event.findById(id, (err, event) => {
        if (err) {
            console.log('Error');
        }
    
        event.Booked = Number(event.Booked) + Number(tickets);
    
        event.save((err, updatedevent) => {
            if (err) {
                console.log('Error');
            }
            else{
                console.log("success");
            }
        });
    });

    res.render("audiBookConfirm", {AudiName});


    
    var transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'grabmyseatSquad@gmail.com',
            pass:`${process.env.NODEMAILERPASSWORD}`
        }
    });
    
    var mailOptions={
        from:'grabmyseatSquad@gmail.com',
        to: req.body.email ,
        subject:'Test Email',
        text:'Thanks for contacting GRAB MY SEAT'
    };
    transporter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log('error');
        }
        else{
            console.log('Email sent:'+info.response);
        }
    });

});


app.get("/cities/:city/:eventId/booking",(req,res)=>{
    const requestedCity = req.params.city;
    const requestedEvent = req.params.eventId;
    Event.find({city: requestedCity, _id:requestedEvent},(err,foundEvent)=>{
        console.log(foundEvent);
        if(err){
            console.log(err);
        }else{
            var capacity = foundEvent[0].tolalCapacity;
            var booked = foundEvent[0].Booked; 
            var remain = (capacity-booked);
            res.render("audiDetailsInput",{foundEvent, remain});
        }
    })

});


/*=======================================================================
                         REGISTER ROUTES
========================================================================*/
app.get('/register', function (req, res) {
    res.render('register');
});
app.post('/register', function (req, res) {
    Organiser.register(
        {   
            username: req.body.username,
            name: req.body.name,
            email: req.body.email
            
        },
         req.body.password,

        function (err, organiser) {
            if (err) {
                console.log(err);
                res.redirect('/register');
            } else {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/organiser');
                    var transporter=nodemailer.createTransport({
                        service:'gmail',
                        auth:{
                            user:'grabmyseatSquad@gmail.com',
                            pass:`${process.env.NODEMAILERPASSWORD}`
                        }
                    });
                    
                    var mailOptions={
                        from:'grabmyseatSquad@gmail.com',
                        to:req.body.email,
                        subject:'Test Email',
                        text:'Thanks for contacting GRAB MY SEAT'
                    };
                    transporter.sendMail(mailOptions,function(error,info){
                        if(error){
                            console.log('error');
                        }
                        else{
                            console.log('Email sent:'+info.response);
                        }
                    });
                });
            }
        }
    );
});

/*=======================================================================
                         ORGANIZER LOGIN
========================================================================*/
app.get("/login",(req,res)=>{
    res.render('login');
})

app.post('/login', function (req, res) {
    const organiser = new Organiser({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(organiser, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local', {failureRedirect: '/login'})(req, res, function () {
                res.redirect("/organiser")
            });
        }
    });
});
/*=======================================================================
                         LOGOUT
========================================================================*/
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
app.listen(3000 , ()=>{
    console.log("server running at 3000")
})


