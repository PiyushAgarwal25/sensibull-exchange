const cron = require('node-cron');
const orderModel = require('./src/models/order');
const connectToMongo = require('./src/db/dbconnect');

connectToMongo();

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

cronJob.start();



