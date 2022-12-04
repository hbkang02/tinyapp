function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
};

const getUserByEmail = function(email, users) {
  const values = Object.values(users);
  for (const user of values) {
    if (user.email === email) {
      return user;
    }
  }
}

// const getUserByEmail = (email, users) => {
//   for (const uid in users) {
//     const userObj = users[uid];
//     if (userObj.email === email) {
//       return users[uid];
//     }
//   }
// }

// const urlsForUser = function(userId) {
//   const urls = {};

//   const key = Object.keys(urlDatabase);
//   for (const id of keys) {
//     const url = urlDatabase[id];
//     if (url.userID === userId) {
//       urls[id] = url;
//     }
//   }
// }

const urlsForUser = (id, database) => {
  let userUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
