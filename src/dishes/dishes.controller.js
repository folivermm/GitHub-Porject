const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

//middleware to check for dish existance 
//finds specified dish from the collection of dishes 
//makes finding a dish accessible to subsequent route handlers
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        next();
    } else {
        next({ status: 404, message: `dish does net exist ${dishId}` });
    }
}

//middleware to check dish id matches route id 
//ensures that when updating a dish, the "id" provided in the request body 
//matches the "dishId" specified in the URL route.
//helps prevent accidental changes to the wrong dish
function dishIdMatch(req, res, next) {
    if (!req.body.data.id) {
        next();
    }
    if (req.body.data.id !== req.params.dishId) {
        next({ status: 400, message: `Dish id: ${req.body.data.id} does not match route id: ${req.params.dishId}` });
    }
    next();
}

//middlware to validade dish property name 
//ensures that a dish being created or updated contains a valid and non-empty name
//helps prevent dishes with missing names from being stored 
function getDishName(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (!name || name === "") {
        next({ status: 400, message: 'Dish must include a name' });
    } else {
        next();
    }
}
//middleware to validate dish description property 
//ensures that a dish being created or updated contains a valid and non-empty description
//helps prevent dishes with missing descriptions from being stored
function getDishDescription(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (!description || description === "") {
        next({ status: 400, message: 'Dish must include a description' });
    } else {
        next();
    }
}

//middleware to validate dish price property 
//ensures that a dish being created or updated contains a price
//helps prevent dishes with missing price from being stored
function getDishPrice(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (!price) {
        next({ status: 400, message: 'Dish must include a price' });
    } else {
        next();
    }
}

//middleware to validate price is a positive number
//ensures that a dish being created or updated contains a price with a postive number
//prevents invalid or negative prices from being stored 
function completeDishPrice(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)) {
        next({ status: 400, message: 'Dish must have a price that is an integer greater than 0' });
    } else {
        next();
    }
}

//middleware to validate dish image property 
//ensures that the image of a dish is provided and contains a valid URL
//prevents broken images and only valid image URLs are used for dish images
function getDishImage(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (!image_url || image_url === "") {
        next({ status: 400, message: 'Dish must include an image_url' });
    } else {
        next();
    }
}

//route handler create
//handles the creation of a new dish by extracting the data from the request body
//creating a unique identifier for the dish, and adding it to the collection of dishes 
//before sending a successful response back to the client.
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

//route handler read
//responsible for retrieving a specific dish
//uses locals from getDishById middleware
function read(req, res, next) {
    res.json({ data: res.locals.dish })
}

//route handler update
//responsible for updating an existing dish
//uses locals to find dish from getDishById middleware
function update(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
    const { dish } = res.locals;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.json({ data: dish })
}

//route handler list
//returns a list of dishes
function list(req, res, next) {
    res.json({ data: dishes });
}

module.exports = {
    list,
    create: [getDishName, getDishDescription, getDishPrice, completeDishPrice, getDishImage, create],
    read: [dishExists, read],
    update: [dishExists, dishIdMatch, getDishName, getDishDescription, getDishPrice, completeDishPrice, getDishImage, update],
}