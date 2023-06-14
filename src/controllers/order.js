
const orderModel = require('../models/order');
const cron = require('node-cron');

// cronJob function

function getRandomNumber(a, b) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber;
}

const updateFilledQuantity = async (order) => {
try {
  const randomValue = getRandomNumber(50,75);

  const { request_quantity, filled_quantity } = order;

  const errorProbability = 0.001; 
  if (Math.random() < errorProbability) {
    order.order_status = 'error';
    return await order.save();
  }

  const updatedFilledQuantity = filled_quantity + randomValue;

  if (updatedFilledQuantity > request_quantity) {
    order.filled_quantity = request_quantity;
  } else {
    order.filled_quantity = updatedFilledQuantity;
  }

  if (order.filled_quantity === request_quantity) {
    order.order_status = 'complete';
  }
  await order.save();

  console.log(`Updated filled quantity for order ${order.order_id}`);
} catch (error) {
  console.error(`Failed to update filled quantity for order ${order.order_id}`);
  console.error(error);
}
};

// Cron job definition
const cronJob = cron.schedule('*/3 * * * * *', async () => {
try {
  console.log('Cron job started...');

  const openOrders = await orderModel.find({ order_status: 'open' });

  for (const order of openOrders) {
    await updateFilledQuantity(order);
  }

  console.log('Cron job completed.');
} catch (error) {
  console.error('Cron job failed:');
  console.error(error);
}
});




const createOrder = async (req,res)=> {
    try {
      const { symbol, quantity,order_tag} = req.body;
  
      // Create a new order
      const order = new orderModel({
        order_tag,
        symbol,
        request_quantity: quantity,
        filled_quantity: 0,
        order_status: 'open',
      });
  
      // Save the order to the database
      await order.save();
  
      // Prepare the response payload
      const payload = {
        order: {
          order_id: order.order_id,
          order_tag: order.order_tag,
          symbol: order.symbol,
          request_quantity: order.request_quantity,
          filled_quantity: order.filled_quantity,
          status: order.order_status,
        },
        message: 'Order create success',
      };
  
      res.status(200).send({ success: true, payload });
    } catch (error) {
        console.log(error);
      res.status(400).send({ error: 'There was an error while creating the order' });
    }
  }

const modifyOrder = async (req,res)=>{
  const {id} = req.params;
  const quantity = req.body.quantity;
  try {
    const order = await orderModel.findOne({ order_id:id});
    if(!order){
      return res.status(400).send({error:"No order found with this id!"});
    }

    if(order.order_status !== "open"){
      return res.status(400).send({error:`The order cannot be modified at current moment as it is in ${order.order_status} state.`})
    }

    if(order.filled_quantity>quantity){
      return res.status(400).send({error:"Requested quantity cannot be modified !"})
    }

    order.request_quantity = quantity;

    await order.save();
    return res.status(200).send({
      "success": true,
      "payload": {
      "order": order,
      "message": "order update success"
    }
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({error:"Internal Server Error !"});
  }
};

const deleteOrder = async (req,res)=>{
  const {id} = req.params;
  console.log(id);
  try {
    const order = await orderModel.findOne({order_id:id});
    if(!order){
      return res.status(400).send({error:"No order found with this id!"});
    }

    if(order.order_status !== "open"){
      return res.status(400).send({error:`The order cannot be deleted at current moment as it is in ${order.order_status} state.`})
    }

    order.order_status = "cancel";

    await order.save();
    res.status(200).send({
      "success": true,
      "payload": {
      "order":order, 
      "message": "order cancel success"
       }
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({error:"Internal Server Error !"});
  }
};

const getOrderStatus = async (req,res)=>{
  const orderIds = req.body["order_ids"];
  console.log(orderIds);
  try {
    const orders = await orderModel.find({ order_id: { $in: orderIds } });
    return res.status(200).send({
      success:true,
      payload:orders,
    });
  } catch (error) {
    console.error('Error retrieving orders:', error);
    return res.status(400).send({error:"Error while getting orders !"});
  }
};

module.exports = {
    createOrder,
    modifyOrder,
    deleteOrder,
    getOrderStatus,
    cronJob
}