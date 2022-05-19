const generateRandomString = () => { // generate random 6 number character string
  let string = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
};

const checkUserByEmail = (obj, email) => { //function to check if email and any id are same
  let keys = Object.keys(obj);
  for (let key of keys) {
    if (obj[key].email === email) {
      return true; 
    }
  }
  return false;
};


const functions = {
  generateRandomString,
  checkUserByEmail,
}

module.exports = functions;