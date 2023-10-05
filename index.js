// index.js

const express = require('express');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const posts = require('./routes/posts');
const my_page = require('./routes/my_page')
const seat_reserve = require('./routes/seat_reserve')
const user_change = require('./routes/user_change')
const bookmark = require('./routes/bookmark');
const shopping = require('./routes/shopping')
const order = require('./routes/order')

const saler_page = require('./routes/saler/saler_page')
const saler_change = require('./routes/saler/saler_change')
const saler_menu = require('./routes/saler/menu')

// const image = require('./image');

const app = express();
const port = 3000;

// Body 파서 설정
app.use(bodyParser.json());

// API 라우트 추가
app.use('/api', users);
app.use('/api/users', user_change);
app.use('/api/users', my_page);
app.use('/api/users/reservation', seat_reserve);
app.use('/api/users/posts', posts);
app.use('/api/users/bookmarks', bookmark);
app.use('/api/users/shopping', shopping);
app.use('/api/users/order', order); // 많은 수량으로 인해 자동적으로 품절 처리 ? 가능하면 구현

app.use('/api/salers', saler_menu)
app.use('/api/salers', saler_page);
app.use('/api/salers', saler_change);

// app.use('/image', image);

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
