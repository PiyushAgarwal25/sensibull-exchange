const express = require("express");
const { createOrder,modifyOrder,deleteOrder,getOrderStatus} = require("../controllers/order");
const checkXAuthToken = require("../middleware/checkAuthToken");
const router = express.Router();

router.use(express.json());
router.use(checkXAuthToken);

// to create order
router.post("/place",createOrder);

// to modify order
router.put("/:id",modifyOrder);

// to cancel order
router.delete("/:id",deleteOrder);

// to get status of the order
router.get("/status-for-ids",getOrderStatus);

module.exports = router;