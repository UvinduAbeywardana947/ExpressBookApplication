import express, { request, response } from "express";
import mongoose from "mongoose";
import   {PORT,mongoDBURL} from './config.js';
import {Book}  from './models/bookModels.js';
import {User} from './models/user.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../secrets.js";


const app = express();

//middleware for parsing request body
app.use(express.json());

app.get('/',(request,response)=>{
    console.log(request);
    return response.status(234).send('ok');
})
//save the book
app.post('/books',async(request,response)=>{
    try{
        const { title, author, publishYear, review } = request.body;
        const book = new Book({ title, author, publishYear, review });
        await book.save();// Await the asynchronous save operation
        response.json(book);
      } catch (error) {
        console.log('error message');
        response.status(400).send({ error: error.message });
      }
})

//get all books
app.get('/books',async(request,response)=>{
  try{
      const books = await Book.find({});
      return response.status(201).json(books);
  } catch(error){
    console.log('error message');
    response.status(400).send({error:error.message});
  }
});
//get book by id
app.get('/books/:id',async(request,response)=>{
  try{
    const {id} = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ error: 'Invalid book ID format' });
    }
    const book = await Book.findById(id);
    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }
    return response.status(201).json(book);
  } catch(error){
    console.log('error message');
    response.status(400).send({error:error.message});
  }
})
//update book by id
app.put('books/:id',async(request,response)=>{
  try{
    const {id} = request.params;
    const result = await Book.findByIdAndUpdate(id,request.body);
    if (!result) {
      return response.status(404).json({ message: 'Book not found' });
    }
    return response.status(201).json(result);
  }catch(error){
    console.log('error message');
    response.status(400).send({error:error.message});
  }
})
//get book by author
app.get('books/:author',async(request,response)=>{
  try{
    const {author} = request.params;
    const result = await Book.findByAuthor(author);
    if (!result || result.length === 0) {
      return response.status(404).json({ message: 'Book not found' });
  }
  }catch(error){
    console.log('error message');
    response.status(400).send({error:error.message});
  }
})
//get book by title
app.get('books/:title',async(request,response)=>{
  try{
    const {title} = request.params;
    const result = await Book.findByTitle(title);
    if (!result) {
      return response.status(404).json({ message: 'Book not found' });
    }
    return response.status(201).json(result); 
  }
  catch(error){
    console.log('error message');
    response.status(400).send({error:error.message});
  }
})
//get book review
app.get('books/:review',async(request,response)=>{
  try{
    const{review} = request.params;
    const result = await Book.findByReview(review);
    response.json(result);
  }
  catch(error){
    console.log('error message');
    response.status(400).send({error:error.message});
  }
})
//register new user
app.post('/register',async(request,response)=>{
  
    const {username,password} = request.body;
    if (!username || !password) {
      return response.status(400).send('Username and password are required');
    }
    try{
    //hash the password
    console.log(process.env);
    
    const token = jwt.sign({ password }, JWT_SECRET);
    //create new user
    const newUser = new User({ username, password });
    await newUser.save();
    response.status(201).send('User registered successfully');
    }
    catch(error){
      console.log(error);
      
      return response.status(400).send(error);
      
    }
})
//login as registerd user
app.post('/login', async (request, response) => {
  const { username, password } = request.body;

  // Check if the username and password are provided
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }
  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return response.status(400).send('Invalid username or password');
    }
console.log(user._id);

    // Verify the password
    if (user.password !== password) {
      return response.status(400).send('Invalid username or password');
    }

    // Generate a new JWT token for authentication
    const authToken = jwt.sign({ id:user._id }, JWT_SECRET, { expiresIn: '1h' });

    response.status(200).json({ message: 'Login successful', token: authToken });
  } catch (error) {
    console.log(error);
    
    response.status(500).send('Error logging in');
  }
})


//listen to the port
app.listen(PORT, ()=>{
    console.log('App is listening to the port');
}); 

//database connection
mongoose.connect(mongoDBURL, {
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
