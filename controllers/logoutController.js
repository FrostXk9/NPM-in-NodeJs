const userDB = {
    users: require('../data/users.json'),
    setUsers: function (data) { this.users = data }
}
const fsPromises = require('fs').promises;
const path = require('path');

const handleLogOut = async (req, res) => {
    // On client, also delete the accessToken

    
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // no content to send back
    const refreshToken = cookies.jwt;

    // Is refresh token in DB?
    const foundUser = userDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true,  sameSite: 'None', secure: true });
        return res.sendStatus(204); //Forbidden
    }

    // Delete refreshToken in DB
    const otherUsers = userDB.users.filter(person => person.refreshToken !== foundUser.refreshToken );
    const currentUser = { ...foundUser, refreshToken: '' };
    userDB.setUsers({...otherUsers, currentUser});
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'data', 'users.json'),
        JSON.stringify(userDB.users)
    );

    res.clearCookie("jwt", { httpOnly: true, sameSite: 'None', secure: true }); // secure: true - only servers on https
    res.sendStatus(204);
}

module.exports = { handleLogOut };