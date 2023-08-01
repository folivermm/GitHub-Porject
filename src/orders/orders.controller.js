const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

//middleware to check for order existance
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        next();
    }
    next({
        status: 404, message: `Order ${orderId} does not exist.`,
    });
}

//middleware to check order id matches route id 
function orderIdMatch(req, res, next) {
    if (!req.body.data.id) {
        next();
    }
    if (req.body.data.id !== req.params.orderId) {
        next({
            status: 400, message: `Order id: ${req.body.data.id} does not match route id: ${req.params.orderId}.`
        })
    }
    next();
}

////middlware to validadte order properties
function validateOrder(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

    if (!deliverTo || deliverTo === "") {
        next({ status: 400, message: "Order must include a deliverTo" });
    }

    if (!mobileNumber || mobileNumber === "") {
        next({ status: 400, message: "Order must include a mobileNumber" });
    }

    if (!dishes || !Array.isArray(dishes) || dishes.length <= 0) {
        next({ status: 400, message: "Order must include at least one dish" });
    }

    const dishIndexNumber = dishes.findIndex((dish) => {
        const { quantity } = dish;
        return typeof quantity !== "number" || quantity <= 0 || quantity % 1 !== 0;
    });

    if (dishIndexNumber !== -1) {
        next({
            status: 400,
            message: `Dish ${dishIndexNumber} must have a quantity that is a positive integer.`,
        });
    }
    next();
}

//Route handler create
function create(req, res, next) {
    const {
        data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}
//route handler read
function read(req, res, next) {
    res.json({ data: res.locals.order });
}

//middleware to check status before updating
function checkUpdateStatus(req, res, next) {
    const orderToUpdate = req.body.data;
    if (!orderToUpdate.status || orderToUpdate.status === "invalid") {
        next({
            status: 400, message: "A pending status is required to update an order.",
        });
    };
    next()
}

//route handler update
function update(req, res, next) {
    const { deliverTo, mobileNumber, dishes } = req.body.data;
    const { order } = res.locals;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    res.json({ data: order });
}


//middleware to check delete status before deleting 
function checkDestroyStatus(req, res, next) {
    const order = res.locals.order;
    if (order.status !== "pending") {
        next({
            status: 400, message: "An order must be pending to Delete"
        })
    }
    next()
}

//route handler for delete 
function destroy(req, res, next) {
    const index = orders.findIndex((order) => order.id === res.locals.order.id);
    orders.splice(index, 1);
    res.sendStatus(204);
}

//route handler list 
function list(req, res, next) {
    res.json({ data: orders });
}

module.exports = {
    list,
    create: [validateOrder, create],
    read: [orderExists, read],
    update: [orderExists, validateOrder, checkUpdateStatus, orderIdMatch, update],
    destroy: [orderExists, checkDestroyStatus, destroy],
};
