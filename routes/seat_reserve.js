const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const moment = require('moment');
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

// function checkAndUpdateReservations() {
// const currentTime = moment();
// const fiveMinutesAgo = moment().subtract(5, 'minutes');

// const query = `
//     UPDATE reservations
//     SET status = 'available'
//     WHERE status = 'reserved' AND reservation_datetime <= ?;
// `;

// db.query(query, [fiveMinutesAgo.format('YYYY-MM-DD HH:mm:ss')], (err, result) => {
//     if (err) {
//     console.error('예약 업데이트 오류:', err);
//     return;
//     }
//     if (result.affectedRows > 0) {
//     console.log('예약이 5분 이상 경과하여 좌석이 다시 사용 가능 상태로 변경되었습니다.');
//     }
// });
// }

// 일정 간격으로 checkAndUpdateReservations 함수 호출
// setInterval(checkAndUpdateReservations, 60000); // 60초마다 실행 (1분)

// QR 찍힌 후 STATUS occupied로 변경

// 예약 정보 및 남은 시간을 가져오는 엔드포인트
router.get('/get/:reservationId', verifyToken, (req, res) => {
    const userId = req.userId;
    const reservationId = req.params.reservationId;
  
    const query = `SELECT seat_name, reservation_datetime FROM reservations WHERE reservation_id = ? AND user_id = ?`;
  
    db.query(query, [reservationId, userId], (err, result) => {
      if (err) {
        console.error('예약 정보 조회 오류:', err);
        res.status(500).json({ error: '예약 정보 조회 실패' });
        return;
      }
      if (result.length === 0) {
        res.status(404).json({ error: '예약 정보를 찾을 수 없습니다' });
        return;
      }
    // 예약 정보가 있는 경우
    const reservation = result[0];
    const reservationDatetime = new Date(reservation.reservation_datetime);
    reservationDatetime.setMinutes(reservationDatetime.getMinutes() + 10); // 예약 시간에 5분 추가

    const currentTime = new Date();

    // 남은 시간 계산 (분 단위로)
    const remainingTime = Math.max(Math.floor((reservationDatetime - currentTime) / 1000), 0)
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60;

    const time = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    if ( remainingTime <= 0) {
        const seat_name = result[0].seat_name;

        const updateStatusQuery = `UPDATE seats SET status='available' WHERE seat_name=?`;

      db.query(updateStatusQuery, [seat_name], (err, updateResult) => {
        if (err) {
          console.error('좌석 상태 업데이트 오류:', err);
          res.status(500).json({ error: '좌석 상태 업데이트 실패' });
          return;
        }
        
        res.json({ seat_name, seat_time: '0:00', message: '좌석 상태가 available로 변경되었습니다' });
      });

    } else {
      // 남은 시간을 클라이언트에게 전달
      const seat_name = result[0].seat_name
      const seat_time = time
      res.json({seat_name, seat_time});
    }

    });
  });
  
  
// 자리 예약 엔드포인트
router.post('/reserve', verifyToken, (req, res) => {
    const userId = req.userId;
    const { seat_name } = req.body;
  
    console.log(seat_name);
  
    // 현재 날짜와 시간 가져오기
    const reservationDatetime = new Date();
  
    // 자리 예약을 위해 자리 상태를 'reserved'로 업데이트
    const reserveQuery = `INSERT INTO reservations (user_id, seat_name, reservation_datetime) VALUES (?, ?, ?)`;
    const updateSeatStatusQuery = `UPDATE seats SET status='reserved' WHERE seat_name=?`;
  
    db.beginTransaction((err) => {
      if (err) {
        console.error('트랜잭션 시작 오류:', err);
        res.status(500).json({ error: '자리 예약 실패' });
        return;
      }
  
      // 자리 예약
      db.query(reserveQuery, [userId, seat_name, reservationDatetime], (err, result) => {
        if (err) {
          db.rollback(() => {
            console.error('자리 예약 오류:', err);
            res.status(500).json({ error: '자리 예약 실패' });
          });
          return;
        }
  
        // 자리 상태 업데이트
        db.query(updateSeatStatusQuery, [seat_name], (err, result) => {
          if (err) {
            db.rollback(() => {
              console.error('자리 상태 업데이트 오류:', err);
              res.status(500).json({ error: '자리 예약 실패' });
            });
            return;
          }
  
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error('트랜잭션 커밋 오류:', err);
                res.status(500).json({ error: '자리 예약 실패' });
              });
              return;
            }
  
            const successMessage = '자리 예약 성공';
            res.json({ message: successMessage });
          });
        });
      });
    });
  });
  
  // 자리 예약 취소 엔드포인트
  router.delete('/cancel/:reservationId', verifyToken, (req, res) => {
    const userId = req.userId;
    const reservationId = req.params.reservationId;
  
    const getSeatNameQuery = `SELECT seat_name FROM reservations WHERE reservation_id=?`;
  
    db.query(getSeatNameQuery, [reservationId], (err, result) => {
      if (err) {
        console.error('예약 정보 조회 오류:', err);
        res.status(500).json({ error: '자리 예약 취소 실패' });
        return;
      }
  
      if (result.length === 0) {
        res.status(404).json({ error: '예약을 찾을 수 없습니다' });
        return;
      }
  
      const seatName = result[0].seat_name;
  
      // 예약을 찾았으므로 자리 상태를 'available'로 업데이트
      const updateSeatStatusQuery = `UPDATE seats SET status='available' WHERE seat_name=?`;
  
      db.beginTransaction((err) => {
        if (err) {
          console.error('트랜잭션 시작 오류:', err);
          res.status(500).json({ error: '자리 예약 취소 실패' });
          return;
        }
  
        // 예약 취소
        const cancelQuery = `DELETE FROM reservations WHERE reservation_id=? AND user_id=?`;
  
        db.query(cancelQuery, [reservationId, userId], (err, result) => {
          if (err) {
            db.rollback(() => {
              console.error('자리 예약 취소 오류:', err);
              res.status(500).json({ error: '자리 예약 취소 실패' });
            });
            return;
          }

          if (result.affectedRows === 0) {
            // 아무 예약도 삭제되지 않았을 경우 취소 실패로 처리
            db.rollback(() => {
              console.error('자리 예약 취소 실패: 해당 예약을 찾을 수 없습니다');
              res.status(400).json({ error: '자리 예약 취소 실패: 해당 예약을 찾을 수 없습니다' });
            });
            return;
          }
  
          // 자리 상태 업데이트
          db.query(updateSeatStatusQuery, [seatName], (err, result) => {
            if (err) {
              db.rollback(() => {
                console.error('자리 상태 업데이트 오류:', err);
                res.status(500).json({ error: '자리 예약 취소 실패' });
              });
              return;
            }
  
            db.commit((err) => {
              if (err) {
                db.rollback(() => {
                  console.error('트랜잭션 커밋 오류:', err);
                  res.status(500).json({ error: '자리 예약 취소 실패' });
                });
                return;
              }
  
              const successMessage = '자리 예약 취소 성공';
              res.json({ message: successMessage });
            });
          });
        });
      });
    });
  });
  

module.exports = router;