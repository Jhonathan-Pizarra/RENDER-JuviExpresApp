const User = require('../models/user');
const Rol = require('../models/rol');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const storage = require('../utils/cloud_storage');

module.exports = {

    findDeliveryMen(req, res) {
        User.findDeliveryMen((err, data) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con al listar los repartidores',
                    error: err
                });
            }

            
            return res.status(201).json(data);
        });
    },

    login(req,res){

        const email = req.body.email;
        const password = req.body.password;

        User.findByEmail(email,
            async (err,cUser) =>{
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del usuarui',
                        error: err
                    });
                }

                if (!cUser) {
                    return res.status(401).json({
                        success: false,
                        message: 'El email no fue encontrado'
                    });
                }

                const isPasswordValid = await bcrypt.compare(password, cUser.password);

                if (isPasswordValid) {
                    const token = jwt.sign({id: cUser.id, email: cUser.email}, keys.secretOrKey,{});
                    const data = {
                        id: `${cUser.id}`,
                        name: cUser.name,
                        lastname: cUser.lastname,
                        email: cUser.email,
                        phone: cUser.phone,
                        image: cUser.image,
                        session_token: `JWT ${token}`,
                        roles: JSON.parse(cUser.roles)
                    }

                    return res.status(201).json({
                        success: true,
                        message: 'Usuario autenticado!',
                        data: data //El id del usuario que se registró
                    })
                }else{
                    return res.status(401).json({
                        success: false,
                        message: 'El password es incorrecta',
                    })
                }

            });
    },

    register(req, res){
        const user = req.body; //Capturo los datos que envie el cliente
        User.create(user, (err,data) =>{
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuarui',
                    error: err
                });
            }

            return res.status(201).json({
                success: true,
                message: 'El registro se realizó correctamente',
                data: data //El id del usuario que se registró
            })
        });
    },

    async registerWithImage(req, res){
        const user = JSON.parse(req.body.user); //Capturo los datos que envie el cliente
        
        const files = req.files;

        if (files.length > 0) {
            const path = `image_${Date.now()}`;
            const url = await storage(files[0], path);

            if (url != undefined && url != null) {
                user.image = url;
            }
        }


        User.create(user, (err,data) =>{
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuarui',
                    error: err
                });
            }

            user.id = `${data}`;
            const token = jwt.sign({id: user.id, email: user.email}, keys.secretOrKey,{});
            user.session_token = `JWT ${token}`;

            //Rol usuario
            Rol.create(user.id, 3, (err, data) => {
                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del rol de usuario',
                        error: err
                    });
                }

                return res.status(201).json({
                    success: true,
                    message: 'El registro se realizó correctamente',
                    data: user //El id del usuario que se registró
                });


            }); //3 = id de rol cliente

        });
    },

    //Update with image
    async UpdateWithImage(req, res){
        const user = JSON.parse(req.body.user); //Capturo los datos que envie el cliente
        
        const files = req.files;

        if (files.length > 0) {
            const path = `image_${Date.now()}`;
            const url = await storage(files[0], path);

            if (url != undefined && url != null) {
                user.image = url;
            }
        }


        User.update(user, (err,data) =>{

            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuarui',
                    error: err
                });
            }


            User.findById(data, (err, myData)=>{

                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del usuarui',
                        error: err
                    });
                }

                myData.session_token = user.session_token;
                myData.roles = JSON.parse(myData.roles);
    
                return res.status(201).json({
                    success: true,
                    message: 'El usuario se actualizó correctamente',
                    data: myData //El id del usuario que se registró
                });    

            })
        
        });
    },


     //Update with no image
     async UpdateWithoutImage(req, res){
        const user = req.body; //Capturo los datos que envie el cliente
        
        User.updateWithoutImage(user, (err,data) =>{
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: 'Hubo un error con el registro del usuarui',
                    error: err
                });
            }

            User.findById(data, (err, myData)=>{

                if (err) {
                    return res.status(501).json({
                        success: false,
                        message: 'Hubo un error con el registro del usuarui',
                        error: err
                    });
                }

                myData.session_token = user.session_token;
                myData.roles = JSON.parse(myData.roles);
    
                return res.status(201).json({
                    success: true,
                    message: 'El usuario se actualizó correctamente',
                    data: myData //El id del usuario que se registró
                });    

            })
        });
    },

    

}