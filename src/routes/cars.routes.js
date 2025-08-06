const express = require('express');
const router = express.Router();
const { addCar, editCar, deleteCar, getAllCars, searchCars } = require('../controller/admin.controller');
const {isAuthenticated} = require('../middlewares/isAuth');
const { rentCar, rentCarWithFlutterwave } = require('../controller/rental.controller');

router.get('/get-cars', getAllCars);
router.get('/search-cars', searchCars);
router.post('/add-car',isAuthenticated, addCar);
router.put('/edit-car/:carId',isAuthenticated, editCar);
router.delete('/delete-car/:carId',isAuthenticated, deleteCar);

// Initiate payment and rental
router.post('/rent-car/:carId', isAuthenticated, rentCarWithFlutterwave);
// (Optional: keep old rentCar for admin/manual)

module.exports = router;