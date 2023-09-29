// index.js

const express = require('express');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const posts = require('./routes/posts');
const user_change = require('./routes/user_change')
const saler_change = require('./routes/saler_change')

const app = express();
const port = 3000;

// Body 파서 설정
app.use(bodyParser.json());

// API 라우트 추가
app.use('/api', users);
app.use('/api/users', user_change);
app.use('/api/users/posts', posts);
app.use('/api/salers', saler_change);

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
