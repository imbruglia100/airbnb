const router = require('express').Router();
const { restoreUser } = require("../../utils/auth.js");

router.use(restoreUser);

router.get('/test', (req, res) => {
    res.json({ requestBody: req.body });
  });


module.exports = router;
