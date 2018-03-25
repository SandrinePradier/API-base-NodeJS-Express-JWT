import express from 'express';

// import router from 'routes';
// app.use('/', router);

import bodyParser from 'body-parser';

import morgan from 'morgan';

import mongoose from 'mongoose';
import mongooseTypeEmail from 'mongoose-type-email';
import validator from 'validator';

import jwt from 'jsonwebtoken';

let app = express();

//configuration

// sometimes the configuration is set in a separated file wich will be launched at the begining
// the bodyParser is set once for all in the main js file.
// because we do not want to repeat it in all our route files
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(morgan('dev'));

// CORS cross-origin
app.use(function (req, res, next) {
 res.header(`Access-Control-Allow-Origin`, `*`);
 res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
 res.header(`Access-Control-Allow-Headers`, `Content-Type`);
 next();
});


// conecting our db
mongoose.connect('mongodb://localhost:27017/dbapijwt', function(err){
	if (err){ throw err;}
	else {console.log('the data base is connected')}
});


//Variable for responses

let response = {
	ok:{
		status: 'success',
		tokenaccess:'',
		message: '',
		content: ''
	},
	error:{
		status: 'error',
		tokenaccess: '',
		message: ''
	}
}


// creating a schema:

let Schema = mongoose.Schema;

