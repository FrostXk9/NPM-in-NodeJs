const express = require('express');
const router = express.Router();
const path = require('path');

//this must begin with a(^) slash(/) or (|) /index.html or make .html optional in the request with (.html)?
router.get('^/$|/index(.html)?', (req,res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});


module.exports = router