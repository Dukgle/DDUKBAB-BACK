const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');

function verifyToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
  //   console.log(token);
  
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 없습니다' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
          console.log(err);
        return res.status(401).json({ error: '인증 토큰이 유효하지 않습니다' });
  
      }
      req.userId = decoded.userId; // JWT에 저장된 사용자 ID를 request 객체에 저장
      req.role = decoded.role; // JWT에 저장된 사용자 역할을 request 객체에 저장
      next();
    });
  }

  router.get('/order-get', verifyToken, (req, res) => {
    const userId = req.userId;
    const query = `SELECT m.store_name,
                    CONCAT('[', GROUP_CONCAT(
                        JSON_OBJECT('menu_name', s.menu_name, 'image_path', m.image_path)
                    ), ']') AS menu_names
                    FROM shopping s
                    JOIN menu m ON s.menu_name = m.menu_name
                    WHERE s.user_id = ?
                    GROUP BY m.store_name;
`;
  
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error('장바구니 조회 오류:', err);
        res.status(500).json({ error: '장바구니 조회 실패' });
        return;
      }
      if (result.length === 0) {
        res.status(404).json({ error: '장바구니를 찾을 수 없습니다' });
        return;
      }
      const shopping = result; // 전체 값 가져오기
      res.json({ shopping });
    });
  });

  // 주문 모달 창 => total 값 필요로 price 값 가져와야함
  router.get('/order-check', verifyToken, (req, res) => {
    const userId = req.userId;
    
    const query = `SELECT m.menu_name, s.amount, s.total_price, m.store_name FROM shopping s 
    JOIN menu m ON s.menu_name = m.menu_name WHERE s.user_id = ?
    `;
  
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error('주문 조회 오류:', err);
        res.status(500).json({ error: '주문 조회 실패' });
        return;
      }
      if (result.length === 0) {
        res.status(404).json({ error: '주문을 찾을 수 없습니다' });
        return;
      }
      
    // 각 주문 항목의 가격을 더하여 총 주문 금액 계산
    let totalOrderAmount = 0;
    for (const order of result) {
        totalOrderAmount += order.total_price;
    }

    const ordersQuery = `INSERT INTO orders (user_id, total_price, created_at) VALUES (?,?,?)`;
    const createdAt = new Date();
    db.query(ordersQuery, [userId, totalOrderAmount, createdAt], (err, result) => {
        if (err) {
          console.error('주문 전달 오류:', err);
          res.status(500).json({ error: '주문 전달 실패' });
          return;
        }
        if (result.length === 0) {
          res.status(404).json({ error: '주문을 전달 할 수 없습니다' });
          return;
        }
        // res.json({message: "주문 전달 성공" });
    });
    res.json({ orders: result, totalOrderAmount, message : "주문 전달 성공"});
 }); 

});

  router.post('/order-select', verifyToken, (req, res) => {
    const userId = req.userId;
    const { menu_name, amount } = req.body;
  
    // 해당 사용자의 장바구니에 이미 동일한 메뉴가 있는지 확인
    const checkDuplicateQuery = `SELECT * FROM shopping WHERE user_id = ? AND menu_name = ?`;
  
    db.query(checkDuplicateQuery, [userId, menu_name], (err, duplicateResult) => {
      if (err) {
        console.error('중복 확인 오류:', err);
        res.status(500).json({ error: '중복 확인 실패' });
        return;
      }
  
      if (duplicateResult.length > 0) {
        // 이미 동일한 메뉴가 장바구니에 있는 경우 오류 처리
        console.error('이미 동일한 메뉴가 장바구니에 있습니다.');
        res.status(400).json({ error: '이미 동일한 메뉴가 장바구니에 있습니다.' });
        return;
      }
  
      const getMenuPriceQuery = `SELECT price FROM menu WHERE menu_name = ?`;
  
      db.query(getMenuPriceQuery, [menu_name], (err, menuResult) => {
        if (err) {
          console.error('가격 조회 오류:', err);
          res.status(500).json({ error: '가격 조회 실패' });
          return;
        }
  
        if (menuResult.length === 0) {
          // 메뉴가 존재하지 않는 경우 오류 처리
          console.error('메뉴를 찾을 수 없습니다.');
          res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' });
          return;
        }
  
        const menuPrice = menuResult[0].price;
  
        const query = `INSERT INTO shopping (user_id, menu_name, amount, total_price) VALUES (?,?,?,?)`;
  
        db.query(query, [userId, menu_name, amount, menuPrice * amount], (err, result) => {
          if (err) {
            console.error('장바구니 등록 오류:', err);
            res.status(500).json({ error: '장바구니 등록 실패' });
            return;
          }
  
          console.log('장바구니 등록 성공');
          res.json({ message: '장바구니 등록 성공' });
        });
      });
    });
  });
  

  router.delete('/order-delete/:id', verifyToken, (req, res) => {
    const userId = req.userId;
    const id = req.params.id;
  
    const query = `DELETE FROM shopping WHERE id=? AND user_id=?`;
  
    db.query(query, [id, userId], (err, result) => { // query에 넣어줄 값을 순서대로 리스트 안에 작성해줘야한다.
      if (err) {
        console.error('장바구니 삭제 오류:', err);
        res.status(500).json({ error: '장바구니 삭제 실패' });
        return;
      }
      if (result.affectedRows === 0) {
          res.status(404).json({ error: '장바구니 내용을 삭제할 수 없습니다' });
          return;
      }
      const successMsg ='장바구니 내용 삭제 성공';
      res.json({message:successMsg});
    });
  });

  module.exports = router;
