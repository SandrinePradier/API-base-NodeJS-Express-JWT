
// import express from 'express';

// let router = express.Router();

// import jwt from 'jsonwebtoken';


// //defining our routes

// // Home
// router.get('/', (req, res) => {
// 	console.log('Welcome to our App');
// 	response.ok.message = 'Welcome to our App';
// 	response.ok.tokenaccess = 'Token not required';
// 	res.status(200).send(response.ok);
// });


// // create a user
// router.post('/create-user', (req, res) => {
// 	let body = req.body;
	
//     //validation
//     if (body.username && body.password){

//     	if(validator.isEmail(body.username)){

//     		User.findOne({ 'username': body.username}, function (err, result){

//     			if(!result) {
//     				console.log('user not found in database, lets create it');
//     				var newUser = new User;

// 	                //retreive the username and password values and assign them to our model
// 	                newUser.username = req.body.username;
// 	                newUser.password = req.body.password;
// 	                newUser.message = req.body.message;

// 	                //saving model to mongoDB
// 	                newUser.save(function(err){
// 	                	if(err){
// 	                		return err;
// 	                		console.log('user not saved');
// 	                	}
// 	                	else {
// 	                		console.log('user saved', newUser);
// 	                	}
// 	                });
// 	                //send response
// 	                response.ok.tokenaccess = 'Token not required';
// 	                response.ok.message = 'User created';
// 	                response.ok.content = newUser;
// 	                res.status(200).send(response.ok);
// 	            }
// 	            else {
// 	            	response.error.tokenaccess = 'Token not required';
// 	            	response.error.message = 'Username already exist';
// 	            	res.status(403).send(response.error);
// 	            }
// 	        });
//     	}
//     	else {
//     		response.error.tokenaccess = 'Token not required';
//     		response.error.message = 'Your username should be a valid email';
//     		res.status(412).send(response.error);
//     	}
//     }
//     else {
//     	response.error.tokenaccess = 'Token not required';
//     	response.error.message = 'You should provide all the required fields';
//     	res.status(412).send(response.error);
//     }
// });


// // login
// router.post('/login', (req, res) => {

// 	let body = req.body;
// 	console.log('body:', body);
	
// 	if (body.username && body.password){

// 		if(User.findOne({ 'username': body.username}, function (err, result) {

// 			if(err){
// 				return err;
// 				console.log(err);
// 			}

// 			if(!result) {
// 				response.error.tokenaccess = 'Token not required';
// 				response.error.message = 'You are not registered';
// 	    		res.status(401).send(response.error);
// 	    	}

// 	    	else {
// 	    		console.log('result found, one username is matching:', result);

// 				if(body.password == result.password){

// 	                //generate the token
// 	                let token = jwt.sign({ username:req.body.username }, 'mysecret', {
//           			expiresIn: 300}); // expires in 5 min ( expiresIn is in seconds)

// 	                //save the token in database
// 	                result.token = token;
// 	                result.save();

// 	                //delivrer the token and response
// 	                response.ok.tokenaccess = 'Token not required';
// 	                response.ok.message = 'Token delivered';
// 	                response.ok.content = token;
// 	                res.status(200).send(response.ok);
// 	            }

// 	            else {
// 	            	response.error.tokenaccess = 'Token not required';
// 	            	response.error.message = 'Wrong password';
// 	            	res.status(401).send(response.error);
// 	            }
// 	        }
// 	    }));
	    
//     } else {
//     	response.error.tokenaccess = 'Token not required';
//     	response.error.message = 'You should fill in username and password to login';
//     	res.status(401).send(response.error);
//     }

// });



// // Here middleware function to secure all below routes
// let checkToken = (req, res, next ) => {
//         //check headers
//         //NB, the token could also be passed through cookies
//         let token = req.headers['x-access-token'];
//         let headers = req.headers;
//         console.log('header: ', headers);

//         if(token){
//         	console.log('token: ', token);
// 	    //THIS is for information: only decode the token and see header token detail and payload
// 	        let decodedtoken = jwt.decode(token, {complete: true});
// 	        console.log('decodedheader', decodedtoken.header);
// 	        console.log('decodedpayload', decodedtoken.payload);
//         //Decode the token and check if valid
//           	jwt.verify(token,'mysecret',(err, decod)=>{
//           	if(err) throw error;
//           	if(!decod){
//           		response.error.tokenaccess = 'Token required';
//           		response.error.message = 'Wrong Token, access denied';
//           		res.status(403).send(response.error);
//           	}
//           	else{
// 	            req.decoded = decod;
// 	            //here we put decoded token in req so that we can get it in the next route
// 	            next(); 
// 	            //If decoded then call next() so that respective route is called.  
//           	}
//       });
//       }
//       else{
//       	response.error.tokenaccess = 'Token required';
//       	response.error.message = 'No Token, access denied';
//       	res.status(403).send(response.error);
//       }
//   };


// // we could also place here the middelware to secure all below routes with
// // app.use(checkToken),
// //but we will call it in the routes

// //get the user list.
// //this route only accessible if logged in
// router.get('/userlist', checkToken, (req, res) => {

// 	User.find({}, function (err, result) {
		 
// 		if(err) throw error;
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


// // Get the list of messages
// // This route only accessible if logged in. 
// // the retreived messages are the personal messages of the user logged in.
// router.get('/messages', checkToken, (req, res) => {

// 	User.findOne({'username' : req.decoded.username}, function (err, result) {
// 		if(err) throw error;
// 		if(!result){
// 			response.error.tokenaccess = 'Token required';
// 			response.error.message = 'Wrong Token, access denied';
//           	res.status(403).send(response.error);
// 		}
// 		else {
// 			response.ok.tokenaccess = 'Token required: Access granted';
// 			response.ok.message = 'Here are your messages';
// 			response.ok.content = result[0].message;
// 			res.status(200).send(response.ok);
// 		}
// 	});
// });

// //-------------to be tested------------

// //get one specific user.
// //This route only accessible if logged in.
// //example of route with params
// router.get('/userlist/:username', checkToken, (req, res)=>{
// 	console.log('myparams:', req.params);
// 	User.findOne({'username': req.params}, function(err, result){
// 		console.log('test 12');
// 		if(err) throw err;
// 		if(!result) {
// 			console.log('test 13');
// 			response.error.tokenaccess = 'Token required : Access granted';
// 			response.error.message = 'No user with such username found';
// 			res.status(403).send(response.error);
// 		}
// 		else{
// 			console.log('test 14');
// 			response.ok.tokenaccess = 'Token required : Access granted';
// 			response.ok.message = 'Here is the user information';
// 			response.ok.content = result[0];
// 			res.status(200).send(response.ok);
// 		}
// 	});
// });


// //Select a user in order to send him a message
// //This route only accessible if logged in.
// //example of route with queries
// router.get('/contact', checkToken, (req, res) =>{
// 	console.log(req.query)
// 	let userquery = req.query;
// 	if (!userquery){
// 		console.log('test 15');
// 		response.error.message = 'you should choose a user to whom send a message and pass it as a query in the url';
// 		res.status(403).send(response.error);
// 	}
// 	else {
// 		console.log('The user i want to send a message is :', userquery);
// 		console.log('test 16');
// 		response.ok.message = 'The user i want to send a message is :';
// 		response.ok.content = userquery;
// 		res.status(200).send('ok');
// 	}
// })






// export default router;