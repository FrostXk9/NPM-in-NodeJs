const userDB = {
    users: require('../data/users.json'),
    setUsers: function (data) { this.users = data }
}
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const fsPromises = require('fs').promises;
const path = require('path');

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' })
    const foundUser = userDB.users.find(person => person.username === user);
    if (!foundUser) return res.sendStatus(401); //Unauthorized
    //evaluate password
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        // Define roles
        const roles = Object.values(foundUser.roles);
        // Create JWTs(JSON Web Tokens)
        const accessToken = jwt.sign(
            { 
                "UserInfo" : {
                   "username": foundUser.username,
                   "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '50s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // Saving refreshToken with current user
        const otherUsers = userDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = { ...foundUser, refreshToken };
        userDB.setUsers({ ...otherUsers, currentUser });
        await fsPromises.writeFile(
            path.join('../data/users.json'),
            JSON.stringify(userDB.users)
        );
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };