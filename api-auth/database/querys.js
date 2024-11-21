const { User, Client, Company } = require('../models');
const { sequelize } = require('../database/connection');
const bcrypt = require('bcryptjs');

const createUser = async function (data) {
    const transaction = await sequelize.transaction(); // Crear una transacción
    try {
        const hashed_password = await bcrypt.hash(data.password, 10);

        const new_user = await User.create(
            { ...data, password: hashed_password }, 
            { transaction }
        );
       
        const json_user = new_user.toJSON();

        if (json_user.role === 'cliente') {
            await Client.create(
                {
                    user_id: json_user.id,
                    date_birth: data.date_birth,
                    sex: data.sex
                },
                { transaction }
            );
        } else if (json_user.role === 'empresa') {
            await Company.create(
                {
                    user_id: json_user.id,
                    country: data.country,
                    city: data.city,
                    direction: data.direction,
                    phones: data.phones,
                    genres: data.genres
                },
                { transaction }
            );
        }

        await transaction.commit();

        return {
            id: json_user.id,
            email: json_user.email,
            role: json_user.role
        };
    } catch (error) {
        await transaction.rollback();
        return { code: -1, msg: error.message };
    }
};


// get del logeo - uso del token publico
const getUserByIdAndEmailAndRole = async function (id, email, role) {
    try {
        const user = await User.findOne({ where: { id: id, email: email, role: role } });
        if (!user) { return { code: 0, msg: "Invalid email or password" } }
        return { user };
    } catch (error) {
        return { code: -1, msg: error.message };
    }
}


// post de logeo de usuario - uso de credenciales
const getUserByEmailAndPassword = async function (email, password) {
    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) { return { code: 0, msg: "ningun usuario encontrado!" }}
        
        const validPwd = await bcrypt.compare(password, user.password);
        if (!validPwd) { return { code: 1, msg: "constraseña incorrecta!" }}

        const json_user = user.toJSON();
        delete json_user.password;
        switch (user.role) {
            case 'cliente':
                delete json_user.country;
                delete json_user.url_web;
                break;
            case 'empresa':
                delete json_user.date_of_birth;
                delete json_user.sex;
                break;
        }
        
        return { user: json_user };
    } catch (error) {
        console.error("Error:", error);
        return { code: -1, msg: error.message };
    }
}


const isEmailRegisted = async function (email) {
    try {
        const user = await User.findOne({ where: { email }, attributes: ['id'] });
        return !!user;
    } catch (error) {
        return { code: -1, msg: error.message };
    }
}

module.exports = {
    getUserByEmailAndPassword,
    getUserByIdAndEmailAndRole,
    isEmailRegisted,
    createUser,
};