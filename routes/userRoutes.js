const userController = require('../controllers/usersController');
const passport = require('passport');

module.exports = (app, upload) => {

    app.get('/api/users/findDeliveryMen', passport.authenticate('jwt', { session: false }), userController.findDeliveryMen);
    
    //Public
    app.post('/api/users/create', userController.register);
    app.post('/api/users/createWithImage', upload.array('image', 1), userController.registerWithImage);
    app.post('/api/users/login', userController.login);
    
    //Private
    app.put('/api/users/update', passport.authenticate('jwt', {session:false}), upload.array('image', 1), userController.UpdateWithImage);
    app.put('/api/users/updateWithoutImage', passport.authenticate('jwt', {session:false}), userController.UpdateWithoutImage);
   
}