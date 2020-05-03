const mongoose = require('mongoose');

const bookmarkSchema = mongoose.Schema({
  title: {
    type: String, required: true
  }, id: {
    type: String, required: true, unique: true
  }, description: {
    type: String, required: true
  }, url: {
    type: String, required: true
  }, rating: {
    type: Number, required: true
  }
});

const bookmarksCollection = mongoose.model('bookmarks', bookmarkSchema);

const Bmarks = {
  createBookmark: function(newBookmark) {
    return bookmarksCollection.create(newBookmark).then(createdBookmark => {
        return createdBookmark;
      }).catch(err => {
        throw new Error(err);
      });
  }, getAllBookmarks: function() {
    return bookmarksCollection.find().then(allBookmarks => {
        return allBookmarks;
      }).catch(err => {
        return err;
      });
  }, getBookmark: function(title) {
    return bookmarksCollection.find({ title: `${title}` }).then(titleMatch => {
        return titleMatch;
      }).catch(err => {
        throw new Error(err);
      });
  }, deleteBookmark: function(id) {
    return bookmarksCollection.deleteOne({ id: id }).then(deleteResult => {
        return deleteResult;
      }).catch(err => {
        return err;
      });
  }, updateBookmark: function(id, params) {
    return bookmarksCollection.findOneAndUpdate({ id: id }, { $set: params }, { new: true }).then(bookmark => {
        return bookmark;
      }).catch(err => {
        return err;
      });
  }
};

module.exports = { Bmarks };