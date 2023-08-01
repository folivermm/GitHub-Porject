const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

//middleware to check for dish existance 
function getDishById(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        next();
    } else {
        next({ status: 404, message: `dish does net exist ${dishId}` })
    }

}

//middlware for validading dishes properties
function validateDish(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    if (!name || name === "") {
        next({ status: 400, message: "Dish must include a name" })
    }
    if (!description || description === "") {
        next({ status: 400, message: "Dish must include a description" })
    }
    if (!price) {
        next({ status: 400, message: "Dish must include a price" })
    }
    if (price <= 0 || !Number.isInteger(price)) {
        next({ status: 400, message: "Dish must have a price that is an integer greater than 0" })
    }
    if (!image_url || image_url === "") {
        next({ status: 400, message: "Dish must include a image_url" })
    }
    next();
}

//middleware to check dish id matches route id 
function dishIdMatch(req, res, next) {
    if (!req.body.data.id) {
        next();
    }
    if (req.body.data.id !== req.params.dishId) {
        next({ status: 400, message: `Dish id: ${req.body.data.id} does not match route id: ${req.params.dishId}` });
    }
    next();
}

//route handlers create, read, update, list
function create(req, res, next) {
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function read(req, res, next) {
    res.json({ data: res.locals.dish })
}

function update(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
    const { dish } = res.locals;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.json({ data: dish })
}

function list(req, res, next) {
    res.json({ data: dishes })
}
module.exports = {
    list,
    create: [validateDish, create],
    read: [getDishById, read],
    update: [getDishById, validateDish, dishIdMatch, update],
}