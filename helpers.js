// Creates random String
function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
};

// get email from a user object
const getUserByEmail = function(email, users) {
  const values = Object.values(users);
  for (const user of values) {
    if (user.email === email) {
      return user;
    }
  }
}


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
