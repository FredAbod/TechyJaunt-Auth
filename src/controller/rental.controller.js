const Car = require("../models/car.schema");
const User = require("../models/user.schema");
const Transaction = require("../models/transaction.schema");
const flwApi = require("../config/flutterwave");

// Initiate car rental and payment
exports.rentCarWithFlutterwave = async (req, res) => {
  const { carId } = req.params;
  const userId = req.user.id;
  const { startDate, endDate } = req.body;

  try {
    // Find the car by ID
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    if (car.isRented) {
      return res.status(400).json({ message: "Car is already rented" });
    }
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if Date is not In The Past
    if (new Date(startDate) < new Date()) {
      return res.status(400).json({ message: "Start date cannot be in the past" });
    }

    // Calculate total price (use car.price, or add logic for days)
    const totalPrice = car.price;
    // Create a pending transaction
    const transaction = await Transaction.create({
      senderId: userId,
      carId: car._id,
      amount: totalPrice,
      status: "pending",
      startDate,
      endDate,
    });
    // Initiate payment with Flutterwave
    const paymentData = {
      tx_ref: `car_rental_${transaction._id}_${Date.now()}`,
      amount: totalPrice,
      currency: "NGN",
      redirect_url:
        process.env.FLW_REDIRECT_URL ||
        "http://localhost:3000/api/payment/flutterwave/callback",
      customer: {
        email: user.email,
        name: user.name,
      },
      customizations: {
        title: "Car Rental Payment",
        description: `Payment for renting ${car.make} ${car.model}`,
      },
      meta: {
        transactionId: transaction._id.toString(),
        carId: car._id.toString(),
        userId: user._id.toString(),
      },
    };
    const flwRes = await flwApi.post("/payments", paymentData);
    if (flwRes.data.status !== "success") {
      return res.status(500).json({ message: "Failed to initiate payment" });
    }
    // Save tx_ref to transaction
    transaction.tx_ref = paymentData.tx_ref;
    await transaction.save();
    // Return payment link to frontend
    return res.status(200).json({
      message: "Payment initiated",
      paymentLink: flwRes.data.data.link,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Error initiating payment:", error?.response?.data || error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.rentCar = async (req, res) => {
  const { carId } = req.params;
  const userId = req.user.id;
  const { startDate, endDate, totalPrice } = req.body;

  try {
    // Find the car by ID
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Check if the car is already rented
    if (car.isRented) {
      return res.status(400).json({ message: "Car is already rented" });
    }

    // Update the car's rental status
    car.isRented = true;
    car.rentedBy = userId;
    car.startDate = startDate;
    car.endDate = endDate;
    car.totalPrice = totalPrice;
    car.status = "pending"; // Set initial status to pending
    await car.save();

    return res.status(200).json({ message: "Car rented successfully", car });
  } catch (error) {
    console.error("Error renting car:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
