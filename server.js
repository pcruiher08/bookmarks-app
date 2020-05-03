const express = require('express');
const uuid = require('uuid');
const jsonParser = require('body-parser').json();
const morgan = require('morgan');
const mongoose = require('mongoose')
const {Bmarks} = require('./models/bmarksModel.js')
const app = express();
app.use( morgan('dev'));
app.use(middleware);

const apiKey = '2abbf7c3-245b-404f-9473-ade729ed4653';

function middleware (req, res, next){
  if ((!req.headers.authorization && !req.headers['book-api-key'] && !req.query.apiKey) || (req.headers.authorization && req.headers.authorization !== `Bearer ${apiKey}`) || (req.headers['book-api-key'] && req.headers['book-api-key'] !== apiKey) || (req.query.apiKey && req.query.apiKey !== apiKey) ){
    res.statusMessage = 'no key provided or it is invalid';
    return res.status(401).end();
  }
  next(); 
}

let params = {};

let bookmarksList = [
  {
    id: uuid.v4(),
    title: 'Facebook',
    description: 'Social Media',
    url: 'https://www.facebook.com/',
    rating: 3
  },
  {
    id: uuid.v4(),
    title: 'Juegos',
    description: 'Computer games',
    url: 'https://www.juegos.com/',
    rating: 5
  }
]

app.get('/bookmarks', (req, res) =>{
  Bmarks.getAllBookmarks().then(result => {
    return res.status(200).json(result);
  }).catch(err => {
    res.statusMessage = 'db failure'; //might add error message later
    return res.status(500).end();
  })
});

app.get('/bookmark', (req, res) => {
  let title = req.query.title;

  if(!title){
    res.statusMessage = 'no title provided'
    return res.status(406).end();
  }
/*
  let result = bookmarksList.filter((bookmark) =>{
    return bookmark.title == title;
  });

  if(result.length == 0){
    res.statusMessage = 'title was not found'
    return res.status(404).end();
  }

  return res.status(200).json(result);
  */

  Bmarks.getBookmark(title).then(result =>{
    if(result.length == 0){
      Response.statusMessage = 'title was not found';
      return res.status(404).end();
    }
    return res.status(200).json(result);
  }).catch(err =>{
    res.statusMessage = 'db failure'; //might add an error message later
    return res.status(500).end()
  })
});

app.patch('/bookmark/:id',jsonParser, (req, res) =>{

	let id = req.body.id;
	let parameters = req.params.id;
  
	if (!id){
	  res.statusMessage = 'please send an id';
	  return res.status(406).end();
	}
  
  
	if(id != parameters){
	  res.statusMessage = 'id not valid';
	  return res.status(409).end();
  }
  
  
  /*
	let foundBookmark = bookmarksList.findIndex((bookmark) =>{
	  if(bookmark.id == id){
		return true;
	  }
	});
  
	if(foundBookmark < 0){
	  res.statusMessage = 'id not found'
	  return res.status(404).end();
	}
  */
	if(req.body.title){
    //bookmarksList[foundBookmark].title = req.body.title;
    params['title']=req.body.title;
	}
  
	if(req.body.description){
	  //bookmarksList[foundBookmark].description = req.body.description;
    params['description']=req.body.description;
  }
  
	if(req.body.url){
    //bookmarksList[foundBookmark].url = req.body.url;
    params['url']=req.body.url;
	}
  
	if(req.body.rating){
    //bookmarksList[foundBookmark].rating = req.body.rating;
    params['rating']=req.body.rating;
	}
  
	//return res.status(202).json(bookmarksList[foundBookmark]); 
  
  bookmarksList.updateBookmark(id,params).then(result=>{
    if(!result){
      res.statusMessage = 'id not found';
      return res.status(404).end();
    }
    return res.status(202).json(result);
  }).catch(err => {
    res.statusMessage = 'database failure';
    return res.status(500).end();
  });


  });

app.post('/bookmarks', jsonParser, (req, res) =>{
  let id = uuid.v4();
  let title = req.body.title;
  let description = req.body.description;
  let rating = req.body.rating;
  let url = req.body.url;

  if(!title){
    res.statusMessage = 'title missing';
    return res.status(406).end();
  }

  if(!description){
    res.statusMessage = 'description missing';
    return res.status(406).end();
  }

  if(!rating){
    res.statusMessage = 'rating missing';
    return res.status(406).end();
  }

  if(!url){
    res.statusMessage = 'url missing';
    return res.status(406).end();
  }

  if(typeof(title) !== 'string'){
    res.statusMessage = 'title should be in a string format';
    return res.status(409).end();
  }

  if(typeof(description) !== 'string'){
    res.statusMessage = 'description should be in a string format';
    return res.status(409).end();
  }

  if(typeof(url) !== 'string'){
    res.statusMessage = 'url should be in the string format';
    return res.status(409).end();
  }

  if(typeof(rating) !== 'number'){
    res.statusMessage = 'rating should be in a number format';
    return res.status(409).end();
  }

  let newBookmark =  {
    id : id,
    title : title,
    description : description,
    url : url, 
    rating: rating
  };

  Bookmarks.createBookmark(newBookmark).then(result=>{
    return res.status(201).json(result);
  }).catch(err=>{
    res.statusMessage = 'database failure'; //might add a message later

    return res.status(500).end();
  });
});

app.delete('/bookmark/:id',  (req, res) =>{
  let id = req.params.id;
/*
  let foundBookmark = bookmarksList.findIndex((bookmark) =>{
    if(bookmark.id == id){
      return true;
    }
  });

  if(foundBookmark < 0){
    res.statusMessage = 'id not found'
    return res.status(404).end();
  }else{
    bookmarksList.splice(foundBookmark, 1);
    return res.status(200).end(); 
  }
});
*/
Bmarks.deleteBookmark(id).then(result => {
  if(result.deletedCount==0) {
    res.statusMessage='id not found';
    return res.status(404).end();
  }else{
    return res.status(200).end();
  }
  }).catch(err => {
    res.statusMessage = 'db failure';
    return res.status(500).end();
  });
});

app.listen(8080,() => {
  new Promise((resolve, reject) => {
    const settings = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    };
    mongoose.connect('mongodb://localhost/bookmarksdb', settings, err => {
      if(err){
        return reject(err);
      }else{
        console.log('Connected');
        return resolve();
      }
    });
  }).catch(err => {console.log(err);});
});