let userSchema = new Schema({
	username: {
		type: mongoose.SchemaTypes.Email,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	token: {
		type: String
	},
	message:{
		type: Array
	}
	//on pourra améliorer avec message étant un tableau, 
	// un user pourrait avoir plusieurs message, idealement horodatés
	// message: [{
	// 	date: {type: Date},
	// 	content: {type: String}
	// }]
});



// creation of a model based on our Schema
let User = mongoose.model('user', userSchema);

// //defining our routes

// Home
app.get('/', (req, res) => {
	console.log('Welcome to our App');
	response.ok.message = 'Welcome to our App';
	response.ok.tokenaccess = 'Token not required';
	res.status(200).send(response.ok);
});


// create a user
app.post('/create-user', (req, res) => {
	let body = req.body;
	
    //validation
    if (body.username && body.password){

    	if(validator.isEmail(body.username)){

    		User.findOne({ 'username': body.username}, function (err, result){

    			if(!result) {
    				console.log('user not found in database, lets create it');
    				var newUser = new User;

	                //retreive the username and password values and assign them to our model
	                newUser.username = req.body.username;
	                newUser.password = req.body.password;
	                newUser.message = req.body.message;

	                //saving model to mongoDB
	                newUser.save(function(err){
	                	if(err){
	                		return err;
	                		console.log('user not saved');
	                	}
	                	else {
	                		console.log('user saved', newUser);
	                	}
	                });
	                //send response
	                response.ok.tokenaccess = 'Token not required';
	                response.ok.message = 'User created';
	                response.ok.content = newUser;
	                res.status(200).send(response.ok);
	            }
	            else {
	            	response.error.tokenaccess = 'Token not required';
	            	response.error.message = 'Username already exist';
	            	res.status(403).send(response.error);
	            }
	        });
    	}
    	else {
    		response.error.tokenaccess = 'Token not required';
    		response.error.message = 'Your username should be a valid email';
    		res.status(412).send(response.error);
    	}
    }
    else {
    	response.error.tokenaccess = 'Token not required';
    	response.error.message = 'You should provide all the required fields';
    	res.status(412).send(response.error);
    }
});


// login
app.post('/login', (req, res) => {

	let body = req.body;
	console.log('body:', body);
	
	if (body.username && body.password){

		if(User.findOne({ 'username': body.username}, function (err, result) {

			if(err){
				return err;
				console.log(err);
			}

			if(!result) {
				response.error.tokenaccess = 'Token not required';
				response.error.message = 'You are not registered';
	    		res.status(401).send(response.error);
	    	}

	    	else {
	    		console.log('result found, one username is matching:', result);

				if(body.password == result.password){

	                //generate the token
	                let token = jwt.sign({ username:req.body.username }, 'mysecret'); 
	            //     let token = jwt.sign({ username:req.body.username }, 'mysecret', {
          			// expiresIn: 300}); // expires in 5 min ( expiresIn is in seconds)

	                //save the token in database
	                result.token = token;
	                result.save();

	                //delivrer the token and response
	                response.ok.tokenaccess = 'Token not required';
	                response.ok.message = 'Token delivered';
	                response.ok.content = token;
	                res.status(200).send(response.ok);
	            }

	            else {
	            	response.error.tokenaccess = 'Token not required';
	            	response.error.message = 'Wrong password';
	            	res.status(401).send(response.error);
	            }
	        }
	    }));
	    
    } else {
    	response.error.tokenaccess = 'Token not required';
    	response.error.message = 'You should fill in username and password to login';
    	res.status(401).send(response.error);
    }

});



// Here middleware function to secure all below routes
let checkToken = (req, res, next ) => {
        //check headers
        //NB, the token could also be passed through cookies
        let token = req.headers['x-access-token'];
        let headers = req.headers;
        console.log('header: ', headers);

        if(token){
        	console.log('token: ', token);
	    //THIS is for information: only decode the token and see header token detail and payload
	        let decodedtoken = jwt.decode(token, {complete: true});
	        console.log('decodedheader', decodedtoken.header);
	        console.log('decodedpayload', decodedtoken.payload);
        //Decode the token and check if valid
          	jwt.verify(token,'mysecret',(err, decod)=>{
          	if(err) return err;
          	if(!decod){
          		response.error.tokenaccess = 'Token required';
          		response.error.message = 'Wrong Token, access denied';
          		res.status(403).send(response.error);
          	}
          	else{
	            req.decoded = decod;
	            //here we put decoded token in req so that we can get it in the next route
	            next(); 
	            //If decoded then call next() so that respective route is called.  
          	}
      });
      }
      else{
      	response.error.tokenaccess = 'Token required';
      	response.error.message = 'No Token, access denied';
      	res.status(403).send(response.error);
      }
  };


// we could also place here the middelware to secure all below routes with
// app.use(checkToken),
//but we will call it in the routes

//get the user list.
//this route only accessible if logged in
// app.get('/userlist', checkToken, (req, res) => {

// 	User.find({}, function (err, result) {
		 
// 		if(err) return err;
// 		if(!result){
// 			response.error.tokenaccess = 'Token required: Access granted';
// 			response.error.message = 'No userlist found';
//           	res.status(403).send(response.error);
// 		}
// 		else {
// 			response.ok.tokenaccess = 'Token required: Access granted';
// 			response.ok.message = 'Here is the userlist';
// 			response.ok.content = result;
// 			res.status(200).send(response.ok);
// 		}
// 	});
// });


// Get the list of messages
// This route only accessible if logged in. 
// the retreived messages are the personal messages of the user logged in.
app.get('/messages', checkToken, (req, res) => {
	User.findOne({'username' : req.decoded.username}, function (err, result) {
		console.log('username: ' , req.decoded.username);
		if(err) console.log(err);
		if(!result){
			response.error.tokenaccess = 'Token required: Access granted';
			response.error.message = 'Some problem occured, your username has not been found in database, so we cannot deliver you messages';
          	res.status(403).send(response.error);
		}
		else {
			console.log('result:', result)
			response.ok.tokenaccess = 'Token required: Access granted';
			response.ok.message = 'Here are your messages';
			response.ok.content = result.message;
			res.status(200).send(response.ok);
		}
	});
});



//get one specific user information among the list of users
//This route only accessible if logged in.
//example of route with params
app.get('/userlist/:username', checkToken, (req, res)=>{
	console.log('myparams:', req.params);
	User.findOne({'username': req.params.username}, function(err, result){
		console.log('test 12');
		if(err) return err;
		if(!result) {
			console.log('test 13');
			response.error.tokenaccess = 'Token required : Access granted';
			response.error.message = 'No user with such username found';
			res.status(403).send(response.error);
		}
		else{
			response.ok.tokenaccess = 'Token required : Access granted';
			response.ok.message = 'Here is the user information';
			response.ok.content = result;
			res.status(200).send(response.ok);
		}
	});
});


//Select a user in order to send him a message
//This route only accessible if logged in.
//example of route with queries
app.get('/contact', checkToken, (req, res) =>{
	console.log(req.query)
	let userquery = req.query.username;
	if (!userquery){
		response.error.tokenaccess = 'Token required : Access granted';
		response.error.message = 'you should choose a user to whom send a message and pass it as a query in the url';
		res.status(403).send(response.error);
	}
	else {
		console.log('The user i want to send a message is :', userquery);
		response.ok.tokenaccess = 'Token required : Access granted';
		response.ok.message = 'The user i want to send a message is :';
		response.ok.content = userquery;
		res.status(200).send(response.ok);
	}
});


app.listen('8080', () => {
	console.log ('app running and listening to port 8080');
});


//PB TO SOLVE
// * PB response display in postman:
// 			access granted and the message we see is the one from the middlewear
			// the next function is called but we do not see the route message
// * PB Error: Can't set headers after they are sent. Some explanation here: https://github.com/mozilla/nunjucks/issues/652
// ALL SOLVED

//TODO
// push on git in repository where back is independant
// read me: routes avec postman
// routes for messages: DONE
// improve error for login: DONE
// better understanding of token and headers: OK
// rework route with params: DONE
// rework route with queries: TO BE TESTED, OK excepted headers pb
// make a dot.env
// make a router


//GET MORE EXPLANATIONS ON:
// req.decoded = decodedtoken; OK
// if (err), throw error // return err ; de manière générale quand doit on mettre return dans une fonction
// public / private keys pour les token
// différence entre http et https




