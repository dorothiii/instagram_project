const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 5000;
const parser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(parser);

//===== MySQL 데이터베이스 연결 설정 =====//
const pool      =    mysql.createPool({
    connectionLimit : 10, 
    //connectTimeout  : 60 * 60 * 10000,
     //acquireTimeout  : 60 * 60 * 10000,
    //timeout         : 60 * 60 * 10000,
    acquireTimeout: 30000,
     host     : 'localhost',
     user     : 'root',
     password : '5872',
     database : 'test',
     port    :  3306,
     debug    :  false
 });

 app.post('/api/Login', (req, res) => {
    console.log('/api/Login 호출성공');
    console.log(req.body.name)
    const name = req.body.name;
    const password = req.body.password;
    if (pool) {
        console.log('pool 객체 생성');
        local(name, password)
            .then((result)=>{
               console.log('결과있음');
               console.log(name);
               res.send(name);
            }).catch((message)=>{
                console.log('pool연결안됨');
                res.send(false);
        });
    }else
         res.send(false);
  });

  //local로그인 인증함수
 const local = async (name, password) => {
	try {
		const connection = await pool.getConnection(async conn => conn);
		try {
            /* Step 3. */
            console.log('db접속성공');
			const ID = name;
			const PW = password;
			await connection.beginTransaction(); // START TRANSACTION
			const [rows] = await connection.query('INSERT INTO person(email, password) VALUES(?, ?)', [ID, PW]);
			await connection.commit(); // COMMIT
			connection.release();
			return rows;
		} catch(err) {
            console.log('db접속실패');
			await connection.rollback(); // ROLLBACK
			connection.release();
			console.log('Query Error');
			return false;
		}
	} catch(err) {
		console.log('DB Error');
		return false;
	}
};


app.listen(port, () => console.log(`Listening on port ${port}`));
