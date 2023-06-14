const mongoose = require("mongoose");
const { v1: uuidv1 } = require('uuid');

const orderSchema = mongoose.Schema({
    order_id: {
      type: String,
      unique: true,
      required: true,
      default: () => `${uuidv1()}-${Date.now()}`,
    },
    order_tag: {
      type: String,
      required: true,
      default: '',
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    request_quantity: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: 'Request quantity must be greater than 0',
      },
    },
    filled_quantity: {
      type: Number,
      required: true,
    },
    order_status: {
      type: String,
      required: true,
    },
  }, { timestamps: true });

  orderSchema.methods.toJSON = function(){
    const order = this;
    const orderObject = order.toObject();

    delete orderObject.owner;
    delete orderObject.__v;
    delete orderObject["createdAt"];
    delete orderObject["updatedAt"];
    delete orderObject["_id"];
    return orderObject;
}

const orderModel = mongoose.model("Order",orderSchema);

module.exports = orderModel;










// "order_id": "3896f5f8-2258-412e-b42f-71b9d1351121",
// "order_tag": "yyyyyy",
// "symbol": "HDFC",
// "request_quantity": 200,
// "filled_quantity": 0,
// "status": "open"