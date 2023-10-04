const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../../config/dbConfig');


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
      req.salerId = decoded.salerId; // JWT에 저장된 사용자 ID를 request 객체에 저장
      req.uniNum = decoded.uni_num;
      req.role = decoded.role; // JWT에 저장된 사용자 역할을 request 객체에 저장
      next();
    });
  }

  router.get('/sold-out/:menuName', verifyToken ,(req,res) => {
    const salerId = req.salerId;
    const uniNum = req.uniNum;
    const role = req.role;
    const menuName = req.params.menuName;

    // console.log(salerId, uniNum, role);

    // let tableName;
    // if (role === "판매자") {
    //     if (uniNum === "마성떡볶이") tableName = 'masung';
    //     else if (uniNum === "한우사골마라탕") tableName = 'mara';
    //     else if (uniNum === "파스타") tableName = 'pasta';
    //     else if (uniNum === "군산카츠") tableName = 'pork';
    //     else if (uniNum === "샌드위치카페") tableName = 'cafe';
    //     else if (uniNum === "토스트") tableName = 'toast';
    //     else if (uniNum === "오늘의메뉴A") tableName = 'today_menu_a';
    //     else if (uniNum === "오늘의메뉴B") tableName = 'today_menu_b';
    // }

    const query = `SELECT out_of_stock FROM menu WHERE menu_name = ?`;

    db.query(query, [menuName], (err, result) => {
        if (err) {
            console.error('품절 확인 오류:', err);
            res.status(500).json({ error: '품절 확인 실패' });
            return;
          }
          const out_of_stock = result[0];
          res.json({out_of_stock});
    })
});
router.put('/sold-out', verifyToken ,(req,res) => {
    const salerId = req.salerId;
    const uniNum = req.uniNum;
    const role = req.role;
    const {menu_name, out_of_stock} = req.body;

    // console.log(salerId, uniNum, role);

    // let tableName;
    // if (role === "판매자") {
    //     if (uniNum === "마성떡볶이") tableName = 'masung';
    //     else if (uniNum === "한우사골마라탕") tableName = 'mara';
    //     else if (uniNum === "파스타") tableName = 'pasta';
    //     else if (uniNum === "군산카츠") tableName = 'pork';
    //     else if (uniNum === "샌드위치카페") tableName = 'cafe';
    //     else if (uniNum === "토스트") tableName = 'toast';
    //     else if (uniNum === "오늘의메뉴A") tableName = 'today_menu_a';
    //     else if (uniNum === "오늘의메뉴B") tableName = 'today_menu_b';
    // }

    const query = `UPDATE menu SET out_of_stock = ? WHERE menu_name = ?`;
    db.query(query, [out_of_stock, menu_name], (err, result) => {
      if (err) {
        console.error('품절 처리 오류:', err);
        res.status(500).json({ error: '품절 처리 실패' });
        return;
      }
      if (result.affectedRows === 0) {
        res.status(400).json({ error: '메뉴가 존재하지 않습니다.'})
        return;
      }
      console.log('품절 처리 성공');
      res.json({ message: '품절 처리 성공' });
    });
    
});

module.exports = router;