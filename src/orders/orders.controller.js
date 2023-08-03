const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

//middleware to check for order existance 
//finds specified order from the collection of orders 
//makes finding an order accessible to subsequent route handlers
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
//ensures that when updating a order, the "id" provided in the request body 
//matches the "orderId" specified in the URL route.
//helps prevent accidental changes to the wrong order 
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

//middlware to validadte order deliverTo property 
//ensures that the request body contains the deliverTo property 
//with valid values before processing other creation/update logic 
function deliverToExists(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (!deliverTo || deliverTo === "") {
        next({ status: 400, message: "Order must include a deliverTo" });
    } else {
        next()
    }
}

//middlware to validadte order mobileNumber property 
//ensures that mobileNumber being created or updated contains a valid and non-empty name
//helps prevent order with missing mobileNumbers from being stored 
function mobileNumberExists(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (!mobileNumber || mobileNumber === "") {
        next({ status: 400, message: "Order must include a mobileNumber" });
    } else {
        next()
    }
}

//middlware to validadte order dishes property 
//ensures that dishes being created or updated is an array with at least one element 
function dishesExist(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (!dishes || !Array.isArray(dishes) || dishes.length <= 0) {
        next({ status: 400, message: "Order must include at least one dish" });
    } else {
        next()
    }
}

//middleware to validate quantity is postive whole number 
//ensures that dish quantities are positive integers before proceeding with creation/update.
function checkDishIndex(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    let invalidDishIndex = -1;
    if (dishes && Array.isArray(dishes)) {
        invalidDishIndex = dishes.findIndex((dish) => {
            const { quantity } = dish;
            return typeof quantity !== "number" || quantity <= 0 || quantity % 1 !== 0;
        });
    }
    if (invalidDishIndex !== -1) {
        next({
            status: 400,
            message: `Dish ${invalidDishIndex} must have a quantity that is a positive integer.`,
        });
    } else {
        next();
    }
}


//route handler create
//handles the creation of a new order by extracting the data from the request body
//creating a unique identifier for the order, and adding it to the collection of orders 
//before sending a successful response back to the client.
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
//responsible for retrieving a specific order
//uses locals from orderExists middleware
function read(req, res, next) {
    res.json({ data: res.locals.order });
}

//middleware to validate status property before updating
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
//responsible for updating an existing order
//uses locals to find order from orderExists middleware
function update(req, res, next) {
    const { deliverTo, mobileNumber, dishes } = req.body.data;
    const { order } = res.locals;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    res.json({ data: order });
}


//middleware to validate delete status property before deleting 
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
//deletes an order from the orders array based on the id of the order
//sends a status resposne after the delete is complete
function destroy(req, res, next) {
    const index = orders.findIndex((order) => order.id === res.locals.order.id);
    orders.splice(index, 1);
    res.sendStatus(204);
}

//route handler list 
//returns a list of orders
function list(req, res, next) {
    res.json({ data: orders });
}

module.exports = {
    list,
    create: [deliverToExists, mobileNumberExists, dishesExist, checkDishIndex, create],
    read: [orderExists, read],
    update: [orderExists, deliverToExists, mobileNumberExists, dishesExist, checkDishIndex, checkUpdateStatus, orderIdMatch, update],
    destroy: [orderExists, checkDestroyStatus, destroy],
};

