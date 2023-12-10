const express = require('express');
const app = express();
const port = 3000;
//DB
const mysql = require('mysql2/promise');
const db_setting = {
    host: 'localhost',
    user: 'root',
    password: '',
    database:'mail_open_checker',
}
//Mail
const nodemailer = require('nodemailer');
const mail = 'example@gmail.com';
const pass ='**** **** **** ****';
const transporter =nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: mail,
        pass: pass,
    }
});

app.get('/form', async function (req, res) {
    app.set("view engine", "ejs");
    res.render('/Users/shinano/myapp/test.ejs');
});

app.get('/save',async function (req, res) {
    app.set("view engine", "ejs");
    const address = req.query['mail'];
    const subject = req.query['subject'];
    const main = req.query['main'];

    require('date-utils');
    const date = new Date();
    const currentTime = date.toFormat('YYYYMMDDHH24MISS');
    const flag_init = false;

    let connection;
    try {
        connection = await mysql.createConnection(db_setting);
        await connection.beginTransaction();
        const [row1] = await connection.query('insert into users (date, mail_address, subject, text, flag) values (?,?,?,?,?)',[currentTime, address, subject, main, flag_init]);
        await connection.commit()
    } catch (err){
        await connection.rollback();
    } finally {
        connection.end();
    }

    const info = await transporter.sendMail({
        from: mail,
        to: address,
        subject: subject,
        html: '<html><body><img src="cid:opener">' + main + '</body></html>',
        attachments: [
            {
                filename: 'http://localhost:3000/opener.png?id=3',
                path: './store/opener.png',
                cid: 'opener'
            }
        ]
    });

    res.render('/Users/shinano/myapp/test.ejs');
});

app.get('/update',async function (req, res) {
    app.set("view engine", "ejs");

    let id = req.query['mail_id'];
    let connection;
    try {
        connection = await mysql.createConnection(db_setting);
        await connection.beginTransaction();
        const [row1] = await connection.query('update users set flag=true where id = (?)',[id])
        await connection.commit()
    } catch (err){
        await connection.rollback();
    } finally {
        connection.end();
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});