const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  //check for duplicate username in the db
  const duplicate = usersDB.users.find((person) => person.username === user);
  if (duplicate) return res.sendStatus(409); // conflict

  try {
    //encrypt password
    const hashedPwd = await bcrypt.hash(pwd, 10);

    //store new user
    const newUser = { username: user, password: hashedPwd };
    usersDB.setUsers([...usersDB.users, newUser]);

    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(usersDB.users)
    );

    console.log(usersDB.users);
    res.status(201).json({ Success: `New user ${user} created` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleNewUser };
